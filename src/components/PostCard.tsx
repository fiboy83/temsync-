'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  index: number;
  onProfileClick?: (hue: number) => void;
}

export function PostCard({ post, index, onProfileClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);

  // Local theme variables for this specific card
  const cardStyle = {
    '--post-primary': `${post.themeHue} 100% 64%`,
    '--post-secondary': `${(post.themeHue + 180) % 360} 100% 50%`,
    animationDelay: `${index * 150}ms`,
  } as React.CSSProperties;

  const handleInteraction = (type: 'like' | 'comment' | 'share' | 'profile') => {
    // Sinkronisasi seluruh layout temsync dengan warna avatar pemilik post
    if (onProfileClick) {
      onProfileClick(post.themeHue);
    }
    
    if (type === 'like') {
      setIsLiked(!isLiked);
    } else if (type === 'comment') {
      setIsCommented(!isCommented);
    }
  };

  return (
    <div 
      className="bg-card/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl mb-6 animate-fade-in border border-white/5 group"
      style={cardStyle}
    >
      <div className="p-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          onClick={() => handleInteraction('profile')}
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

      <div className="relative aspect-[4/5] w-full overflow-hidden">
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

      <div className="p-3 flex items-center justify-between border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleInteraction('like')}
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
            onClick={() => handleInteraction('comment')}
            className="flex items-center gap-1.5 group/btn"
          >
            <MessageCircle 
              className={cn(
                "w-4 h-4 transition-all duration-300",
                isCommented 
                  ? "fill-[hsl(var(--post-secondary))] text-[hsl(var(--post-secondary))] scale-110" 
                  : "text-white/30 group-hover/btn:text-[hsl(var(--post-secondary))]"
              )} 
            />
            <span className={cn(
              "text-[10px] font-bold transition-colors",
              isCommented ? "text-[hsl(var(--post-secondary))]" : "text-white/50"
            )}>
              {post.comments + (isCommented ? 1 : 0)}
            </span>
          </button>
        </div>
        
        <button 
          onClick={() => handleInteraction('share')}
          className="p-1.5 text-white/30 hover:text-[hsl(var(--post-primary))] transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}