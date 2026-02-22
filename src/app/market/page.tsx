'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/page';

export default function MarketPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
  });

  const updateGlobalTheme = (hue: number) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', `${hue} 100% 64%`);
    root.style.setProperty('--accent', `${hue} 100% 64%`);
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
  }, []);

  const hueColor = `hsl(${userProfile.themeHue}, 100%, 64%)`;

  return (
    <main className="min-h-screen pt-8 pb-10 bg-background overflow-hidden relative">
      {/* Background Aura */}
      <div 
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-10 blur-[120px] pointer-events-none" 
        style={{ backgroundColor: hueColor }} 
      />

      <div className="max-w-lg mx-auto px-4 w-full relative z-10">
        <button 
          onClick={() => router.push('/')}
          className="absolute top-2 left-4 p-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/60 hover:text-white transition-all active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-20 mt-12 text-center animate-fade-in">
          <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase tracking-tight">
            market
          </h1>
          <p className="text-[10px] text-white/40 lowercase tracking-[0.3em] font-bold mt-2">
            awaiting resonance signals
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in">
          <div 
            className="p-6 rounded-full bg-white/5 border border-white/5 backdrop-blur-3xl relative group"
            style={{ boxShadow: `0 0 40px -10px ${hueColor}33` }}
          >
            <Sparkles className="w-12 h-12 text-white/20 group-hover:scale-110 transition-transform duration-500" style={{ color: `${hueColor}44` }} />
            <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{ backgroundColor: hueColor }} />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold text-white/80 lowercase tracking-widest">
              no signals detected
            </h3>
            <p className="text-[11px] text-white/30 lowercase tracking-wider max-w-[240px] mx-auto leading-relaxed">
              the market frequency is currently silent in this timeline. check back after the next resonance shift.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
