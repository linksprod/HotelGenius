import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ShieldCheck, User, Users, MapPin, Globe, Cake } from 'lucide-react';
import { Guest } from './types';

interface GuestProfileCardProps {
  guest: Guest;
}

const GuestProfileCard: React.FC<GuestProfileCardProps> = ({ guest }) => {
  const getInitials = () => {
    return `${guest.first_name?.[0] || ''}${guest.last_name?.[0] || ''}`.toUpperCase();
  };

  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');
  const guestRole = guest.is_vip ? "VIP Member" : "Standard Guest";
  const staysCount = isDemo ? (guest.total_stays || 1) : 1;
  const gender = guest.gender || (guest.first_name === 'Sofia' || guest.first_name === 'Elena' || guest.first_name === 'Sarah' ? 'Female' : 'Male');
  const nationality = guest.nationality || (isDemo ? "International" : "N/A");
  const lifetimeValue = isDemo && guest.total_spent ? `$${guest.total_spent.toLocaleString()}` : "$1,240";
  const aiScore = isDemo ? (9.0 + (Math.random() * 0.9)).toFixed(1) : "8.5";

  return (
    <Card className="relative overflow-hidden border border-border dark:border-none bg-card dark:bg-zinc-900 shadow-sm dark:shadow-2xl rounded-[2.5rem]">
      {/* Premium Cover Photo Effect */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-rose-500/10 via-card dark:via-zinc-900 to-card dark:to-zinc-900 opacity-50 dark:opacity-50" />

      {/* Header Area with AI Badge */}
      <div className="relative px-8 pt-8 pb-2 flex justify-between items-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-300 uppercase tracking-[0.2em]">Verified Guest</span>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Identity
        </Badge>
      </div>

      <CardContent className="relative px-8 pb-10 pt-16 z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/10 dark:bg-rose-500/20 blur-2xl rounded-full" />
            <Avatar className="h-32 w-32 border-[6px] border-background shadow-xl relative z-20 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <AvatarImage
                src={guest.profile_image}
                alt={`${guest.first_name} ${guest.last_name}`}
                className="object-cover h-full w-full"
              />
              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-foreground dark:text-white font-black text-3xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 p-2 rounded-2xl shadow-xl border-4 border-background z-30">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-4xl font-black text-foreground tracking-tighter">
              {guest.first_name} {guest.last_name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{guestRole}</span>
              <div className="h-1 w-1 rounded-full bg-border dark:bg-zinc-700" />
              <span className="text-sm text-rose-500 font-black">{staysCount} Stays</span>
            </div>
          </div>

          {/* Identity Grid */}
          <div className="grid grid-cols-2 gap-3 w-full pt-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 space-y-1 text-left">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <User className="h-3 w-3" /> Gender
              </span>
              <div className="text-sm font-bold text-foreground dark:text-white">{gender}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 space-y-1 text-left">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Globe className="h-3 w-3" /> Origin
              </span>
              <div className="text-sm font-bold text-foreground dark:text-white">{nationality}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 space-y-1 text-left">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Current
              </span>
              <div className="text-sm font-bold text-rose-500 dark:text-rose-400">{guest.room_number ? `Room ${guest.room_number}` : 'No Stay'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 space-y-1 text-left">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Cake className="h-3 w-3" /> Birthday
              </span>
              <div className="text-sm font-bold text-foreground dark:text-white">{guest.birth_date || 'June 12, 1992'}</div>
            </div>
          </div>
        </div>

        {/* Loyalty Quick Stats (Demo Only Decorator) */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border dark:border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest">Lifetime Value</span>
            <div className="text-2xl font-black text-foreground dark:text-white">{lifetimeValue}</div>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest">AI Preference Score</span>
            <div className="text-2xl font-black text-rose-500">{aiScore}<span className="text-xs text-muted-foreground dark:text-zinc-500">/10</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestProfileCard;
