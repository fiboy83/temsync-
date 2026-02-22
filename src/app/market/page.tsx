'use client';

import React, { useEffect, useState } from 'react';
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
    <main className="min-h-screen pt-8 pb-10 bg-background">
      <div className="max-w-lg mx-auto px-4 w-full relative">
        <Link 
          href="/" 
          className="absolute top-2 left-4 p-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/60 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="mb-12 mt-12 text-center">
          <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase">
            market
          </h1>
          <p className="text-[12px] text-white/50 lowercase tracking-[0.2em] font-bold mt-2">
            real-time token resonance signals
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: hueColor }} />
            <p className="font-headline font-medium tracking-widest uppercase text-[12px]" style={{ color: hueColor }}>
              decoding signals...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token, idx) => (
              <div 
                key={`${token.tokenAddress}-${idx}`}
                className="bg-card/30 backdrop-blur-2xl rounded-[1.75rem] p-4 border transition-all group animate-fade-in"
                style={{ 
                  borderColor: hueColorMuted,
                  boxShadow: `0 4px 25px -12px ${hueColor}33`
                }}
              >
                <div className="flex gap-4">
                  <div 
                    className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border"
                    style={{ borderColor: hueColorMuted }}
                  >
                    {token.icon && isValidUrl(token.icon) ? (
                      <Image src={token.icon} alt="token" fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="text-[13px] font-bold text-white lowercase truncate group-hover:text-primary transition-colors" style={{ color: hueColor }}>
                        {token.chainId} signal
                      </h3>
                      <div 
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border"
                        style={{ borderColor: hueColorDeepMuted }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: hueColor }} />
                        <span className="text-[10px] font-bold lowercase tracking-tighter" style={{ color: hueColor }}>verified</span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-white/40 font-mono truncate lowercase">
                      {token.tokenAddress}
                    </p>

                    {token.description && (
                      <p className="text-[13px] text-white/70 mt-2 line-clamp-2 leading-relaxed lowercase">
                        {token.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      <a 
                        href={token.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all border hover:scale-105 active:scale-95"
                        style={{ 
                          backgroundColor: `${hueColor}15`,
                          borderColor: hueColorMuted
                        }}
                      >
                        <Globe className="w-4 h-4" style={{ color: hueColor }} />
                        <span className="text-[11px] font-bold lowercase tracking-wider" style={{ color: hueColor }}>dexscreener</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}