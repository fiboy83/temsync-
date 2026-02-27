'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Wallet, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { UserProfile } from '@/app/page';

interface TopNavProps {
  visible?: boolean;
  userProfile?: UserProfile;
  onProfileClick?: () => void;
  onWalletClick?: () => void;
}

export function TopNav({ visible = true, userProfile, onProfileClick, onWalletClick }: TopNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const hueColor = userProfile ? `hsl(${userProfile.themeHue}, 100%, 64%)` : 'hsl(var(--primary))';

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const savedPostsJson = localStorage.getItem('temsync_all_posts');
    const allPosts = savedPostsJson ? JSON.parse(savedPostsJson) : [];
    
    const userExists = allPosts.some((p: any) => p.username.toLowerCase() === query.toLowerCase().replace('@', ''));
    
    if (userExists) {
      router.push(`/profile/${query.toLowerCase().replace('@', '')}`);
      setIsExpanded(false);
      setQuery('');
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setIsExpanded(false);
      setQuery('');
    }
  };

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) setQuery('');
  };

  return (
    <nav className={cn(
      "fixed top-2 left-0 right-0 z-50 px-4 flex justify-center transition-all duration-300 ease-in-out transform-gpu",
      !visible && "-translate-y-[120%] opacity-0"
    )}>
      <div className={cn(
        "w-full max-w-lg glass rounded-xl py-1.5 px-3 flex items-center justify-between holographic-glow transition-all duration-300 relative h-12 overflow-hidden",
        isExpanded && "ring-1 ring-primary/30"
      )}>
        <div className={cn(
          "flex items-center transition-all duration-300 z-10",
          isExpanded ? "flex-1" : "w-10"
        )}>
          <button 
            onClick={toggleSearch}
            className="p-2 hover:bg-white/10 rounded-full transition-all active-scale shrink-0"
            aria-label="Toggle search"
          >
            {isExpanded ? (
              <X className="w-4 h-4 text-white/40" />
            ) : (
              <Search className="w-4 h-4" style={{ color: hueColor }} />
            )}
          </button>
          
          <form 
            onSubmit={handleSearch}
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out flex items-center",
              isExpanded ? "ml-2 flex-1 opacity-100 max-w-full" : "max-w-0 opacity-0 pointer-events-none"
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search multiverse..."
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-white/20 lowercase"
            />
          </form>
        </div>
        
        <h1 className={cn(
          "absolute left-1/2 -translate-x-1/2 font-headline text-xl font-bold holographic-text tracking-tighter transition-all duration-300 pointer-events-none italic",
          isExpanded ? "opacity-0 scale-90 -translate-y-4" : "opacity-100 scale-100 translate-y-0"
        )}>
          temsync
        </h1>

        <div className={cn(
          "transition-all duration-300 flex items-center gap-2 shrink-0 z-10",
          isExpanded ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto ml-auto"
        )}>
          <button 
            onClick={onWalletClick}
            className="p-1.5 hover:bg-white/10 rounded-full transition-all active-scale border flex items-center justify-center" 
            style={{ borderColor: `${hueColor}33` }}
          >
            <Wallet className="w-4 h-4" style={{ color: hueColor }} />
          </button>
          
          {userProfile && (
            <button 
              onClick={onProfileClick}
              className="relative w-8 h-8 rounded-full overflow-hidden border-2 active-scale"
              style={{ borderColor: hueColor }}
            >
              <Image 
                src={userProfile.avatar || "https://picsum.photos/seed/placeholder/100/100"} 
                alt="Profile" 
                fill 
                className="object-cover"
                sizes="32px"
              />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}