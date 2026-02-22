'use client';

import React, { useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  const hueColor = `hsl(${profile.themeHue}, 100%, 64%)`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] bg-card/95 backdrop-blur-2xl border-white/10 h-[85vh] overflow-y-auto custom-scrollbar">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-headline font-bold holographic-text text-center italic lowercase">
            edit sync profile
          </SheetTitle>
          <SheetDescription className="text-center text-white/60 lowercase tracking-[0.2em] text-[10px] font-bold">
            adjust your digital aura frequency
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 max-w-sm mx-auto pb-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div 
                className="w-28 h-28 rounded-full overflow-hidden border-4 holographic-glow transition-transform active:scale-95 duration-300"
                style={{ borderColor: hueColor }}
              >
                <Image src={profile.avatar} alt="Profile" fill className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>
            <p className="text-[10px] font-bold lowercase tracking-widest" style={{ color: hueColor }}>tap to change avatar</p>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] lowercase tracking-[0.2em] text-white/60 font-bold ml-1">identity tag</Label>
            <Input 
              value={profile.username.toLowerCase()}
              onChange={(e) => onUpdate({ ...profile, username: e.target.value.toLowerCase() })}
              className="bg-white/5 border-white/10 rounded-2xl h-11 focus:ring-primary/50 font-medium lowercase"
              placeholder="enter your tag..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] lowercase tracking-[0.2em] text-white/60 font-bold ml-1">biography</Label>
            <Textarea 
              value={profile.bio || ''}
              onChange={(e) => onUpdate({ ...profile, bio: e.target.value })}
              className="bg-white/5 border-white/10 rounded-2xl min-h-[80px] focus:ring-primary/50 font-medium lowercase text-xs resize-none placeholder:lowercase"
              placeholder="describe your existence in the multiverse..."
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <Label className="text-[10px] lowercase tracking-[0.2em] text-white/60 font-bold ml-1">aura frequency</Label>
              <span className="text-[10px] font-mono font-bold tracking-tighter" style={{ color: hueColor }}>{profile.themeHue}° hue</span>
            </div>
            
            <div className="relative px-1">
              <div 
                className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-2 rounded-full opacity-80"
                style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
              />
              <Slider 
                min={0} max={360} step={1} 
                value={[profile.themeHue]} 
                onValueChange={([val]) => onUpdate({ ...profile, themeHue: val })}
                className="relative z-10 py-4"
              />
            </div>
          </div>

          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full h-12 rounded-2xl text-white font-headline font-bold text-base shadow-xl lowercase transition-all active:scale-95"
            style={{ 
              backgroundColor: hueColor,
              boxShadow: `0 8px 25px -10px ${hueColor}88`
            }}
          >
            <Save className="w-5 h-5 mr-2" />
            sync realities
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
