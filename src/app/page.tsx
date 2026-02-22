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

  useEffect(() => {
    async function loadPosts() {
      try {
        const dummyPosts = await generateInitialDummyPosts();
        setPosts(dummyPosts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen pt-28 pb-32">
      <TopNav />
      
      <div className="max-w-lg mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-headline text-primary font-medium tracking-widest uppercase text-xs">
              Initializing Holographic Feed...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
            
            {posts.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-foreground/50">No posts found in this reality.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}