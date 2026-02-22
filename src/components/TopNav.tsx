import React from 'react';
import { Search, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopNavProps {
  visible?: boolean;
}

export function TopNav({ visible = true }: TopNavProps) {
  return (
    <nav className={cn(
      "fixed top-2 left-0 right-0 z-50 px-4 flex justify-center transition-transform duration-500 ease-in-out",
      !visible && "-translate-y-[120%]"
    )}>
      <div className="w-full max-w-lg glass rounded-xl py-1.5 px-4 flex items-center justify-between holographic-glow">
        <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <Search className="w-4 h-4 text-primary" />
        </button>
        
        <h1 className="font-headline text-base font-bold holographic-text tracking-tight">
          temsync
        </h1>

        <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors border border-primary/20 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-primary" />
        </button>
      </div>
    </nav>
  );
}
