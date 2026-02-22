import React from 'react';
import { ShoppingBag, Repeat, Plus, Mail } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="glass rounded-3xl px-2 py-3 flex items-center justify-around holographic-glow">
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <ShoppingBag className="w-6 h-6 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">Market</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <Repeat className="w-6 h-6 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">Swap</span>
        </button>

        <button className="relative -top-8 p-4 bg-primary rounded-2xl shadow-lg shadow-primary/40 text-white hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-8 h-8" />
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <Mail className="w-6 h-6 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">Inbox</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <UserIcon className="w-6 h-6 text-foreground/70 group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">Profile</span>
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