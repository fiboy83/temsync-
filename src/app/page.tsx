'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { PostCard } from '@/components/PostCard';
import { ProfileSheet } from '@/components/ProfileSheet';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { generateInitialDummyPosts, Post } from '@/ai/flows/generate-initial-dummy-posts';
import { Loader2 } from 'lucide-react';

export interface UserProfile {
  username: string;
  avatar: string;
  themeHue: number;
  bio?: string;
}

const POSTS_STORAGE_KEY = 'temsync_all_posts';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
    bio: 'exploring the holographic horizons of the multiverse. ✨',
  });
  
  const lastScrollY = useRef(0);

  const updateGlobalTheme = (hue: number) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', `${hue} 100% 64%`);
    root.style.setProperty('--secondary', `${(hue + 180) % 360} 100% 50%`);
    root.style.setProperty('--accent', `${(hue + 180) % 360} 100% 50%`);
    root.style.setProperty('--ring', `${hue} 100% 64%`);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfile(parsed);
      updateGlobalTheme(parsed.themeHue);
    } else {
      updateGlobalTheme(userProfile.themeHue);
    }

    async function loadAllPosts() {
      try {
        const savedPostsJson = localStorage.getItem(POSTS_STORAGE_KEY);
        let allPosts: Post[] = [];

        if (savedPostsJson) {
          allPosts = JSON.parse(savedPostsJson);
        } else {
          allPosts = await generateInitialDummyPosts();
          localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(allPosts));
        }
        
        setPosts(allPosts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllPosts();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileUpdate = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('temsync_user_profile', JSON.stringify(newProfile));
    updateGlobalTheme(newProfile.themeHue);
  };

  const handlePostCreated = (newPost: Post) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
  };

  return (
    <main className="min-h-screen pt-12 pb-14 md:pt-14 md:pb-16 transition-colors duration-700 bg-background">
      <TopNav 
        visible={navVisible} 
        userProfile={userProfile} 
        onProfileClick={() => setIsProfileOpen(true)}
      />
      
      <div className="max-w-lg mx-auto px-4 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="font-headline text-primary font-medium tracking-widest uppercase text-[10px]">
              syncing reality...
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                index={index} 
                currentUser={userProfile}
                onCurrentUserProfileClick={() => setIsProfileOpen(true)}
              />
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-foreground/50 text-xs lowercase">the multiverse is empty.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav 
        visible={navVisible} 
        onPostClick={() => setIsCreatePostOpen(true)}
        userProfile={userProfile}
      />

      <ProfileSheet 
        isOpen={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
        profile={userProfile}
        onUpdate={handleProfileUpdate}
      />

      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        userProfile={userProfile}
        onPostCreated={handlePostCreated}
      />
    </main>
  );
}
