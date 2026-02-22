'use client';

import React, { useEffect, useState, use } from 'react';
import { PostCard } from '@/components/PostCard';
import { Loader2, ArrowLeft, MoreVertical, MapPin, Link as LinkIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import type { UserProfile } from '@/app/page';

const POSTS_STORAGE_KEY = 'temsync_all_posts';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
  });
  const [viewedUser, setViewedUser] = useState<{ username: string, avatar: string, themeHue: number } | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      setCurrentUserProfile(JSON.parse(savedProfile));
    }

    async function loadUserContent() {
      try {
        const savedPostsJson = localStorage.getItem(POSTS_STORAGE_KEY);
        if (savedPostsJson) {
          const allPosts: Post[] = JSON.parse(savedPostsJson);
          const userPosts = allPosts.filter(p => p.username.toLowerCase() === username.toLowerCase());
          setPosts(userPosts);

          if (username.toLowerCase() === currentUserProfile.username.toLowerCase()) {
            setViewedUser(currentUserProfile);
          } else if (userPosts.length > 0) {
            setViewedUser({
              username: userPosts[0].username,
              avatar: userPosts[0].profilePicture,
              themeHue: userPosts[0].themeHue
            });
          } else {
            setViewedUser({
              username: username,
              avatar: `https://picsum.photos/seed/${username}/100/100`,
              themeHue: 200
            });
          }
        }
      } catch (error) {
        console.error("Failed to load profile content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUserContent();
  }, [username, currentUserProfile.username]);

  const hueColor = viewedUser ? `hsl(${viewedUser.themeHue}, 100%, 64%)` : 'hsl(var(--primary))';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const isSelf = viewedUser?.username.toLowerCase() === currentUserProfile.username.toLowerCase();

  return (
    <main className="min-h-screen pb-12 bg-background">
      <div className="relative h-48 w-full overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 blur-3xl animate-pulse"
          style={{ backgroundColor: hueColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
          <Link href="/" className="p-2.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button className="p-2.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/50 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-16 relative z-10 text-left">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-end">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-[5px] holographic-glow shadow-2xl" style={{ borderColor: hueColor }}>
              <Image src={viewedUser?.avatar || ''} alt={username} fill className="object-cover" />
            </div>
            
            {!isSelf && (
              <Button 
                className="rounded-2xl h-10 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold lowercase tracking-widest transition-all mb-2"
                style={{ color: hueColor, borderColor: `${hueColor}44` }}
              >
                <Send className="w-4 h-4 mr-2" />
                send signal
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase">
              {username}
            </h1>
            <p className="text-[10px] text-white/70 lowercase tracking-[0.3em] font-bold">
              synchronized entity
            </p>
          </div>

          <p className="text-sm text-white/80 leading-relaxed lowercase">
            exploring the holographic horizons of the multiverse. just another digital traveler in the sync stream. ✨
          </p>

          <div className="flex flex-wrap gap-5 pt-3">
            <div className="flex items-center gap-2 text-[10px] text-white/80 font-bold lowercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" style={{ color: hueColor }} />
              neo tokyo sector 7
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/80 font-bold lowercase tracking-widest">
              <LinkIcon className="w-3.5 h-3.5" style={{ color: hueColor }} />
              temsync.io/{username.toLowerCase()}
            </div>
          </div>

          <div className="flex gap-10 py-4 border-y border-white/10 mt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-headline font-bold text-white">{posts.length}</span>
              <span className="text-[9px] text-white/70 lowercase tracking-widest font-bold">syncs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-headline font-bold text-white">1.2k</span>
              <span className="text-[9px] text-white/70 lowercase tracking-widest font-bold">resonance</span>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <h2 className="text-[10px] font-bold lowercase tracking-[0.2em] text-white/50 mb-6">
            recent stream
          </h2>
          
          {posts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              index={index} 
              currentUser={currentUserProfile}
            />
          ))}

          {posts.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <p className="text-white/40 text-[10px] italic lowercase tracking-widest">no digital signals found in this timeline.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
