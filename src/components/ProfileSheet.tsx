'use client';

import React, { useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Camera, Save } from 'lucide-react';
import Image from 'next/image';
import type { UserProfile } from '@/app/page';

interface ProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export function ProfileSheet({ isOpen, onOpenChange, profile, onUpdate }: ProfileSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] bg-card/95 backdrop-blur-2xl border-white/10 h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-2xl font-headline font-bold holographic-text text-center italic">
            Edit Sync Profile
          </SheetTitle>
          <SheetDescription className="text-center text-white/40 uppercase tracking-[0.2em] text-[10px]">
            Adjust your digital aura
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-10 max-w-sm mx-auto pb-10">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 holographic-glow transition-transform active:scale-95"
                style={{ borderColor: `hsl(${profile.themeHue}, 100%, 64%)` }}
              >
                <Image 
                  src={profile.avatar} 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Tap to change avatar</p>
          </div>

          {/* Name Section */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">Identity Tag</Label>
            <Input 
              value={profile.username}
              onChange={(e) => onUpdate({ ...profile, username: e.target.value })}
              className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/50 font-medium"
              placeholder="Enter your tag..."
            />
          </div>

          {/* Theme Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <Label className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">Aura Frequency</Label>
              <span className="text-[10px] font-mono text-primary font-bold">{profile.themeHue}° HUE</span>
            </div>
            <Slider 
              min={0} 
              max={360} 
              step={1} 
              value={[profile.themeHue]} 
              onValueChange={([val]) => onUpdate({ ...profile, themeHue: val })}
              className="py-4"
            />
            <div className="grid grid-cols-6 gap-2">
              {[0, 60, 120, 180, 240, 300].map((h) => (
                <button
                  key={h}
                  onClick={() => onUpdate({ ...profile, themeHue: h })}
                  className="h-8 rounded-lg border border-white/10 transition-transform active:scale-90"
                  style={{ backgroundColor: `hsl(${h}, 100%, 64%)` }}
                />
              ))}
            </div>
          </div>

          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/80 text-white font-headline font-bold text-lg shadow-xl shadow-primary/20"
          >
            <Save className="w-5 h-5 mr-2" />
            Sync Realities
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
