'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Video, X, Send } from 'lucide-react';
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
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
        setMediaType(type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!content && !mediaUrl) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      username: userProfile.username.toLowerCase(),
      profilePicture: userProfile.avatar,
      content: content,
      imageUrl: mediaType === 'image' ? (mediaUrl || undefined) : undefined,
      videoUrl: mediaType === 'video' ? (mediaUrl || undefined) : undefined,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
      themeHue: userProfile.themeHue,
    };

    onPostCreated(newPost);
    setContent('');
    setMediaUrl(null);
    setMediaType(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-white/10 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline font-bold holographic-text text-center italic lowercase">
            sync new reality
          </DialogTitle>
          <DialogDescription className="text-center text-white/70 lowercase tracking-[0.2em] text-[8px]">
            broadcast your vibe to the multiverse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border" style={{ borderColor: `hsl(${userProfile.themeHue}, 100%, 64%)` }}>
              <Image src={userProfile.avatar} alt="Me" fill className="object-cover" />
            </div>
            <span className="text-xs font-bold text-white/90 lowercase">{userProfile.username.toLowerCase()}</span>
          </div>

          <Textarea
            placeholder="what's happening in your timeline?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-white/5 border-white/5 rounded-2xl min-h-[100px] text-sm focus:ring-primary/30 resize-none lowercase placeholder:lowercase"
          />

          {mediaUrl ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
              {mediaType === 'image' ? (
                <Image src={mediaUrl} alt="Upload preview" fill className="object-cover" />
              ) : (
                <video src={mediaUrl} className="w-full h-full object-cover" controls muted />
              )}
              <button 
                onClick={() => { setMediaUrl(null); setMediaType(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}
                className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group"
              >
                <ImagePlus className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />
                <span className="text-[8px] font-bold lowercase tracking-widest text-white/60">image</span>
              </button>
              
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "video/*";
                    fileInputRef.current.click();
                  }
                }}
                className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group"
              >
                <Video className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />
                <span className="text-[8px] font-bold lowercase tracking-widest text-white/60">video</span>
              </button>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        <DialogFooter>
          <Button 
            onClick={handlePost}
            disabled={!content && !mediaUrl}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/80 text-white font-headline font-bold shadow-lg shadow-primary/20 lowercase"
          >
            <Send className="w-4 h-4 mr-2" />
            sync to feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
