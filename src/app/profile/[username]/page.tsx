'use client';

import React, { useEffect, useState, use } from 'react';
import { PostCard } from '@/components/PostCard';
import { Loader2, ArrowLeft, MoreVertical, MapPin, Link as LinkIcon, Send, Sparkles, Bookmark, Edit2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileSheet } from '@/components/ProfileSheet';
import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import type { UserProfile } from '@/app/page';

const POSTS_STORAGE_KEY = 'temsync_all_posts';
const BOOKMARKS_KEY = 'temsync_bookmarks';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
    bio: 'exploring the holographic horizons of the multiverse. ✨',
  });
  const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);

  const loadUserContent = () => {
    try {
      const savedPostsJson = localStorage.getItem(POSTS_STORAGE_KEY);
      const savedBookmarksJson = localStorage.getItem(BOOKMARKS_KEY);
      const bookmarkIds = savedBookmarksJson ? JSON.parse(savedBookmarksJson) : [];

      if (savedPostsJson) {
        const allPosts: any[] = JSON.parse(savedPostsJson);
        
        const userPosts = allPosts.filter(p => 
          p.username.toLowerCase() === username.toLowerCase() && !p.isArchived
        );
        setPosts(userPosts);

        const archived = allPosts.filter(p => 
          p.username.toLowerCase() === username.toLowerCase() && p.isArchived
        );
        setArchivedPosts(archived);

        const bookmarked = allPosts.filter(p => bookmarkIds.includes(p.id));
        setBookmarkedPosts(bookmarked);

        if (username.toLowerCase() === currentUserProfile.username.toLowerCase()) {
          setViewedUser(currentUserProfile);
        } else if (allPosts.some(p => p.username.toLowerCase() === username.toLowerCase())) {
          const firstPost = allPosts.find(p => p.username.toLowerCase() === username.toLowerCase());
          setViewedUser({
            username: firstPost.username,
            avatar: firstPost.profilePicture,
            themeHue: firstPost.themeHue,
            bio: 'synchronized entity in the stream.'
          });
        } else {
          setViewedUser({
            username: username,
            avatar: `https://picsum.photos/seed/${username}/100/100`,
            themeHue: 200,
            bio: 'exploring the holographic horizons.'
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      setCurrentUserProfile(JSON.parse(savedProfile));
    }
    loadUserContent();
    window.addEventListener('bookmarksUpdated', loadUserContent);
    window.addEventListener('postsUpdated', loadUserContent);
    return () => {
      window.removeEventListener('bookmarksUpdated', loadUserContent);
      window.removeEventListener('postsUpdated', loadUserContent);
    };
  }, [username, currentUserProfile.username]);

  const handleProfileUpdate = (newProfile: UserProfile) => {
    setCurrentUserProfile(newProfile);
    setViewedUser(newProfile);
    localStorage.setItem('temsync_user_profile', JSON.stringify(newProfile));
    
    const root = document.documentElement;
    root.style.setProperty('--primary', `${newProfile.themeHue} 100% 64%`);
    
    loadUserContent();
  };

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
      <div className="relative h-44 w-full overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30 blur-3xl animate-pulse"
          style={{ backgroundColor: hueColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
          <Link href="/" className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/5 text-white hover:bg-black/40 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/5 text-white hover:bg-black/40 transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-12 relative z-10 text-left">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 holographic-glow shadow-2xl" style={{ borderColor: hueColor }}>
              {viewedUser?.avatar ? (
                <Image src={viewedUser.avatar} alt={username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10" />
              )}
            </div>
            
            {isSelf ? (
              <Button 
                onClick={() => setIsEditOpen(true)}
                className="rounded-xl h-10 px-5 bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-bold lowercase tracking-widest transition-all mb-1"
                style={{ color: hueColor, borderColor: `${hueColor}33` }}
              >
                <Edit2 className="w-3.5 h-3.5 mr-2" />
                edit profile
              </Button>
            ) : (
              <Button 
                className="rounded-xl h-10 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-bold lowercase tracking-widest transition-all mb-1"
                style={{ color: hueColor, borderColor: `${hueColor}33` }}
              >
                <Send className="w-4 h-4 mr-2" />
                send signal
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-headline font-bold holographic-text italic lowercase">
              {username}
            </h1>
            <p className="text-[11px] text-white/50 lowercase tracking-[0.3em] font-bold">
              synchronized entity
            </p>
          </div>

          <p className="text-[14px] text-white/80 leading-relaxed lowercase max-w-sm">
            {viewedUser?.bio}
          </p>

          <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-bold lowercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" style={{ color: hueColor }} />
              sector 7
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-bold lowercase tracking-widest">
              <LinkIcon className="w-3.5 h-3.5" style={{ color: hueColor }} />
              temsync.io/{username.toLowerCase()}
            </div>
          </div>

          <div className="flex gap-8 py-4 border-y border-white/5 mt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-headline font-bold text-white">{posts.length}</span>
              <span className="text-[10px] lowercase tracking-widest font-bold text-white/40" style={{ color: viewedUser ? `hsl(${viewedUser.themeHue}, 100%, 80%)` : undefined }}>syncs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-headline font-bold text-white">1.2k</span>
              <span className="text-[10px] lowercase tracking-widest font-bold text-white/40" style={{ color: viewedUser ? `hsl(${viewedUser.themeHue}, 100%, 80%)` : undefined }}>resonance</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="syncs" className="w-full">
            <TabsList className="w-full bg-white/5 border border-white/5 h-11 p-1 rounded-xl mb-6">
              <TabsTrigger 
                value="syncs" 
                className="flex-1 rounded-lg text-[10px] font-bold lowercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white"
                style={{ color: viewedUser ? `hsl(${viewedUser.themeHue}, 100%, 80%)` : undefined }}
              >
                <Sparkles className="w-4 h-4 mr-2" style={{ color: hueColor }} />
                syncs
              </TabsTrigger>
              {isSelf && (
                <>
                  <TabsTrigger 
                    value="bookmarks" 
                    className="flex-1 rounded-lg text-[10px] font-bold lowercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white"
                    style={{ color: viewedUser ? `hsl(${viewedUser.themeHue}, 100%, 80%)` : undefined }}
                  >
                    <Bookmark className="w-4 h-4 mr-2" style={{ color: hueColor }} />
                    bookmarks
                  </TabsTrigger>
                  <TabsTrigger 
                    value="archive" 
                    className="flex-1 rounded-lg text-[10px] font-bold lowercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white"
                    style={{ color: viewedUser ? `hsl(${viewedUser.themeHue}, 100%, 80%)` : undefined }}
                  >
                    <Archive className="w-4 h-4 mr-2" style={{ color: hueColor }} />
                    archive
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="syncs" className="space-y-3 animate-fade-in outline-none">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} currentUser={currentUserProfile} />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/5">
                  <p className="text-white/30 text-[11px] italic lowercase tracking-widest">no digital signals found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-3 animate-fade-in outline-none">
              {bookmarkedPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} currentUser={currentUserProfile} />
              ))}
              {bookmarkedPosts.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/5">
                  <p className="text-white/30 text-[11px] italic lowercase tracking-widest">no bookmarks in cache.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archive" className="space-y-3 animate-fade-in outline-none">
              {archivedPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} currentUser={currentUserProfile} />
              ))}
              {archivedPosts.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/5">
                  <p className="text-white/30 text-[11px] italic lowercase tracking-widest">no archived signals.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProfileSheet 
        isOpen={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        profile={currentUserProfile}
        onUpdate={handleProfileUpdate}
      />
    </main>
  );
}
