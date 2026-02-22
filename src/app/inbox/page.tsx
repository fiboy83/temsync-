'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Clock, ShieldCheck, Send, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/app/page';

interface Message {
  id: string;
  sender: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  hue: number;
}

interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: string;
}

const DUMMY_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'cyber_wanderer',
    avatar: 'https://picsum.photos/seed/wanderer/100/100',
    preview: 'did you catch the latest resonance shift in sector 4? the signals are peaking.',
    time: '2m ago',
    unread: true,
    hue: 180,
  },
  {
    id: 'msg-2',
    sender: 'neon_dreamer',
    avatar: 'https://picsum.photos/seed/dreamer/100/100',
    preview: 'the holographic backdrop you synced is incredible. how did you stabilize the frequency?',
    time: '14m ago',
    unread: true,
    hue: 300,
  },
  {
    id: 'msg-3',
    sender: 'pixel_pulse',
    avatar: 'https://picsum.photos/seed/pulse/100/100',
    preview: 'incoming signal from the lower timeline. we might need to recalibrate the neural link.',
    time: '1h ago',
    unread: false,
    hue: 45,
  },
  {
    id: 'msg-4',
    sender: 'void_navigator',
    avatar: 'https://picsum.photos/seed/void/100/100',
    preview: 'requesting permission to sync with your current trajectory. the void is calm today.',
    time: '3h ago',
    unread: false,
    hue: 220,
  }
];

export default function InboxPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
  });

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ [key: string]: ChatMessage[] }>({});
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const updateGlobalTheme = (hue: number) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', `${hue} 100% 64%`);
    root.style.setProperty('--accent', `${hue} 100% 64%`);
    root.style.setProperty('--ring', `${hue} 100% 64%`);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfile(parsed);
      updateGlobalTheme(parsed.themeHue);
    }

    const initialHistories: { [key: string]: ChatMessage[] } = {};
    DUMMY_MESSAGES.forEach(msg => {
      initialHistories[msg.id] = [
        {
          id: `initial-${msg.id}`,
          text: msg.preview,
          isMe: false,
          timestamp: msg.time
        }
      ];
    });
    setChatHistory(initialHistories);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMessageId, chatHistory]);

  const selectedMessage = DUMMY_MESSAGES.find(m => m.id === selectedMessageId);
  const currentChat = selectedMessageId ? chatHistory[selectedMessageId] || [] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessageId) return;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      text: replyText,
      isMe: true,
      timestamp: 'just now'
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedMessageId]: [...(prev[selectedMessageId] || []), newMsg]
    }));
    setReplyText('');
  };

  const userHueColor = `hsl(${userProfile.themeHue}, 100%, 64%)`;

  if (selectedMessageId && selectedMessage) {
    const senderHueColor = `hsl(${selectedMessage.hue}, 100%, 64%)`;
    
    return (
      <main className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedMessageId(null)}
              className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push(`/profile/${selectedMessage.sender.toLowerCase()}`)}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 transition-transform active:scale-95" 
                style={{ borderColor: senderHueColor }}
              >
                <Image src={selectedMessage.avatar} alt={selectedMessage.sender} fill className="object-cover" />
              </button>
              <div className="cursor-pointer" onClick={() => router.push(`/profile/${selectedMessage.sender.toLowerCase()}`)}>
                <h2 className="text-[14px] font-bold lowercase tracking-tight hover:underline transition-all" style={{ color: senderHueColor }}>
                  {selectedMessage.sender}
                </h2>
                <div className="flex items-center gap-1 opacity-40">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-bold lowercase tracking-widest">online</span>
                </div>
              </div>
            </div>
          </div>
          <button className="p-2 text-white/30 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Message Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          {currentChat.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col max-w-[85%] animate-fade-in",
                msg.isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div 
                className={cn(
                  "p-3.5 rounded-2xl text-[14px] lowercase leading-relaxed border backdrop-blur-2xl shadow-lg transition-all",
                  msg.isMe 
                    ? "bg-white/10 border-white/10 text-white rounded-tr-none" 
                    : "bg-white/5 border-white/5 text-white/90 rounded-tl-none"
                )}
                style={msg.isMe ? { borderRight: `2px solid ${userHueColor}` } : { borderLeft: `2px solid ${senderHueColor}` }}
              >
                {msg.text}
              </div>
              <span className="mt-1.5 text-[9px] font-bold text-white/20 lowercase tracking-widest px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Reply Bar */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-2xl border-t border-white/5 p-4 pb-8">
          <form onSubmit={handleSendMessage} className="flex gap-2 max-w-lg mx-auto w-full">
            <Input 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="beam a response..."
              className="bg-white/5 border-white/10 rounded-xl h-12 text-sm lowercase placeholder:lowercase placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-primary/30 backdrop-blur-md"
            />
            <button 
              type="submit"
              disabled={!replyText.trim()}
              className="h-12 w-12 flex items-center justify-center rounded-xl transition-all active:scale-90 disabled:opacity-20 shadow-lg bg-primary"
              style={{ boxShadow: `0 8px 20px -6px ${userHueColor}66` }}
            >
              <Send className="w-5 h-5 text-black" />
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-8 pb-10 bg-background">
      <div className="max-w-lg mx-auto px-4 w-full relative">
        <button 
          onClick={() => router.push('/')}
          className="absolute top-2 left-4 p-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/60 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-12 mt-12 text-center">
          <h1 className="text-3xl font-headline font-bold holographic-text italic lowercase tracking-tight">
            inbox
          </h1>
          <p className="text-[10px] text-white/50 lowercase tracking-[0.3em] font-bold mt-2">
            neural transmissions received
          </p>
        </div>

        <div className="space-y-4">
          {DUMMY_MESSAGES.map((msg, idx) => (
            <div 
              key={msg.id}
              className="bg-white/5 backdrop-blur-2xl rounded-[1.75rem] p-4 border transition-all animate-fade-in group hover:bg-white/10 relative overflow-hidden active:scale-[0.98]"
              style={{ 
                animationDelay: `${idx * 100}ms`,
                borderColor: `hsl(${msg.hue}, 100%, 64%, 0.25)`,
                boxShadow: msg.unread ? `0 4px 20px -12px hsl(${msg.hue}, 100%, 64%, 0.3)` : 'none'
              }}
            >
              {msg.unread && (
                <div 
                  className="absolute top-0 left-0 w-1 h-full opacity-60"
                  style={{ backgroundColor: `hsl(${msg.hue}, 100%, 64%)` }}
                />
              )}

              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => router.push(`/profile/${msg.sender.toLowerCase()}`)}
                  className="relative w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform hover:scale-105 z-10" 
                  style={{ borderColor: `hsl(${msg.hue}, 100%, 64%)` }}
                >
                  <Image src={msg.avatar} alt={msg.sender} fill className="object-cover" />
                  {msg.unread && (
                    <div 
                      className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background animate-pulse" 
                      style={{ backgroundColor: `hsl(${msg.hue}, 100%, 64%)` }}
                    />
                  )}
                </button>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedMessageId(msg.id)}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[14px] font-bold lowercase tracking-tight" style={{ color: `hsl(${msg.hue}, 100%, 64%)` }}>
                        {msg.sender}
                      </h3>
                      {idx % 2 === 0 && <ShieldCheck className="w-3 h-3 opacity-40" />}
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold lowercase tracking-tighter">{msg.time}</span>
                    </div>
                  </div>
                  <p className={`text-[13px] lowercase tracking-tight leading-snug truncate ${msg.unread ? 'text-white font-medium' : 'text-white/60'}`}>
                    {msg.preview}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {DUMMY_MESSAGES.length === 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-4 border border-dashed border-white/10 flex flex-col items-center justify-center py-24 gap-6">
              <div className="p-5 rounded-full bg-white/5" style={{ boxShadow: `0 0 30px -5px ${userHueColor}44` }}>
                <Sparkles className="w-10 h-10" style={{ color: userHueColor }} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-white lowercase">no active frequencies</p>
                <p className="text-[11px] text-white/40 lowercase tracking-wider max-w-[200px] mx-auto leading-relaxed">your inbox is currently clear in this timeline.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-center gap-8">
          <div className="text-center">
            <span className="block text-xl font-headline font-bold text-white">2</span>
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/30">unread</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-headline font-bold text-white">24</span>
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/30">archived</span>
          </div>
        </div>
      </div>
    </main>
  );
}
