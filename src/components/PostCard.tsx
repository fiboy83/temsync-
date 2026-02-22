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
  onProfileClick?: (hue: number) => void;
  currentUser?: { username: string };
}

export function PostCard({ post, index, onProfileClick, currentUser }: PostCardProps) {
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

  const cardStyle = {
    '--post-primary': `${post.themeHue} 100% 64%`,
    '--post-secondary': `${(post.themeHue + 180) % 360} 100% 50%`,
    animationDelay: `${index * 150}ms`,
  } as React.CSSProperties;

  const handleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    saveToLocal(nextState, localComments);
    if (onProfileClick) onProfileClick(post.themeHue);
  };

  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick(post.themeHue);
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
    if (onProfileClick) onProfileClick(post.themeHue);
  };

  return (
    <div 
      className="bg-card/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl mb-6 animate-fade-in border border-white/5 group"
      style={cardStyle}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all active:scale-95"
          onClick={handleProfileClick}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2" style={{ borderColor: `hsl(${post.themeHue}, 100%, 64%)` }}>
            <Image 
              src={post.profilePicture} 
              alt={post.username} 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-xs tracking-tight text-white/90">{post.username}</h3>
            <p className="text-[8px] text-white/40 font-medium lowercase">
              {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button className="p-1 text-white/20 hover:text-white/60">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden cursor-pointer" onClick={handleProfileClick}>
        <Image 
          src={post.imageUrl} 
          alt="Holographic Backdrop" 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/5 to-black/40" />
        
        <div className="absolute bottom-3 left-3 right-3 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-xs font-medium leading-relaxed text-white/95">
            {post.content}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center justify-between border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1.5 group/btn"
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-all duration-300",
                isLiked 
                  ? "fill-[hsl(var(--post-primary))] text-[hsl(var(--post-primary))] scale-110" 
                  : "text-white/30 group-hover/btn:text-[hsl(var(--post-primary))]"
              )} 
            />
            <span className={cn(
              "text-[10px] font-bold transition-colors",
              isLiked ? "text-[hsl(var(--post-primary))]" : "text-white/50"
            )}>
              {post.likes + (isLiked ? 1 : 0)}
            </span>
          </button>
          
          <button 
            onClick={() => {
              setShowComments(!showComments);
              handleProfileClick();
            }}
            className="flex items-center gap-1.5 group/btn"
          >
            <MessageCircle 
              className={cn(
                "w-4 h-4 transition-all duration-300",
                showComments 
                  ? "fill-[hsl(var(--post-secondary))] text-[hsl(var(--post-secondary))] scale-110" 
                  : "text-white/30 group-hover/btn:text-[hsl(var(--post-secondary))]"
              )} 
            />
            <span className={cn(
              "text-[10px] font-bold transition-colors",
              showComments ? "text-[hsl(var(--post-secondary))]" : "text-white/50"
            )}>
              {post.comments + localComments.length}
            </span>
          </button>
        </div>
        
        <button className="p-1.5 text-white/30 hover:text-[hsl(var(--post-primary))] transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="p-3 border-t border-white/5 bg-white/5 animate-in slide-in-from-top-2 duration-300">
          <div className="max-h-40 overflow-y-auto space-y-3 mb-3 custom-scrollbar">
            {localComments.map((comment) => (
              <div key={comment.id} className="flex flex-col">
                <span className="text-[10px] font-bold text-primary">{comment.username}</span>
                <span className="text-xs text-white/80">{comment.text}</span>
              </div>
            ))}
            {localComments.length === 0 && (
              <p className="text-[10px] text-white/30 text-center py-2 italic">Be the first to sync a thought...</p>
            )}
          </div>
          
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input 
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-8 text-xs bg-white/5 border-white/10 rounded-xl focus:ring-primary/30"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-8 w-8 rounded-xl bg-primary hover:bg-primary/80"
              disabled={!newComment.trim()}
            >
              <Send className="w-3 h-3 text-white" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
