'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, X, Send } from 'lucide-react';
import Image from 'next/image';
import type { Post } from '@/ai/flows/generate-initial-dummy-posts';
import type { UserProfile } from '@/app/page';

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile;
  onPostCreated: (post: Post) => void;
}

export function CreatePostDialog({ isOpen, onOpenChange, userProfile, onPostCreated }: CreatePostDialogProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!content && !image) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      username: userProfile.username,
      profilePicture: userProfile.avatar,
      content: content,
      imageUrl: image || `https://picsum.photos/seed/${Date.now()}/600/800`,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
      themeHue: userProfile.themeHue,
    };

    onPostCreated(newPost);
    setContent('');
    setImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-white/10 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline font-bold holographic-text text-center italic">
            Sync New Reality
          </DialogTitle>
          <DialogDescription className="text-center text-white/40 uppercase tracking-[0.2em] text-[8px]">
            Broadcast your vibe to the multiverse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border" style={{ borderColor: `hsl(${userProfile.themeHue}, 100%, 64%)` }}>
              <Image src={userProfile.avatar} alt="Me" fill className="object-cover" />
            </div>
            <span className="text-xs font-bold text-white/80">{userProfile.username}</span>
          </div>

          <Textarea
            placeholder="What's happening in your timeline?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-white/5 border-white/5 rounded-2xl min-h-[100px] text-sm focus:ring-primary/30 resize-none"
          />

          {image ? (
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
              <Image src={image} alt="Upload preview" fill className="object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group"
            >
              <ImagePlus className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Attach Visual Aura</span>
            </button>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange}
          />
        </div>

        <DialogFooter>
          <Button 
            onClick={handlePost}
            disabled={!content && !image}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/80 text-white font-headline font-bold shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4 mr-2" />
            Sync to Feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
