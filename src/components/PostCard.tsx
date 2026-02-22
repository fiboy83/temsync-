'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

interface PostCardProps {
  post: Post;
  index: number;
  currentUser?: { username: string };
}

export function PostCard({ post, index, currentUser }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

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
  const hueColorGlow = `0 0 25px -5px hsl(${post.themeHue}, 100%, 64%, 0.3)`;

  const cardStyle = {
    '--post-primary': `${post.themeHue} 100% 64%`,
    boxShadow: hueColorGlow,
    borderColor: hueColorMuted,
    animationDelay: `${index * 150}ms`,
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
      username: currentUser?.username || 'Anonymous',
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...localComments, comment];
    setLocalComments(updatedComments);
    setNewComment('');
    saveToLocal(isLiked, updatedComments);
  };

  return (
    <div 
      className="bg-card/30 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden mb-8 animate-fade-in border transition-all duration-500 group"
      style={cardStyle}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: hueColor }}>
            <Image 
              src={post.profilePicture} 
              alt={post.username} 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white/90">{post.username}</h3>
            <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">
              {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button className="p-2 text-white/20 hover:text-white/60 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden mx-auto">
        <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner">
          <Image 
            src={post.imageUrl} 
            alt="Holographic Post" 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          
          <div className="absolute bottom-4 left-4 right-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-2xl">
            <p className="text-xs font-medium leading-relaxed text-white/95">
              {post.content}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className="flex items-center gap-2 group/btn"
          >
            <Heart 
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isLiked 
                  ? "fill-current scale-110" 
                  : "text-white/30 group-hover/btn:scale-110"
              )} 
              style={{ color: isLiked ? hueColor : undefined }}
            />
            <span className={cn(
              "text-xs font-bold transition-colors",
              isLiked ? "text-white" : "text-white/40"
            )}
            style={{ color: isLiked ? hueColor : undefined }}
            >
              {post.likes + (isLiked ? 1 : 0)}
            </span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 group/btn"
          >
            <MessageCircle 
              className={cn(
                "w-5 h-5 transition-all duration-300",
                showComments 
                  ? "fill-current scale-110" 
                  : "text-white/30 group-hover/btn:scale-110"
              )} 
              style={{ color: showComments ? hueColor : undefined }}
            />
            <span className={cn(
              "text-xs font-bold transition-colors",
              showComments ? "text-white" : "text-white/40"
            )}
            style={{ color: showComments ? hueColor : undefined }}
            >
              {post.comments + localComments.length}
            </span>
          </button>
        </div>
        
        <button className="p-2 text-white/30 hover:text-white transition-colors" style={{ color: hueColorMuted }}>
          <Share2 className="w-5 h-5" style={{ color: hueColor }} />
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
          <div className="max-h-48 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
            {localComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: hueColor }}>{comment.username}</span>
                  <span className="text-[8px] text-white/20">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className="text-xs text-white/70 bg-white/5 p-2 rounded-xl rounded-tl-none border border-white/5">{comment.text}</span>
              </div>
            ))}
            {localComments.length === 0 && (
              <p className="text-[10px] text-white/20 text-center py-4 italic uppercase tracking-widest">Aura is silent. Sync a thought...</p>
            )}
          </div>
          
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input 
              placeholder="Beam your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-10 text-xs bg-white/5 border-white/10 rounded-2xl focus:ring-0 focus:border-white/20"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 rounded-2xl shadow-lg transition-transform active:scale-90"
              style={{ backgroundColor: hueColor }}
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
