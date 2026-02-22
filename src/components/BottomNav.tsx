import React from 'react';
import { ShoppingBag, Repeat, Plus, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/app/page';

interface BottomNavProps {
  visible?: boolean;
  onProfileClick?: () => void;
  onPostClick?: () => void;
  userProfile?: UserProfile;
}

export function BottomNav({ visible = true, onProfileClick, onPostClick, userProfile }: BottomNavProps) {
  const hueColor = userProfile ? `hsl(${userProfile.themeHue}, 100%, 64%)` : 'hsl(var(--primary))';
  
  return (
    <nav className={cn(
      "fixed bottom-2 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md transition-transform duration-500 ease-in-out",
      !visible && "translate-y-[150%]"
    )}>
      <div className="glass rounded-2xl px-1 py-1 flex items-center justify-around holographic-glow border-white/5">
        <button className="flex flex-col items-center group py-1 px-2">
          <div className="p-1 rounded-lg group-hover:bg-white/10 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" style={{ color: hueColor }} />
          </div>
          <span className="text-[6px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100" style={{ color: hueColor }}>Market</span>
        </button>

        <button className="flex flex-col items-center group py-1 px-2">
          <div className="p-1 rounded-lg group-hover:bg-white/10 transition-colors">
            <Repeat className="w-3.5 h-3.5" style={{ color: hueColor }} />
          </div>
          <span className="text-[6px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100" style={{ color: hueColor }}>Swap</span>
        </button>

        <button 
          onClick={onPostClick}
          className="relative -top-2 p-2 rounded-xl shadow-lg transition-all hover:scale-110 active:scale-90 text-white"
          style={{ 
            backgroundColor: hueColor,
            boxShadow: `0 8px 20px -4px ${hueColor}66`
          }}
        >
          <Plus className="w-5 h-5" />
        </button>

        <button className="flex flex-col items-center group py-1 px-2">
          <div className="p-1 rounded-lg group-hover:bg-white/10 transition-colors">
            <Mail className="w-3.5 h-3.5" style={{ color: hueColor }} />
          </div>
          <span className="text-[6px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100" style={{ color: hueColor }}>Inbox</span>
        </button>

        <button 
          onClick={onProfileClick}
          className="flex flex-col items-center group py-1 px-2"
        >
          <div className="p-1 rounded-lg group-hover:bg-white/10 transition-colors">
            <UserIcon className="w-3.5 h-3.5" color={hueColor} />
          </div>
          <span className="text-[6px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100" style={{ color: hueColor }}>Profile</span>
        </button>
      </div>
    </nav>
  );
}

function UserIcon({ color }: { color: string }) {
  return (
    <svg 
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
