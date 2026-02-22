'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { PostCard } from '@/components/PostCard';
import { ProfileSheet } from '@/components/ProfileSheet';
import { generateInitialDummyPosts, Post } from '@/ai/flows/generate-initial-dummy-posts';
import { Loader2 } from 'lucide-react';

export interface UserProfile {
  username: string;
  avatar: string;
  themeHue: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'NeonTraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
  });
  
  const lastScrollY = useRef(0);

  // Function to change the global theme based on a hue
  const updateGlobalTheme = (hue: number) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', `${hue} 100% 64%`);
    root.style.setProperty('--secondary', `${(hue + 180) % 360} 100% 50%`);
    root.style.setProperty('--accent', `${(hue + 180) % 360} 100% 50%`);
    root.style.setProperty('--ring', `${hue} 100% 64%`);
  };

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfile(parsed);
      updateGlobalTheme(parsed.themeHue);
    }

    async function loadPosts() {
      try {
        const dummyPosts = await generateInitialDummyPosts();
        setPosts(dummyPosts);
        
        // If no saved profile, use first post theme
        if (!savedProfile && dummyPosts.length > 0) {
          updateGlobalTheme(dummyPosts[0].themeHue);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
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

  return (
    <main className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-20 transition-colors duration-700">
      <TopNav visible={navVisible} />
      
      <div className="max-w-lg mx-auto px-4 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="font-headline text-primary font-medium tracking-widest uppercase text-[10px]">
              Syncing Reality...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                index={index} 
                onProfileClick={updateGlobalTheme}
              />
            ))}
            
            {posts.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-foreground/50 text-sm">The multiverse is empty.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav 
        visible={navVisible} 
        onProfileClick={() => setIsProfileOpen(true)} 
      />

      <ProfileSheet 
        isOpen={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
        profile={userProfile}
        onUpdate={handleProfileUpdate}
      />
    </main>
  );
}
