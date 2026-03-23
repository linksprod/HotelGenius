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
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');

  const demoInsights: Record<string, any> = {
    'demo-1': {
      summary: `"${guest.first_name} is classified as a <span class="text-rose-400 italic">high-value aesthetic enthusiast</span>. She consistently prioritizes wellness and quiet-zone suites. <span class="text-white underline decoration-rose-500 decoration-2 underline-offset-8">Behavioral patterns</span> indicate she prefers automated check-ins and afternoon tea service at 4:15 PM precisely."`,
      stayDuration: '11 Nights',
      mainInterest: 'Zen Wellness',
      alerts: [
        { id: '1', alert_type: 'Allergy', severity: 'High', description: 'Severe Peanut Allergy' },
        { id: '2', alert_type: 'Preference', severity: 'Medium', description: 'Requires hypo-allergenic pillows' }
      ],
      notes: [
        { team: 'Concierge Team', date: 'Yesterday', content: "Sofia mentioned she's celebrating her anniversary. We've prepared a special amenity." },
        { team: 'Housekeeping', date: '2 days ago', content: "Guest requested extra bamboo towels for the duration of the stay." }
      ]
    },
    'demo-2': {
      summary: `"${guest.first_name} is a <span class="text-blue-400 italic">productivity-focused business traveler</span>. He relies heavily on high-speed connectivity and seamless room service. <span class="text-white underline decoration-blue-500 decoration-2 underline-offset-8">Behavioral patterns</span> suggest early gym sessions and a preference for express checkout."`,
      stayDuration: '4 Nights',
      mainInterest: 'Efficiency',
      alerts: [
        { id: '1', alert_type: 'Technical', severity: 'Medium', description: 'Requires multiple power adapters' }
      ],
      notes: [
        { team: 'Front Desk', date: 'Today', content: "James requested an early taxi for 6:00 AM tomorrow." },
        { team: 'Business Center', date: 'Yesterday', content: "Assisted with large-scale printing for his morning presentation." }
      ]
    },
    'demo-3': {
      summary: `"${guest.first_name} is a <span class="text-emerald-400 italic">luxury leisure seeker</span>. She values exclusive experiences and premium gastronomy. <span class="text-white underline decoration-emerald-500 decoration-2 underline-offset-8">Behavioral patterns</span> show a high engagement with spa services and poolside cabana bookings."`,
      stayDuration: '8 Nights',
      mainInterest: 'Fine Dining',
      alerts: [
        { id: '1', alert_type: 'Medical', severity: 'Low', description: 'Mild hay fever - avoid lilies in room' }
      ],
      notes: [
        { team: 'F&B Manager', date: 'Last Night', content: "Elena highly praised the vintage selection at the cellar." },
        { team: 'Spa Team', date: '3 days ago', content: "Enjoys deep-tissue massage. Preferred therapist is Maria." }
      ]
    },
    'demo-4': {
      summary: `"${guest.first_name} is a <span class="text-amber-400 italic">top-tier VIP executive</span>. He demands extreme privacy and bespoke service. <span class="text-white underline decoration-amber-500 decoration-2 underline-offset-8">Behavioral patterns</span> indicate preference for late-night room service and private transportation."`,
      stayDuration: '14 Nights',
      mainInterest: 'UHNW Privacy',
      alerts: [
        { id: '1', alert_type: 'Security', severity: 'High', description: 'Restricted floor access - VIP protocol' }
      ],
      notes: [
        { team: 'Security', date: 'Today', content: "Private entrance managed for Marcus. No issues reported." },
        { team: 'Concierge', date: '2 days ago', content: "Arranged private jet catering for his departure." }
      ]
    },
    'demo-5': {
      summary: `"${guest.first_name} is an <span class="text-zinc-400 italic">experienced cultural explorer</span>. She values local authenticity and informative assistance. <span class="text-white underline decoration-zinc-500 decoration-2 underline-offset-8">Behavioral patterns</span> show interest in guided tours and historical site recommendations."`,
      stayDuration: '3 Nights',
      mainInterest: 'Heritage',
      alerts: [
        { id: '1', alert_type: 'Mobility', severity: 'Low', description: 'Prefers lower floors near elevator' }
      ],
      notes: [
        { team: 'Tour Desk', date: 'Yesterday', content: "Sarah loved the old town walking tour. Suggested the museum for today." }
      ]
    },
    'demo-6': {
      summary: `"${guest.first_name} is a <span class="text-purple-400 italic">wellness-centric new traveler</span>. She is highly responsive to tailored recommendations for relaxation. <span class="text-white underline decoration-purple-500 decoration-2 underline-offset-8">Behavioral patterns</span> suggest interest in early morning meditation and organic dining."`,
      stayDuration: '3 Nights',
      mainInterest: 'Mindfulness',
      alerts: [
        { id: '1', alert_type: 'Dietary', severity: 'Medium', description: 'Gluten-free and Lactose-free' }
      ],
      notes: [
        { team: 'Wellness Coach', date: 'Today', content: "Yuki joined the sunrise yoga session. Very enthusiastic." }
      ]
    }
  };

  const currentDemo = demoInsights[guest.id] || demoInsights['demo-1'];

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
    enabled: !!guest.id && !isDemo,
  });

  const displayAlerts = isDemo ? currentDemo.alerts : alerts;

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
            dangerouslySetInnerHTML={{ __html: isDemo ? currentDemo.summary : guest.ai_summary || 'No AI insights available yet.' }}
          />
          
          <div className="pt-4 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest mb-1">Stay Duration</span>
              <span className="text-sm font-bold text-foreground dark:text-white">{isDemo ? currentDemo.stayDuration : '-'}</span>
            </div>
            <div className="h-8 w-px bg-border dark:bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest mb-1">Main Interest</span>
              <span className="text-sm font-bold text-rose-500 dark:text-rose-400">{isDemo ? currentDemo.mainInterest : '-'}</span>
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

            <div className="space-y-4">
              {isDemo ? currentDemo.notes.map((note: any, idx: number) => (
                <div key={idx} className={cn("p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 relative group hover:border-blue-500/30 transition-colors", idx > 0 && "opacity-60")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest leading-none">{note.team}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 dark:text-zinc-600 uppercase tracking-widest leading-none">{note.date}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground dark:text-zinc-200 group-hover:text-foreground/80 dark:group-hover:text-white transition-colors">
                    {note.content}
                  </p>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground italic">
                  No notes available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestIntelligenceCard;
