import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Sparkles } from 'lucide-react';
import { Guest } from './types';

interface GuestIntelligenceCardProps {
  guest: Guest;
}

const GuestIntelligenceCard: React.FC<GuestIntelligenceCardProps> = ({ guest }) => {
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
  );
};

export default GuestIntelligenceCard;
