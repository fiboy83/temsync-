'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Reply, Bookmark } from 'lucide-react';
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
  onCurrentUserProfileClick?: () => void;
}

const BOOKMARKS_KEY = 'temsync_bookmarks';

export function PostCard({ post, index, currentUser, onCurrentUserProfileClick }: PostCardProps) {
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
  const hueColorMuted = `hsl(${post.themeHue}, 100%, 64%, 0.15)`;
  const hueColorDeepMuted = `hsl(${post.themeHue}, 100%, 64%, 0.05)`;
  const hueColorGlow = `0 4px 15px -10px hsl(${post.themeHue}, 100%, 64%, 0.3)`;

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

  const isSelf = currentUser?.username.toLowerCase() === post.username.toLowerCase();

  const handleProfileClick = (e: React.MouseEvent) => {
    if (isSelf && onCurrentUserProfileClick) {
      e.preventDefault();
      onCurrentUserProfileClick();
    }
  };

  const hasMedia = !!post.imageUrl || !!post.videoUrl;
  const isTooLong = post.content.length > 140; 
  const displayedContent = isTooLong && !isExpanded ? `${post.content.substring(0, 140)}...` : post.content;

  return (
    <div 
      className="bg-card/20 backdrop-blur-2xl rounded-[1.5rem] overflow-hidden mb-2 animate-fade-in border transition-all duration-300 group"
      style={{ 
        borderColor: hueColorMuted,
        boxShadow: hueColorGlow,
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSelf ? (
            <button onClick={handleProfileClick} className="relative w-7 h-7 rounded-full overflow-hidden border flex-shrink-0" style={{ borderColor: hueColor }}>
              <Image src={post.profilePicture} alt={post.username} fill className="object-cover" />
            </button>
          ) : (
            <Link href={`/profile/${post.username.toLowerCase()}`} className="relative w-7 h-7 rounded-full overflow-hidden border flex-shrink-0" style={{ borderColor: hueColor }}>
              <Image src={post.profilePicture} alt={post.username} fill className="object-cover" />
            </Link>
          )}
          <div className="text-left">
            {isSelf ? (
              <button onClick={handleProfileClick} className="font-bold text-[10px] tracking-tight block lowercase text-white/90">
                {post.username.toLowerCase()}
              </button>
            ) : (
              <Link href={`/profile/${post.username.toLowerCase()}`} className="font-bold text-[10px] tracking-tight block lowercase text-white/90">
                {post.username.toLowerCase()}
              </Link>
            )}
            <p className="text-[7px] text-white/60 font-bold lowercase tracking-widest">
              {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()}
            </p>
          </div>
        </div>
        <button className="p-1 text-white/40 hover:text-white transition-colors">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className={cn("px-3 pb-2 text-left", hasMedia && "pb-3")}>
        <p className="text-[11px] leading-relaxed text-white/80 lowercase">
          {displayedContent}
        </p>
        {isTooLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[7px] font-bold mt-1 lowercase tracking-widest hover:underline"
            style={{ color: hueColor }}
          >
            {isExpanded ? 'less' : 'more'}
          </button>
        )}
      </div>

      {hasMedia && (
        <div className="px-2 pb-2">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/20">
            {post.videoUrl ? (
              <video src={post.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : post.imageUrl ? (
              <Image src={post.imageUrl} alt="Post Content" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : null}
          </div>
        </div>
      )}

      <div className="px-3 py-1.5 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1.5 group/btn">
            <Heart className={cn("w-3.5 h-3.5 transition-all", isLiked ? "fill-current scale-110" : "text-white/40 group-hover/btn:scale-110")} style={{ color: isLiked ? hueColor : undefined }} />
            <span className="text-[9px] font-bold text-white/60" style={{ color: isLiked ? hueColor : undefined }}>{post.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 group/btn">
            <MessageCircle className={cn("w-3.5 h-3.5 transition-all", showComments ? "fill-current scale-110" : "text-white/40 group-hover/btn:scale-110")} style={{ color: showComments ? hueColor : undefined }} />
            <span className="text-[9px] font-bold text-white/60" style={{ color: showComments ? hueColor : undefined }}>{post.comments + localComments.length}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleBookmark} className="p-1 group/bookmark">
            <Bookmark className={cn("w-3.5 h-3.5 transition-all", isBookmarked ? "fill-current scale-110" : "text-white/40 group-hover/bookmark:scale-110")} style={{ color: isBookmarked ? hueColor : undefined }} />
          </button>
          <button className="p-1 text-white/40 hover:text-white transition-colors"><Share2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {showComments && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
          <div className="max-h-32 overflow-y-auto space-y-2 mb-2 text-left custom-scrollbar">
            {localComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold lowercase" style={{ color: `hsl(${comment.themeHue}, 100%, 64%)` }}>{comment.username}</span>
                  <span className="text-[7px] text-white/40 font-bold">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
                </div>
                <p className="text-[10px] text-white/80 bg-white/5 p-1.5 rounded-lg border-l-2" style={{ borderLeftColor: `hsl(${comment.themeHue}, 100%, 64%, 0.4)` }}>{comment.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-1.5">
            <Input 
              placeholder="beam thoughts..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-6 text-[9px] bg-white/5 border-white/10 rounded-lg focus:ring-0 lowercase placeholder:lowercase placeholder:text-white/20"
            />
            <button type="submit" className="h-6 px-3 rounded-lg text-white font-bold text-[8px] lowercase" style={{ backgroundColor: hueColor }}>send</button>
          </form>
        </div>
      )}
    </div>
  );
}
