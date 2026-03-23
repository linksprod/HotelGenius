import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils, Zap, Clock, Star, ArrowUpCircle, CalendarCheck } from 'lucide-react';

interface GuestActivityCardProps {
  // We'll use these but mostly decorator data for demo
}

const GuestActivityCard: React.FC<GuestActivityCardProps> = () => {
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');

  const demoActivity = [
    {
      id: 1,
      title: "Booked Spa — Deep Tissue Massage",
      time: "2h ago",
      icon: Star,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      id: 2,
      title: "Room upgraded to Ocean Suite",
      time: "1d ago",
      icon: ArrowUpCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: 3,
      title: "Requested late checkout (14:00)",
      time: "1d ago",
      icon: Clock,
      iconColor: "text-zinc-400",
      bgColor: "bg-zinc-400/10"
    }
  ];

  if (!isDemo) return null; // Fallback or handle real data if needed

  return (
    <Card className="overflow-hidden border border-border dark:border-none bg-card/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm dark:shadow-2xl rounded-[2rem] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl">
            <Zap className="h-5 w-5 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground dark:text-white tracking-tight">Recent Activity</h3>
        </div>

        <div className="space-y-4">
          {demoActivity.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 transition-all hover:bg-zinc-100 dark:hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.iconColor}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground dark:text-white leading-none mb-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest">
                    {item.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestion Decorator */}
        <div className="mt-6 p-5 bg-rose-500/5 dark:bg-rose-500/10 rounded-2xl border border-rose-500/10 dark:border-rose-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3">
             <Brain className="h-4 w-4 text-rose-500/20 dark:text-rose-500/30" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="h-4 w-4 text-rose-500" />
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">AI Suggestion</span>
          </div>
          <p className="text-xs text-rose-900/80 dark:text-rose-100/80 leading-relaxed font-medium">
            Laurent usually books a dinner on his 2nd night. Consider offering the <span className="text-rose-500 dark:text-rose-400 font-bold">Chef's Table</span> experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Help Brain icon (import it properly if used)
const Brain = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.48Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.48Z"/>
  </svg>
);

export default GuestActivityCard;
