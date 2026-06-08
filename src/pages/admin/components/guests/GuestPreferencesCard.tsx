import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, Thermometer, Moon, Coffee, Waves, Leaf, Anchor } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GuestPreferencesCardProps {
  guestId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PREF_ICONS: Record<string, any> = {
  'Room 22°C': Thermometer,
  'Extra Pillows': Moon,
  'Oat Milk Latte': Coffee,
  'Ocean View': Waves,
  'Vegan Menu': Leaf,
  'Morning Yoga': Anchor,
};

const GuestPreferencesCard: React.FC<GuestPreferencesCardProps> = ({ guestId }) => {


  const { data: preferences = [] } = useQuery({
    queryKey: ['admin-guest-preferences', guestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_preferences')
        .select('*')
        .eq('guest_id', guestId);
      if (error) throw error;
      return data as { id: string; category: string; value: string }[];
    },
    enabled: !!guestId,
  });

  const displayPrefs = preferences.map(p => ({ value: p.value, color: 'text-primary bg-primary/10' }));

  return (
    <Card className="overflow-hidden border border-border dark:border-none bg-card/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm dark:shadow-2xl rounded-[2rem] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl">
            <Brain className="h-5 w-5 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground dark:text-white tracking-tight">Remembered Preferences</h3>
        </div>

        <div className="flex flex-wrap gap-3">
          {displayPrefs.map((pref, i) => {
            const Icon = PREF_ICONS[pref.value] || Sparkles;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-100 dark:border-white/5 transition-transform hover:scale-105 active:scale-95 ${pref.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-bold tracking-wide uppercase">{pref.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestPreferencesCard;
