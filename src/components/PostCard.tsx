'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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

const BOOKMARKS_KEY = 'temsync_bookmarks';

export function PostCard({ post, index, currentUser }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(`temsync_post_interaction_${post.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setIsLiked(parsed.liked || false);
      setLocalComments(parsed.comments || []);
    }

    const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    if (savedBookmarks) {
      const bookmarks = JSON.parse(savedBookmarks);
      setIsBookmarked(bookmarks.includes(post.id));
    }
  }, [post.id]);

  const saveToLocal = (liked: boolean, comments: Comment[]) => {
    localStorage.setItem(`temsync_post_interaction_${post.id}`, JSON.stringify({
      liked,
      comments
    }));
  };

  const toggleBookmark = () => {
    const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    let bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
    if (isBookmarked) {
      bookmarks = bookmarks.filter((id: string) => id !== post.id);
    } else {
      bookmarks.push(post.id);
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    setIsBookmarked(!isBookmarked);
    window.dispatchEvent(new Event('bookmarksUpdated'));
  };

  const hueColor = `hsl(${post.themeHue}, 100%, 64%)`;
  const hueColorMuted = `hsl(${post.themeHue}, 100%, 64%, 0.12)`;
  const hueColorGlow = `0 4px 15px -10px hsl(${post.themeHue}, 100%, 64%, 0.25)`;

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

  const hasMedia = !!post.imageUrl || !!post.videoUrl;
  const isTooLong = post.content.length > 140; 
  const displayedContent = isTooLong && !isExpanded ? `${post.content.substring(0, 140)}...` : post.content;

  return (
    <div 
      className="bg-card/15 backdrop-blur-2xl rounded-[1.25rem] overflow-hidden mb-1 animate-fade-in border transition-all duration-300 group"
      style={{ 
        borderColor: hueColorMuted,
        boxShadow: hueColorGlow,
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${post.username.toLowerCase()}`} className="relative w-8 h-8 rounded-full overflow-hidden border flex-shrink-0" style={{ borderColor: hueColor }}>
            <Image src={post.profilePicture} alt={post.username} fill className="object-cover" />
          </Link>
          <div className="text-left">
            <Link href={`/profile/${post.username.toLowerCase()}`} className="font-bold text-[12px] tracking-tight block lowercase text-white/90">
              {post.username.toLowerCase()}
            </Link>
            <p className="text-[9px] text-white/50 font-bold lowercase tracking-widest">
              {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()}
            </p>
          </div>
        </div>
        <button className="p-1 text-white/30 hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className={cn("px-4 pb-2 text-left", hasMedia && "pb-3")}>
        <p className="text-[13px] leading-relaxed text-white/80 lowercase">
          {displayedContent}
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

      {hasMedia && (
        <div className="px-3 pb-3">
          <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden border border-white/5 bg-black/10">
            {post.videoUrl ? (
              <video src={post.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : post.imageUrl ? (
              <Image src={post.imageUrl} alt="Post Content" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : null}
          </div>
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-5">
          <button onClick={handleLike} className="flex items-center gap-2 group/btn">
            <Heart className={cn("w-4 h-4 transition-all", isLiked ? "fill-current scale-110" : "text-white/30 group-hover/btn:scale-110")} style={{ color: isLiked ? hueColor : undefined }} />
            <span className="text-[11px] font-bold text-white/50" style={{ color: isLiked ? hueColor : undefined }}>{post.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 group/btn">
            <MessageCircle className={cn("w-4 h-4 transition-all", showComments ? "fill-current scale-110" : "text-white/30 group-hover/btn:scale-110")} style={{ color: showComments ? hueColor : undefined }} />
            <span className="text-[11px] font-bold text-white/50" style={{ color: showComments ? hueColor : undefined }}>{post.comments + localComments.length}</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleBookmark} className="p-1 group/bookmark">
            <Bookmark className={cn("w-4 h-4 transition-all", isBookmarked ? "fill-current scale-110" : "text-white/30 group-hover/bookmark:scale-110")} style={{ color: isBookmarked ? hueColor : undefined }} />
          </button>
          <button className="p-1 text-white/30 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
        </div>
      </div>

      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
          <div className="max-h-40 overflow-y-auto space-y-3 mb-3 text-left custom-scrollbar">
            {localComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold lowercase" style={{ color: `hsl(${comment.themeHue}, 100%, 64%)` }}>{comment.username}</span>
                  <span className="text-[9px] text-white/30 font-bold">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
                </div>
                <p className="text-[12px] text-white/80 bg-white/5 p-2 rounded-lg border-l-2" style={{ borderLeftColor: `hsl(${comment.themeHue}, 100%, 64%, 0.4)` }}>{comment.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input 
              placeholder="beam thoughts..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-8 text-[11px] bg-white/5 border-white/5 rounded-lg focus:ring-0 lowercase placeholder:lowercase placeholder:text-white/20"
            />
            <button type="submit" className="h-8 px-4 rounded-lg text-white font-bold text-[10px] lowercase" style={{ backgroundColor: hueColor }}>send</button>
          </form>
        </div>
      )}
    </div>
  );
}