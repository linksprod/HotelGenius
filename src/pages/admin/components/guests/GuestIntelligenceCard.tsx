import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, StickyNote, Plus, MessageSquare, Sparkles } from 'lucide-react';
import { Guest } from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GuestIntelligenceCardProps {
  guest: Guest;
}

const GuestIntelligenceCard: React.FC<GuestIntelligenceCardProps> = ({ guest }) => {
  const queryClient = useQueryClient();


  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-guest-alerts', guest.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_medical_alerts')
        .select('*')
        .eq('guest_id', guest.id);
      if (error) throw error;
      return data as { id: string; alert_type: string; severity: string; description: string }[];
    },
    enabled: !!guest.id,
  });

  const displayAlerts = alerts;

  return (
    <div className="space-y-8">
      {/* AI Summary Card */}
      <Card className="overflow-hidden border border-zinc-100 dark:border-white/5 bg-gradient-to-br from-rose-500/5 to-purple-500/5 dark:from-rose-500/10 dark:to-purple-500/10 backdrop-blur-xl shadow-sm dark:shadow-2xl rounded-[2.5rem] cursor-pointer hover:from-rose-500/10 hover:to-purple-500/10 dark:hover:from-rose-500/15 dark:hover:to-purple-500/15 transition-all">
        <CardContent className="p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 rounded-xl shadow-lg shadow-rose-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground dark:text-white tracking-tight">AI Generated Insights</h3>
              <p className="text-xs font-bold text-rose-500/80 dark:text-rose-500/80 uppercase tracking-widest mt-0.5">Updated just now</p>
            </div>
          </div>

          <p
            className="text-xl text-foreground dark:text-zinc-200 leading-relaxed font-semibold"
            dangerouslySetInnerHTML={{ __html: guest.ai_summary || 'No AI insights available yet.' }}
          />

          <div className="pt-4 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest mb-1">Stay Duration</span>
              <span className="text-sm font-bold text-foreground dark:text-white">-</span>
            </div>
            <div className="h-8 w-px bg-border dark:bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest mb-1">Main Interest</span>
              <span className="text-sm font-bold text-rose-500 dark:text-rose-400">-</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Alerts Section */}
        <Card className="overflow-hidden border border-border dark:border-none bg-card/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm dark:shadow-2xl rounded-[2rem] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <Shield className="h-5 w-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground dark:text-white tracking-tight">Active Alerts</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10">
                <Plus className="h-4 w-4 text-muted-foreground dark:text-zinc-400" />
              </Button>
            </div>

            <div className="space-y-3">
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {displayAlerts.map((alert: any) => (
                <div key={alert.id} className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 group hover:border-rose-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] font-bold uppercase tracking-widest">
                      {alert.alert_type}
                    </Badge>
                    <div className={`h-1.5 w-1.5 rounded-full ${alert.severity === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  </div>
                  <p className="text-sm font-bold text-foreground dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-100 transition-colors">
                    {alert.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Notes Section */}
        <Card className="overflow-hidden border border-border dark:border-none bg-card/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm dark:shadow-2xl rounded-[2rem] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground dark:text-white tracking-tight">Staff Notes</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10">
                <Plus className="h-4 w-4 text-muted-foreground dark:text-zinc-400" />
              </Button>
            </div>

                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground italic">
                  No notes available
                </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestIntelligenceCard;
