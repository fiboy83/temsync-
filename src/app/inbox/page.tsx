'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { UserProfile } from '@/app/page';

export default function InboxPage() {
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
    <main className="min-h-screen pt-8 pb-10 bg-background">
      <div className="max-w-lg mx-auto px-4 w-full relative">
        <Link 
          href="/" 
          className="absolute top-2 left-4 p-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/80 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="mb-12 mt-12 text-center">
          <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase">
            inbox
          </h1>
          <p className="text-[10px] text-white/70 lowercase tracking-[0.2em] font-bold mt-2">
            incoming neural signals
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-[2.5rem] p-4 border border-dashed border-white/10 flex flex-col items-center justify-center py-24 gap-6">
            <div className="p-5 rounded-full bg-white/5" style={{ boxShadow: `0 0 30px -5px ${hueColor}44` }}>
              <Sparkles className="w-10 h-10" style={{ color: hueColor }} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold text-white lowercase">no active frequencies</p>
              <p className="text-[10px] text-white/50 lowercase tracking-wider max-w-[200px] mx-auto leading-relaxed">your inbox is currently clear in this timeline.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
