import React from 'react';
import { ShoppingBag, Repeat, Plus, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  visible?: boolean;
  onProfileClick?: () => void;
  onPostClick?: () => void;
}

export function BottomNav({ visible = true, onProfileClick, onPostClick }: BottomNavProps) {
  return (
    <nav className={cn(
      "fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md transition-transform duration-500 ease-in-out",
      !visible && "translate-y-[150%]"
    )}>
      <div className="glass rounded-2xl px-1 py-1 flex items-center justify-around holographic-glow border-white/5">
        <button className="flex flex-col items-center group py-1 px-2">
          <div className="p-1 rounded-lg group-hover:bg-primary/10 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[6px] font-medium uppercase tracking-widest text-foreground/40">Market</span>
        </button>

        <button className="flex flex-col items-center group py-1 px-2">
          <div className="p-1 rounded-lg group-hover:bg-primary/10 transition-colors">
            <Repeat className="w-3.5 h-3.5 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[6px] font-medium uppercase tracking-widest text-foreground/40">Swap</span>
        </button>

        <button 
          onClick={onPostClick}
          className="relative -top-2 p-2 bg-primary rounded-xl shadow-lg shadow-primary/40 text-white hover:scale-110 active:scale-90 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button className="flex flex-col items-center group py-1 px-2">
          <div className="p-1 rounded-lg group-hover:bg-primary/10 transition-colors">
            <Mail className="w-3.5 h-3.5 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[6px] font-medium uppercase tracking-widest text-foreground/40">Inbox</span>
        </button>

        <button 
          onClick={onProfileClick}
          className="flex flex-col items-center group py-1 px-2"
        >
          <div className="p-1 rounded-lg group-hover:bg-primary/10 transition-colors">
            <UserIcon className="w-3.5 h-3.5 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[6px] font-medium uppercase tracking-widest text-foreground/40">Profile</span>
        </button>
      </div>
    </nav>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
