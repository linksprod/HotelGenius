import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { Guest } from './types';

interface GuestIntelligenceCardProps {
  guest: Guest;
}

const GuestIntelligenceCard: React.FC<GuestIntelligenceCardProps> = ({ guest }) => {
  return (
    <div className="space-y-8">
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
