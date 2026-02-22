'use client';

import React, { useEffect, useState } from 'react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { ProfileSheet } from '@/components/ProfileSheet';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { ArrowLeft, Mail, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { UserProfile } from '@/app/page';

export default function InboxPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  const hueColor = `hsl(${userProfile.themeHue}, 100%, 64%)`;

  return (
    <main className="min-h-screen pt-14 pb-20 bg-background">
      <TopNav userProfile={userProfile} onProfileClick={() => setIsProfileOpen(true)} />
      
      <div className="max-w-lg mx-auto px-4 w-full relative">
        <Link 
          href="/" 
          className="absolute top-8 left-4 p-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/80 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="mb-8 mt-6 text-center">
          <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase">
            inbox
          </h1>
          <p className="text-[10px] text-white/70 lowercase tracking-[0.2em] font-bold mt-2">
            incoming neural signals
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-dashed border-white/10 flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-4 rounded-full bg-white/5" style={{ boxShadow: `0 0 20px -5px ${hueColor}33` }}>
              <Sparkles className="w-8 h-8" style={{ color: hueColor }} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-white lowercase">no active frequencies</p>
              <p className="text-[10px] text-white/50 lowercase tracking-wider">your inbox is currently clear in this timeline.</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav 
        userProfile={userProfile}
        onPostClick={() => setIsCreatePostOpen(true)}
      />

      <ProfileSheet 
        isOpen={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
        profile={userProfile}
        onUpdate={(p) => {
          setUserProfile(p);
          localStorage.setItem('temsync_user_profile', JSON.stringify(p));
        }}
      />

      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        userProfile={userProfile}
        onPostCreated={() => {}}
      />
    </main>
  );
}
