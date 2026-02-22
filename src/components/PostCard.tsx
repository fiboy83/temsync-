import React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';

interface PostCardProps {
  post: Post;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  return (
    <div 
      className="bg-card rounded-3xl overflow-hidden shadow-xl shadow-primary/5 mb-8 animate-fade-in border border-white/50"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-secondary/30">
            <Image 
              src={post.profilePicture} 
              alt={post.username} 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">{post.username}</h3>
            <p className="text-[10px] text-foreground/40 font-medium">
              {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button className="p-1 text-foreground/30 hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden group">
        <Image 
          src={post.imageUrl} 
          alt="Holographic Backdrop" 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        
        <div className="absolute bottom-4 left-4 right-4 glass p-4 rounded-2xl">
          <p className="text-sm font-medium leading-relaxed text-foreground/90">
            {post.content}
          </p>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 group">
            <Heart className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold text-foreground/60">{post.likes}</span>
          </button>
          <button className="flex items-center gap-2 group">
            <MessageCircle className="w-5 h-5 text-foreground/40 group-hover:text-secondary transition-colors" />
            <span className="text-xs font-bold text-foreground/60">{post.comments}</span>
          </button>
        </div>
        <button className="p-2 text-foreground/40 hover:text-primary transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}