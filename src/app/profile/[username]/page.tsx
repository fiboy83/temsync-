'use client';

import React, { useEffect, useState, use } from 'react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { PostCard } from '@/components/PostCard';
import { ProfileSheet } from '@/components/ProfileSheet';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { Loader2, ArrowLeft, MoreVertical, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import type { UserProfile } from '@/app/page';

const POSTS_STORAGE_KEY = 'temsync_all_posts';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
  });
  const [viewedUser, setViewedUser] = useState<{ username: string, avatar: string, themeHue: number } | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      setCurrentUserProfile(JSON.parse(savedProfile));
    }

    async function loadUserContent() {
      try {
        const savedPostsJson = localStorage.getItem(POSTS_STORAGE_KEY);
        if (savedPostsJson) {
          const allPosts: Post[] = JSON.parse(savedPostsJson);
          const userPosts = allPosts.filter(p => p.username.toLowerCase() === username.toLowerCase());
          setPosts(userPosts);

          if (username.toLowerCase() === currentUserProfile.username.toLowerCase()) {
            setViewedUser(currentUserProfile);
          } else if (userPosts.length > 0) {
            setViewedUser({
              username: userPosts[0].username,
              avatar: userPosts[0].profilePicture,
              themeHue: userPosts[0].themeHue
            });
          } else {
            setViewedUser({
              username: username,
              avatar: `https://picsum.photos/seed/${username}/100/100`,
              themeHue: 200
            });
          }
        }
      } catch (error) {
        console.error("Failed to load profile content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUserContent();
  }, [username, currentUserProfile.username]);

  const handlePostCreated = (newPost: Post) => {
    const savedPostsJson = localStorage.getItem(POSTS_STORAGE_KEY);
    const allPosts = savedPostsJson ? JSON.parse(savedPostsJson) : [];
    const updatedPosts = [newPost, ...allPosts];
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
    if (newPost.username.toLowerCase() === username.toLowerCase()) {
      setPosts([newPost, ...posts]);
    }
  };

  const hueColor = viewedUser ? `hsl(${viewedUser.themeHue}, 100%, 64%)` : 'hsl(var(--primary))';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 bg-background">
      <TopNav userProfile={currentUserProfile} />
      
      {/* Header / Banner Area */}
      <div className="relative h-48 w-full overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30 blur-3xl animate-pulse"
          style={{ backgroundColor: hueColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <Link href="/" className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-lg mx-auto px-6 -mt-16 relative z-10 text-left">
        <div className="flex flex-col gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 holographic-glow shadow-2xl" style={{ borderColor: hueColor }}>
            <Image src={viewedUser?.avatar || ''} alt={username} fill className="object-cover" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase">
              {username}
            </h1>
            <p className="text-xs text-white/70 lowercase tracking-[0.3em] font-medium">
              synchronized entity
            </p>
          </div>

          <p className="text-sm text-white/80 leading-relaxed">
            exploring the holographic horizons of the multiverse. just another digital traveler in the sync stream. ✨
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-bold lowercase tracking-widest">
              <MapPin className="w-3 h-3" style={{ color: hueColor }} />
              neo tokyo sector 7
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-bold lowercase tracking-widest">
              <LinkIcon className="w-3 h-3" style={{ color: hueColor }} />
              temsync.io/{username.toLowerCase()}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-bold lowercase tracking-widest">
              <Calendar className="w-3 h-3" style={{ color: hueColor }} />
              sync'd jan 2024
            </div>
          </div>

          <div className="flex gap-8 py-4 border-y border-white/5 mt-2">
            <div className="flex flex-col">
              <span className="text-xl font-headline font-bold text-white">{posts.length}</span>
              <span className="text-[8px] text-white/60 lowercase tracking-widest font-bold">syncs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-headline font-bold text-white">1.2k</span>
              <span className="text-[8px] text-white/60 lowercase tracking-widest font-bold">resonance</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-headline font-bold text-white">842</span>
              <span className="text-[8px] text-white/60 lowercase tracking-widest font-bold">following</span>
            </div>
          </div>
        </div>

        {/* User Posts Feed */}
        <div className="mt-10 space-y-6">
          <h2 className="text-xs font-bold lowercase tracking-[0.2em] text-white/60 mb-6">
            recent stream
          </h2>
          
          {posts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              index={index} 
              currentUser={currentUserProfile}
            />
          ))}

          {posts.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <p className="text-white/40 text-xs italic lowercase">no digital signals found in this timeline.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav 
        onProfileClick={() => setIsProfileOpen(true)} 
        onPostClick={() => setIsCreatePostOpen(true)}
        userProfile={currentUserProfile}
      />

      <ProfileSheet 
        isOpen={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
        profile={currentUserProfile}
        onUpdate={(p) => {
          setCurrentUserProfile(p);
          localStorage.setItem('temsync_user_profile', JSON.stringify(p));
        }}
      />

      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        userProfile={currentUserProfile}
        onPostCreated={handlePostCreated}
      />
    </main>
  );
}
