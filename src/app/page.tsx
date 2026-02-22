'use client';

import React, { useEffect, useState } from 'react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { PostCard } from '@/components/PostCard';
import { generateInitialDummyPosts, Post } from '@/ai/flows/generate-initial-dummy-posts';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to change the global theme based on a hue
  const updateGlobalTheme = (hue: number) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', `${hue} 100% 64%`);
    root.style.setProperty('--secondary', `${(hue + 180) % 360} 100% 50%`);
    root.style.setProperty('--accent', `${(hue + 180) % 360} 100% 50%`);
    root.style.setProperty('--ring', `${hue} 100% 64%`);
  };

  useEffect(() => {
    async function loadPosts() {
      try {
        const dummyPosts = await generateInitialDummyPosts();
        setPosts(dummyPosts);
        
        // Initially set theme to match the first post's user
        if (dummyPosts.length > 0) {
          updateGlobalTheme(dummyPosts[0].themeHue);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-20 transition-colors duration-700">
      <TopNav />
      
      <div className="max-w-lg mx-auto px-4 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="font-headline text-primary font-medium tracking-widest uppercase text-[10px]">
              Syncing Reality...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                index={index} 
                onProfileClick={updateGlobalTheme}
              />
            ))}
            
            {posts.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-foreground/50 text-sm">The multiverse is empty.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
