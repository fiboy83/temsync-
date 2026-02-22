'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Trash2, Archive, X, Send } from 'lucide-react';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserProfile } from '@/app/page';

interface Comment {
  id: string;
  username: string;
  avatar: string;
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
  const [isFocusOpen, setIsFocusOpen] = useState(false);
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
  const hueColorMuted = `hsl(${post.themeHue}, 100%, 64%, 0.45)`;
  const hueColorGlow = `0 10px 40px -15px hsl(${post.themeHue}, 100%, 64%, 0.4)`;
  const currentUserHueColor = currentUser ? `hsl(${currentUser.themeHue}, 100%, 64%)` : 'hsl(var(--primary))';

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
      avatar: currentUser?.avatar || `https://picsum.photos/seed/${currentUser?.username || 'anon'}/100/100`,
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
    <>
      <div 
        className="bg-card/30 backdrop-blur-3xl rounded-[1.75rem] overflow-hidden animate-fade-in border transition-all duration-300 group mb-8 cursor-pointer"
        style={{ 
          borderColor: hueColorMuted,
          boxShadow: hueColorGlow,
          animationDelay: `${index * 50}ms`
        }}
        onClick={() => setIsFocusOpen(true)}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={`/profile/${post.username.toLowerCase()}`} 
              className="relative w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" 
              style={{ borderColor: hueColor }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={post.profilePicture} alt={post.username} fill className="object-cover" />
            </Link>
            <div className="text-left">
              <Link 
                href={`/profile/${post.username.toLowerCase()}`} 
                className="font-bold text-[14px] tracking-tight block lowercase" 
                style={{ color: hueColor }}
                onClick={(e) => e.stopPropagation()}
              >
                {post.username.toLowerCase()}
              </Link>
              <p className="text-[10px] text-white/40 font-bold lowercase tracking-widest">
                {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()}
              </p>
            </div>
          </div>
          
          {isOwner && (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-white/30 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-3xl border-white/20 rounded-xl min-w-[140px] shadow-2xl">
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
            </div>
          )}
        </div>

        <div className={cn("px-5 pb-4 text-left", hasMedia && "pb-5")}>
          <p className="text-[15px] leading-relaxed text-white/90 lowercase">
            {displayedContent}
          </p>
          {isTooLong && (
            <span className="text-[11px] font-bold mt-2 lowercase tracking-widest" style={{ color: hueColor }}>
              {isExpanded ? 'less' : 'more'}
            </span>
          )}
        </div>

        {hasMedia && (
          <div className="px-4 pb-4">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/20 bg-black/40">
              {post.videoUrl ? (
                <video src={post.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : post.imageUrl ? (
                <Image src={post.imageUrl} alt="Post Content" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : null}
            </div>
          </div>
        )}

        <div className="px-5 py-3.5 flex items-center justify-between border-t border-white/20">
          <div className="flex items-center gap-7">
            <button onClick={handleLike} className="flex items-center gap-2.5 group/btn">
              <Heart className={cn("w-5 h-5 transition-all", isLiked ? "fill-current scale-110" : "text-white/30 group-hover/btn:scale-110")} style={{ color: isLiked ? hueColor : undefined }} />
              <span className="text-[13px] font-bold text-white/50" style={{ color: isLiked ? hueColor : undefined }}>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <div className="flex items-center gap-2.5 group/btn">
              <MessageCircle className="w-5 h-5 text-white/30 group-hover/btn:scale-110 transition-all" />
              <span className="text-[13px] font-bold text-white/50">{post.comments + localComments.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={toggleBookmark} className="p-1 group/bookmark">
              <Bookmark className={cn("w-5 h-5 transition-all", isBookmarked ? "fill-current scale-110" : "text-white/30 group-hover/bookmark:scale-110")} style={{ color: isBookmarked ? hueColor : undefined }} />
            </button>
            <button onClick={handleShare} className="p-1 text-white/30 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Focus Mode Dialog */}
      <Dialog open={isFocusOpen} onOpenChange={setIsFocusOpen}>
        <DialogContent className="sm:max-w-[480px] h-[90vh] bg-card/95 backdrop-blur-3xl border-white/20 rounded-[2.5rem] p-0 overflow-hidden flex flex-col shadow-2xl">
          <DialogHeader className="hidden">
            <DialogTitle>Post Focus</DialogTitle>
          </DialogHeader>

          {/* Fixed Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-2" style={{ borderColor: hueColor }}>
                <Image src={post.profilePicture} alt={post.username} fill className="object-cover" />
              </div>
              <Link href={`/profile/${post.username.toLowerCase()}`} className="text-sm font-bold lowercase hover:underline" style={{ color: hueColor }}>{post.username}</Link>
            </div>
            <button 
              onClick={() => setIsFocusOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Original Post Content */}
            <div className="p-6 space-y-4">
              <p className="text-[16px] leading-relaxed text-white/90 lowercase">
                {post.content}
              </p>
              {hasMedia && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/20 bg-black/40 shadow-xl">
                  {post.videoUrl ? (
                    <video src={post.videoUrl} className="w-full h-full object-cover" controls autoPlay muted />
                  ) : post.imageUrl ? (
                    <Image src={post.imageUrl} alt="Focus Media" fill className="object-cover" />
                  ) : null}
                </div>
              )}
              
              <div className="flex items-center gap-6 pt-2 pb-4 border-b border-white/5">
                <button onClick={handleLike} className="flex items-center gap-2 group">
                  <Heart className={cn("w-5 h-5", isLiked ? "fill-current" : "text-white/30 group-hover:text-white")} style={{ color: isLiked ? hueColor : undefined }} />
                  <span className="text-[13px] font-bold text-white/40">{post.likes + (isLiked ? 1 : 0)}</span>
                </button>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-white/30" />
                  <span className="text-[13px] font-bold text-white/40">{post.comments + localComments.length} signals</span>
                </div>
              </div>
            </div>

            {/* Comments Area */}
            <div className="px-6 pb-24 space-y-4">
              {localComments.map((comment) => (
                <div key={comment.id} className="flex flex-col items-start animate-fade-in">
                  <div 
                    className="bg-white/10 backdrop-blur-3xl p-3 rounded-2xl border shadow-xl w-fit max-w-[85%] relative overflow-hidden" 
                    style={{ 
                      borderLeft: `4px solid hsl(${comment.themeHue}, 100%, 64%)`,
                      borderColor: `hsl(${comment.themeHue}, 100%, 64%, 0.2)`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div 
                        className="relative w-6 h-6 rounded-full overflow-hidden border"
                        style={{ borderColor: `hsl(${comment.themeHue}, 100%, 64%)` }}
                      >
                        <Image src={comment.avatar} alt={comment.username} fill className="object-cover" />
                      </div>
                      <Link 
                        href={`/profile/${comment.username.toLowerCase()}`}
                        className="text-[11px] font-bold lowercase hover:underline transition-all" 
                        style={{ color: `hsl(${comment.themeHue}, 100%, 64%)` }}
                      >
                        {comment.username}
                      </Link>
                      <span className="text-[8px] text-white/20 font-bold tracking-widest uppercase ml-auto">
                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[13px] text-white/90 leading-relaxed lowercase">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
              {localComments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[11px] text-white/20 italic lowercase tracking-widest">no signals in this thread yet...</p>
                </div>
              )}
            </div>
          </div>

          {/* Comment Input Fixed at Bottom */}
          <div className="p-4 bg-background/80 backdrop-blur-3xl border-t border-white/10 sticky bottom-0">
            <form onSubmit={handleAddComment} className="flex gap-3 max-w-md mx-auto">
              <Input 
                placeholder="beam thoughts..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="h-12 text-[14px] bg-white/5 border-white/20 rounded-xl focus:ring-0 lowercase placeholder:lowercase placeholder:text-white/20 backdrop-blur-xl"
              />
              <button 
                type="submit" 
                className="h-12 px-6 rounded-xl text-black font-bold text-[12px] lowercase transition-all active:scale-95 shadow-lg"
                style={{ 
                  backgroundColor: currentUserHueColor,
                  boxShadow: `0 8px 20px -6px ${currentUserHueColor}66` 
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
