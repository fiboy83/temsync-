'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Reply } from 'lucide-react';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/app/page';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  likes?: number;
  isLiked?: boolean;
  themeHue: number;
}

interface PostCardProps {
  post: Post;
  index: number;
  currentUser?: UserProfile;
}

export function PostCard({ post, index, currentUser }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Load interactions and comments from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`temsync_post_interaction_${post.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setIsLiked(parsed.liked || false);
      setLocalComments(parsed.comments || []);
    }
  }, [post.id]);

  const saveToLocal = (liked: boolean, comments: Comment[]) => {
    localStorage.setItem(`temsync_post_interaction_${post.id}`, JSON.stringify({
      liked,
      comments
    }));
  };

  const hueColor = `hsl(${post.themeHue}, 100%, 64%)`;
  const hueColorMuted = `hsl(${post.themeHue}, 100%, 64%, 0.2)`;
  const hueColorDeepMuted = `hsl(${post.themeHue}, 100%, 64%, 0.05)`;
  const hueColorGlow = `0 0 15px -5px hsl(${post.themeHue}, 100%, 64%, 0.2)`;

  const cardStyle = {
    '--post-primary': `${post.themeHue} 100% 64%`,
    boxShadow: hueColorGlow,
    borderColor: hueColorMuted,
    animationDelay: `${index * 100}ms`,
  } as React.CSSProperties;

  const handleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    saveToLocal(nextState, localComments);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      username: currentUser?.username || 'anonymous',
      text: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      themeHue: currentUser?.themeHue ?? 266,
    };

    const updatedComments = [...localComments, comment];
    setLocalComments(updatedComments);
    setNewComment('');
    saveToLocal(isLiked, updatedComments);
  };

  const handleCommentLike = (commentId: string) => {
    const updatedComments = localComments.map(c => {
      if (c.id === commentId) {
        const currentlyLiked = c.isLiked || false;
        return {
          ...c,
          isLiked: !currentlyLiked,
          likes: (c.likes || 0) + (currentlyLiked ? -1 : 1)
        };
      }
      return c;
    });
    setLocalComments(updatedComments);
    saveToLocal(isLiked, updatedComments);
  };

  const hasMedia = !!post.imageUrl || !!post.videoUrl;
  const isShortText = post.content.length < 20;
  const isTooLong = post.content.length > 200; 
  
  const displayedContent = isTooLong && !isExpanded 
    ? `${post.content.substring(0, 200)}...` 
    : post.content;

  return (
    <div 
      className="bg-card/30 backdrop-blur-2xl rounded-[1.75rem] overflow-hidden mb-4 animate-fade-in border transition-all duration-300 group"
      style={cardStyle}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link href={`/profile/${post.username.toLowerCase()}`} className="relative w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: hueColor }}>
            <Image 
              src={post.profilePicture} 
              alt={post.username} 
              fill 
              className="object-cover"
            />
          </Link>
          <div className="text-left">
            <Link href={`/profile/${post.username.toLowerCase()}`} className="font-bold text-xs tracking-tight transition-colors hover:underline block lowercase" style={{ color: hueColor }}>
              {post.username.toLowerCase()}
            </Link>
            <p className="text-[8px] text-white/60 font-medium lowercase tracking-[0.15em]">
              {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()}
            </p>
          </div>
        </div>
        <button className="p-1.5 text-white/40 hover:text-white/70 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className={cn("relative w-full overflow-hidden", hasMedia ? "aspect-[4/5]" : "min-h-[80px] flex items-center p-5")}>
        {hasMedia ? (
          <div className="absolute inset-1.5 rounded-[1.25rem] overflow-hidden border border-white/5">
            {post.videoUrl ? (
              <video 
                src={post.videoUrl} 
                className="w-full h-full object-cover" 
                autoPlay 
                muted 
                loop 
                playsInline
              />
            ) : post.imageUrl ? (
              <Image 
                src={post.imageUrl} 
                alt="Holographic Post" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
            
            <div className="absolute bottom-3 left-3 right-3 bg-black/30 backdrop-blur-lg p-3 rounded-xl border border-white/5">
              <div className="text-left">
                <p className={cn(
                  "font-medium leading-tight text-white/95",
                  isShortText ? "text-base holographic-text font-headline italic" : "text-[11px]"
                )}>
                  {displayedContent}
                </p>
                {isTooLong && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[9px] font-bold mt-1 lowercase tracking-widest hover:underline"
                    style={{ color: hueColor }}
                  >
                    {isExpanded ? 'less' : 'more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full text-left">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-10 pointer-events-none" />
             <div className="px-2">
                <p className={cn(
                  "font-headline font-medium leading-snug italic",
                  isShortText ? "text-xl holographic-text" : "text-sm text-white/80"
                )}>
                  "{displayedContent}"
                </p>
                {isTooLong && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[9px] font-bold mt-1.5 lowercase tracking-widest hover:underline"
                    style={{ color: hueColor }}
                  >
                    {isExpanded ? 'less' : 'more'}
                  </button>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1.5 group/btn"
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-all duration-300",
                isLiked 
                  ? "fill-current scale-110" 
                  : "text-white/40 group-hover/btn:scale-110"
              )} 
              style={{ color: isLiked ? hueColor : undefined }}
            />
            <span className={cn(
              "text-[10px] font-bold transition-colors",
              isLiked ? "text-white" : "text-white/70"
            )}
            style={{ color: isLiked ? hueColor : undefined }}
            >
              {post.likes + (isLiked ? 1 : 0)}
            </span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 group/btn"
          >
            <MessageCircle 
              className={cn(
                "w-4 h-4 transition-all duration-300",
                showComments 
                  ? "fill-current scale-110" 
                  : "text-white/40 group-hover/btn:scale-110"
              )} 
              style={{ color: showComments ? hueColor : undefined }}
            />
            <span className={cn(
              "text-[10px] font-bold transition-colors",
              showComments ? "text-white" : "text-white/70"
            )}
            style={{ color: showComments ? hueColor : undefined }}
            >
              {post.comments + localComments.length}
            </span>
          </button>
        </div>
        
        <button className="p-1.5 text-white/40 hover:text-white transition-colors">
          <Share2 className="w-4 h-4" style={{ color: hueColor }} />
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div 
          className="px-4 pb-4 pt-1 animate-in slide-in-from-top-1 duration-200 border-t"
          style={{ borderColor: hueColorDeepMuted }}
        >
          <div className="max-h-48 overflow-y-auto space-y-2.5 mb-3 custom-scrollbar text-left scroll-smooth">
            {localComments.map((comment) => {
              const commentHueColor = `hsl(${comment.themeHue}, 100%, 64%)`;
              const commentHueColorMuted = `hsl(${comment.themeHue}, 100%, 64%, 0.15)`;
              
              return (
                <div key={comment.id} className="flex flex-col gap-0.5 group/comment rounded-xl p-0.5">
                  <div className="flex justify-between items-center px-1">
                    <Link href={`/profile/${comment.username.toLowerCase()}`} className="text-[9px] font-bold lowercase tracking-wider hover:underline" style={{ color: commentHueColor }}>
                      {comment.username.toLowerCase()}
                    </Link>
                    <span className="text-[7px] text-white/50">
                      {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                    </span>
                  </div>
                  <div 
                    className="text-[11px] text-white/85 bg-white/5 p-2 rounded-xl rounded-tl-none border transition-colors group-hover/comment:bg-white/10"
                    style={{ borderColor: commentHueColorMuted }}
                  >
                    {comment.text}
                    
                    <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-white/5 opacity-60 group-hover/comment:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCommentLike(comment.id)}
                        className="flex items-center gap-1 hover:scale-110 transition-transform"
                      >
                        <Heart 
                          className={cn("w-2.5 h-2.5", comment.isLiked && "fill-current")} 
                          style={{ color: comment.isLiked ? commentHueColor : 'white' }} 
                        />
                        {comment.likes && comment.likes > 0 ? (
                          <span className="text-[7px] font-bold" style={{ color: comment.isLiked ? commentHueColor : 'white' }}>{comment.likes}</span>
                        ) : null}
                      </button>
                      
                      <button className="flex items-center gap-1 hover:scale-110 transition-transform">
                        <Reply className="w-2.5 h-2.5 text-white" />
                        <span className="text-[7px] font-bold text-white lowercase tracking-tighter">reply</span>
                      </button>
                      
                      <button className="flex items-center gap-1 hover:scale-110 transition-transform ml-auto">
                        <Share2 className="w-2.5 h-2.5 text-white opacity-40" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {localComments.length === 0 && (
              <p className="text-[8px] text-white/50 text-center py-4 italic lowercase tracking-widest">
                aura is silent...
              </p>
            )}
          </div>
          
          <form onSubmit={handleAddComment} className="flex gap-1.5">
            <div className="relative flex-1">
              <Input 
                placeholder="beam thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="h-8 text-[11px] bg-white/5 border-white/10 rounded-xl focus:ring-1 focus:ring-offset-0 pr-8"
                style={{ 
                  '--tw-ring-color': `hsl(${currentUser?.themeHue ?? 266}, 100%, 64%, 0.15)`,
                  borderColor: newComment.trim() ? `hsl(${currentUser?.themeHue ?? 266}, 100%, 64%, 0.15)` : undefined 
                } as React.CSSProperties}
              />
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="h-8 w-8 rounded-xl shadow-md transition-all active:scale-90 disabled:opacity-20"
              style={{ 
                backgroundColor: `hsl(${currentUser?.themeHue ?? 266}, 100%, 64%)`,
                boxShadow: newComment.trim() ? `0 2px 8px -1px hsl(${currentUser?.themeHue ?? 266}, 100%, 64%, 0.3)` : 'none'
              }}
              disabled={!newComment.trim()}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
