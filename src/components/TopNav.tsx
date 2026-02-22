import React, { useState, useEffect, useRef } from 'react';
import { Search, Wallet, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/page';

interface TopNavProps {
  visible?: boolean;
  userProfile?: UserProfile;
}

export function TopNav({ visible = true, userProfile }: TopNavProps) {
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
    
    // 1. Cari user
    const userExists = allPosts.some((p: any) => p.username.toLowerCase() === query.toLowerCase().replace('@', ''));
    
    // 2. Cari konten feed
    const postExists = allPosts.some((p: any) => p.content.toLowerCase().includes(query.toLowerCase()));

    if (userExists) {
      router.push(`/profile/${query.toLowerCase().replace('@', '')}`);
      setIsExpanded(false);
      setQuery('');
    } else if (postExists) {
      // Untuk MVP, kita beri tahu user bahwa data ada di feed (atau bisa scroll ke sana)
      alert(`Signal detected in Temsync feed for "${query}"`);
      setIsExpanded(false);
      setQuery('');
    } else {
      // 3. Fallback ke Google
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setIsExpanded(false);
      setQuery('');
    }
  };

  return (
    <nav className={cn(
      "fixed top-2 left-0 right-0 z-50 px-4 flex justify-center transition-transform duration-500 ease-in-out",
      !visible && "-translate-y-[120%]"
    )}>
      <div className={cn(
        "w-full max-w-lg glass rounded-xl py-1.5 px-4 flex items-center justify-between holographic-glow transition-all duration-300",
        isExpanded && "ring-1 ring-primary/30"
      )}>
        <div className="flex items-center flex-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0"
          >
            <Search className="w-4 h-4" style={{ color: hueColor }} />
          </button>
          
          <form 
            onSubmit={handleSearch}
            className={cn(
              "overflow-hidden transition-all duration-500 ease-in-out flex items-center",
              isExpanded ? "max-w-md ml-2 flex-1 opacity-100" : "max-w-0 opacity-0"
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search multiverse..."
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-white/20"
            />
            {query && (
              <button 
                type="button"
                onClick={() => setQuery('')}
                className="p-1 hover:bg-white/5 rounded-full"
              >
                <X className="w-3 h-3 text-white/40" />
              </button>
            )}
          </form>
        </div>
        
        {!isExpanded && (
          <h1 className="font-headline text-base font-bold holographic-text tracking-tight animate-in fade-in duration-500">
            temsync
          </h1>
        )}

        <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors border flex items-center justify-center shrink-0 ml-2" style={{ borderColor: `${hueColor}33` }}>
          <Wallet className="w-4 h-4" style={{ color: hueColor }} />
        </button>
      </div>
    </nav>
  );
}
