'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Trash2, Archive } from 'lucide-react';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
const POSTS_STORAGE_KEY = 'temsync_all_posts';

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

  const handleDelete = () => {
    const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
    if (savedPosts) {
      const allPosts: any[] = JSON.parse(savedPosts);
      const filteredPosts = allPosts.filter(p => p.id !== post.id);
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(filteredPosts));
      window.dispatchEvent(new Event('postsUpdated'));
    }
  };

  const handleArchive = () => {
    const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
    if (savedPosts) {
      const allPosts: any[] = JSON.parse(savedPosts);
      const updatedPosts = allPosts.map(p => {
        if (p.id === post.id) return { ...p, isArchived: !p.isArchived };
        return p;
      });
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      window.dispatchEvent(new Event('postsUpdated'));
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'temsync signal',
      text: `${post.username}: ${post.content}`,
      url: window.location.origin + `/profile/${post.username.toLowerCase()}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
      } catch (err) {
        // fallback failed
      }
    }
  };

  const hueColor = `hsl(${post.themeHue}, 100%, 64%)`;
  const hueColorMuted = `hsl(${post.themeHue}, 100%, 64%, 0.4)`;
  const hueColorGlow = `0 10px 40px -15px hsl(${post.themeHue}, 100%, 64%, 0.4)`;

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
  const isOwner = currentUser?.username.toLowerCase() === post.username.toLowerCase();

  return (
    <div 
      className="bg-card/30 backdrop-blur-3xl rounded-[1.75rem] overflow-hidden animate-fade-in border transition-all duration-300 group mb-6"
      style={{ 
        borderColor: hueColorMuted,
        boxShadow: hueColorGlow,
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.username.toLowerCase()}`} className="relative w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: hueColor }}>
            <Image src={post.profilePicture} alt={post.username} fill className="object-cover" />
          </Link>
          <div className="text-left">
            <Link href={`/profile/${post.username.toLowerCase()}`} className="font-bold text-[14px] tracking-tight block lowercase" style={{ color: hueColor }}>
              {post.username.toLowerCase()}
            </Link>
            <p className="text-[10px] text-white/40 font-bold lowercase tracking-widest">
              {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()}
            </p>
          </div>
        </div>
        
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-white/30 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-3xl border-white/10 rounded-xl min-w-[140px] shadow-2xl">
              <DropdownMenuItem onClick={handleArchive} className="text-[12px] font-bold lowercase tracking-widest text-white/70 hover:text-white flex items-center gap-2 cursor-pointer py-3">
                <Archive className="w-4 h-4" />
                {post.isArchived ? 'unarchive' : 'archive'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-[12px] font-bold lowercase tracking-widest text-destructive hover:text-destructive flex items-center gap-2 cursor-pointer py-3">
                <Trash2 className="w-4 h-4" />
                delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className={cn("px-5 pb-4 text-left", hasMedia && "pb-5")}>
        <p className="text-[15px] leading-relaxed text-white/90 lowercase">
          {displayedContent}
        </p>
        {isTooLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold mt-2 lowercase tracking-widest hover:underline"
            style={{ color: hueColor }}
          >
            {isExpanded ? 'less' : 'more'}
          </button>
        )}
      </div>

      {hasMedia && (
        <div className="px-4 pb-4">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            {post.videoUrl ? (
              <video src={post.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : post.imageUrl ? (
              <Image src={post.imageUrl} alt="Post Content" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : null}
          </div>
        </div>
      )}

      <div className="px-5 py-3.5 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-7">
          <button onClick={handleLike} className="flex items-center gap-2.5 group/btn">
            <Heart className={cn("w-5 h-5 transition-all", isLiked ? "fill-current scale-110" : "text-white/30 group-hover/btn:scale-110")} style={{ color: isLiked ? hueColor : undefined }} />
            <span className="text-[13px] font-bold text-white/50" style={{ color: isLiked ? hueColor : undefined }}>{post.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2.5 group/btn">
            <MessageCircle className={cn("w-5 h-5 transition-all", showComments ? "fill-current scale-110" : "text-white/30 group-hover/btn:scale-110")} style={{ color: showComments ? hueColor : undefined }} />
            <span className="text-[13px] font-bold text-white/50" style={{ color: showComments ? hueColor : undefined }}>{post.comments + localComments.length}</span>
          </button>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleBookmark} className="p-1 group/bookmark">
            <Bookmark className={cn("w-5 h-5 transition-all", isBookmarked ? "fill-current scale-110" : "text-white/30 group-hover/bookmark:scale-110")} style={{ color: isBookmarked ? hueColor : undefined }} />
          </button>
          <button onClick={handleShare} className="p-1 text-white/30 hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="px-5 pb-5 pt-3 border-t border-white/10 animate-in slide-in-from-top-2 duration-300 bg-white/5 backdrop-blur-3xl">
          <div className="max-h-56 overflow-y-auto space-y-4 mb-4 text-left custom-scrollbar pr-2">
            {localComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-2 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold lowercase" style={{ color: `hsl(${comment.themeHue}, 100%, 64%)` }}>{comment.username}</span>
                  <span className="text-[10px] text-white/30 font-bold">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</span>
                </div>
                <div 
                  className="text-[14px] text-white/80 bg-white/10 backdrop-blur-3xl p-3.5 rounded-2xl border-l-3 shadow-xl" 
                  style={{ borderLeftColor: `hsl(${comment.themeHue}, 100%, 64%, 0.5)`, boxShadow: `0 4px 20px -10px hsl(${comment.themeHue}, 100%, 64%, 0.2)` }}
                >
                  {comment.text}
                </div>
              </div>
            ))}
            {localComments.length === 0 && (
              <p className="text-[11px] text-white/20 italic text-center py-4">no signals in the thread yet...</p>
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-3">
            <Input 
              placeholder="beam thoughts..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-11 text-[13px] bg-white/10 border-white/10 rounded-xl focus:ring-0 lowercase placeholder:lowercase placeholder:text-white/20 backdrop-blur-xl"
            />
            <button type="submit" className="h-11 px-6 rounded-xl text-white font-bold text-[12px] lowercase transition-all active:scale-95 shadow-lg" style={{ backgroundColor: hueColor }}>send</button>
          </form>
        </div>
      )}
    </div>
  );
}
