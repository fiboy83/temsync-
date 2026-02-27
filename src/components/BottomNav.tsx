'use client';

import React from 'react';
import { ShoppingBag, Repeat, Plus, Mail, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserProfile } from '@/app/page';

interface BottomNavProps {
  visible?: boolean;
  onPostClick?: () => void;
  userProfile?: UserProfile;
}

export function BottomNav({ visible = true, onPostClick, userProfile }: BottomNavProps) {
  const pathname = usePathname();
  const hueColor = userProfile ? `hsl(${userProfile.themeHue}, 100%, 64%)` : 'hsl(var(--primary))';
  
  return (
    <nav className={cn(
      "fixed bottom-2 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md transition-all duration-300 ease-in-out transform-gpu",
      !visible && "translate-y-[150%] opacity-0"
    )}>
      <div className="glass rounded-2xl px-1 py-1 flex items-center justify-around holographic-glow border-white/5">
        <Link 
          href="/"
          prefetch={true}
          className={cn(
            "flex flex-col items-center group py-1 px-2 rounded-xl transition-all active-scale",
            pathname === '/' ? "bg-white/5" : "hover:bg-white/5"
          )}
        >
          <div className="p-1">
            <Home className="w-4 h-4" style={{ color: hueColor }} />
          </div>
          <span className="text-[8px] font-bold lowercase tracking-widest" style={{ color: hueColor }}>home</span>
        </Link>

        <Link 
          href="/market"
          prefetch={true}
          className={cn(
            "flex flex-col items-center group py-1 px-2 rounded-xl transition-all active-scale",
            pathname === '/market' ? "bg-white/5" : "hover:bg-white/5"
          )}
        >
          <div className="p-1">
            <ShoppingBag className="w-4 h-4" style={{ color: hueColor }} />
          </div>
          <span className="text-[8px] font-bold lowercase tracking-widest" style={{ color: hueColor }}>market</span>
        </Link>

        <button 
          onClick={onPostClick}
          className="relative -top-2 p-2.5 rounded-xl shadow-lg transition-all hover:scale-110 active:scale-90 text-white active-scale"
          style={{ 
            backgroundColor: hueColor,
            boxShadow: `0 8px 20px -4px ${hueColor}66`
          }}
        >
          <Plus className="w-5 h-5" />
        </button>

        <Link 
          href="/inbox"
          prefetch={true}
          className={cn(
            "flex flex-col items-center group py-1 px-2 rounded-xl transition-all active-scale",
            pathname === '/inbox' ? "bg-white/5" : "hover:bg-white/5"
          )}
        >
          <div className="p-1">
            <Mail className="w-4 h-4" style={{ color: hueColor }} />
          </div>
          <span className="text-[8px] font-bold lowercase tracking-widest" style={{ color: hueColor }}>inbox</span>
        </Link>

        <Link 
          href="/swap"
          prefetch={true}
          className={cn(
            "flex flex-col items-center group py-1 px-2 rounded-xl transition-all active-scale",
            pathname === '/swap' ? "bg-white/5" : "hover:bg-white/5"
          )}
        >
          <div className="p-1">
            <Repeat className="w-4 h-4" style={{ color: hueColor }} />
          </div>
          <span className="text-[8px] font-bold lowercase tracking-widest" style={{ color: hueColor }}>swap</span>
        </Link>
      </div>
    </nav>
  );
}