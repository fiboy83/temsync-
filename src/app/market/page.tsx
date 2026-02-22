'use client';

import React, { useEffect, useState } from 'react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { ProfileSheet } from '@/components/ProfileSheet';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { Loader2, Globe, TrendingUp, ShieldCheck, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserProfile } from '@/app/page';

interface DexToken {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: { type?: string; label?: string; url: string }[];
}

export default function MarketPage() {
  const [tokens, setTokens] = useState<DexToken[]>([]);
  const [loading, setLoading] = useState(true);
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

    async function fetchMarketData() {
      try {
        const response = await fetch('https://api.dexscreener.com/token-boosts/latest/v1');
        const data = await response.json();
        setTokens(Array.isArray(data) ? data : []);
      } catch (error) {
        // failed to sync market signals
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  const isValidUrl = (url: string | undefined): url is string => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hueColor = `hsl(${userProfile.themeHue}, 100%, 64%)`;
  const hueColorMuted = `hsl(${userProfile.themeHue}, 100%, 64%, 0.15)`;
  const hueColorDeepMuted = `hsl(${userProfile.themeHue}, 100%, 64%, 0.05)`;

  return (
    <main className="min-h-screen pt-14 pb-20 bg-background transition-colors duration-700">
      <TopNav userProfile={userProfile} onProfileClick={() => setIsProfileOpen(true)} />
      
      <div className="max-w-lg mx-auto px-4 w-full relative">
        <Link 
          href="/" 
          className="absolute top-8 left-4 p-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/60 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="mb-8 mt-6 text-center">
          <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase">
            market
          </h1>
          <p className="text-[10px] text-white/50 lowercase tracking-[0.2em] font-bold mt-2">
            real-time token resonance signals
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: hueColor }} />
            <p className="font-headline font-medium tracking-widest uppercase text-[10px]" style={{ color: hueColor }}>
              decoding signals...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token, idx) => (
              <div 
                key={`${token.tokenAddress}-${idx}`}
                className="bg-card/30 backdrop-blur-2xl rounded-[1.5rem] p-3 border transition-all group animate-fade-in"
                style={{ 
                  animationDelay: `${idx * 50}ms`,
                  borderColor: hueColorMuted,
                  boxShadow: `0 4px 20px -10px ${hueColor}22`
                }}
              >
                <div className="flex gap-3">
                  <div 
                    className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border"
                    style={{ borderColor: hueColorMuted }}
                  >
                    {token.icon && isValidUrl(token.icon) ? (
                      <Image src={token.icon} alt="token" fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="text-[11px] font-bold text-white lowercase truncate group-hover:text-primary transition-colors" style={{ color: hueColor }}>
                        {token.chainId} signal
                      </h3>
                      <div 
                        className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 rounded-full border"
                        style={{ borderColor: hueColorDeepMuted }}
                      >
                        <ShieldCheck className="w-2.5 h-2.5" style={{ color: hueColor }} />
                        <span className="text-[7px] font-bold lowercase tracking-tighter" style={{ color: hueColor }}>verified</span>
                      </div>
                    </div>
                    
                    <p className="text-[8px] text-white/30 font-mono truncate lowercase">
                      {token.tokenAddress}
                    </p>

                    {token.description && (
                      <p className="text-[10px] text-white/70 mt-1.5 line-clamp-2 leading-relaxed lowercase">
                        {token.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <a 
                        href={token.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all border hover:scale-105 active:scale-95"
                        style={{ 
                          backgroundColor: `${hueColor}11`,
                          borderColor: hueColorMuted
                        }}
                      >
                        <Globe className="w-2.5 h-2.5" style={{ color: hueColor }} />
                        <span className="text-[8px] font-bold lowercase tracking-wider" style={{ color: hueColor }}>dexscreener</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
        onPostCreated={(newPost) => {
          const savedPostsJson = localStorage.getItem('temsync_all_posts');
          const allPosts = savedPostsJson ? JSON.parse(savedPostsJson) : [];
          localStorage.setItem('temsync_all_posts', JSON.stringify([newPost, ...allPosts]));
        }}
      />
    </main>
  );
}
