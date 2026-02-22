import React from 'react';
import { Search, User } from 'lucide-react';

export function TopNav() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center">
      <div className="w-full max-w-lg glass rounded-2xl p-4 flex items-center justify-between holographic-glow">
        <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <Search className="w-5 h-5 text-primary" />
        </button>
        
        <h1 className="font-headline text-2xl font-bold holographic-text tracking-tight">
          temsync
        </h1>

        <button className="p-1 hover:bg-white/20 rounded-full transition-colors border-2 border-primary/20">
          <User className="w-6 h-6 text-primary" />
        </button>
      </div>
    </nav>
  );
}