'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile } from '@/app/page';

interface DummyMessage {
  id: string;
  sender: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  hue: number;
}

const DUMMY_MESSAGES: DummyMessage[] = [
  {
    id: 'msg-1',
    sender: 'cyber_wanderer',
    avatar: 'https://picsum.photos/seed/wanderer/100/100',
    preview: 'did you catch the latest resonance shift in sector 4?',
    time: '2m ago',
    unread: true,
    hue: 180,
  },
  {
    id: 'msg-2',
    sender: 'neon_dreamer',
    avatar: 'https://picsum.photos/seed/dreamer/100/100',
    preview: 'the holographic backdrop you synced is incredible.',
    time: '14m ago',
    unread: false,
    hue: 300,
  },
  {
    id: 'msg-3',
    sender: 'pixel_pulse',
    avatar: 'https://picsum.photos/seed/pulse/100/100',
    preview: 'incoming signal from the lower timeline...',
    time: '1h ago',
    unread: false,
    hue: 45,
  }
];

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
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="mb-12 mt-12 text-center">
          <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase">
            inbox
          </h1>
          <p className="text-[12px] text-white/60 lowercase tracking-[0.2em] font-bold mt-2">
            incoming neural signals
          </p>
        </div>

        <div className="space-y-3">
          {DUMMY_MESSAGES.map((msg, idx) => (
            <div 
              key={msg.id}
              className="bg-card/30 backdrop-blur-2xl rounded-[1.75rem] p-4 border transition-all animate-fade-in group hover:bg-white/5 cursor-pointer"
              style={{ 
                animationDelay: `${idx * 100}ms`,
                borderColor: `hsl(${msg.hue}, 100%, 64%, 0.15)`,
                boxShadow: `0 4px 20px -12px hsl(${msg.hue}, 100%, 64%, 0.2)`
              }}
            >
              <div className="flex gap-4 items-center">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `hsl(${msg.hue}, 100%, 64%)` }}>
                  <Image src={msg.avatar} alt={msg.sender} fill className="object-cover" />
                  {msg.unread && (
                    <div 
                      className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background animate-pulse" 
                      style={{ backgroundColor: `hsl(${msg.hue}, 100%, 64%)` }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[13px] font-bold lowercase tracking-tight" style={{ color: `hsl(${msg.hue}, 100%, 64%)` }}>
                      {msg.sender}
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold lowercase tracking-tighter">{msg.time}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-white/80 line-clamp-1 lowercase tracking-tight leading-snug">
                    {msg.preview}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {DUMMY_MESSAGES.length === 0 && (
            <div className="bg-white/5 rounded-[2.5rem] p-4 border border-dashed border-white/10 flex flex-col items-center justify-center py-24 gap-6">
              <div className="p-5 rounded-full bg-white/5" style={{ boxShadow: `0 0 30px -5px ${hueColor}44` }}>
                <Sparkles className="w-10 h-10" style={{ color: hueColor }} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-white lowercase">no active frequencies</p>
                <p className="text-[12px] text-white/50 lowercase tracking-wider max-w-[200px] mx-auto leading-relaxed">your inbox is currently clear in this timeline.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}