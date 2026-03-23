import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'info' | 'vip' | 'trend' | 'success';
  message: string;
  time: string;
}

const DEMO_ALERTS: Alert[] = [
  { id: '1', type: 'vip', message: "VIP Marcus Chen just arrived at the airport - Prep PH1 for immediate arrival.", time: "Just now" },
  { id: '2', type: 'trend', message: "F&B Alert: Restaurant 'Lumina' is trending at 95% capacity for tonight.", time: "2m ago" },
  { id: '3', type: 'info', message: "Weather Alert: Evening rooftop event moved to Grand Ballroom due to light rain.", time: "5m ago" },
  { id: '4', type: 'success', message: "Milestone: Guest Satisfaction today is at an all-time high of 9.4/10.", time: "10m ago" },
  { id: '5', type: 'vip', message: "Sofia Al-Fayed requested Zen Wellness items for her afternoon tea at 4:15 PM.", time: "15m ago" }
];

const AILiveIntelligence: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DEMO_ALERTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = DEMO_ALERTS[index];

  return (
    <div className="bg-card/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-border dark:border-white/5 rounded-2xl overflow-hidden shadow-sm h-20 flex items-center px-6 gap-4">
      <div className="flex-shrink-0 flex items-center gap-3 pr-4 border-r border-border dark:border-white/10">
        <div className="p-2 bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20">
          <Sparkles className="h-4 w-4 text-white animate-pulse" />
        </div>
        <div className="hidden md:block">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-none mb-1">Live Intelligence</p>
          <p className="text-xs font-bold text-foreground leading-none">AI Insights</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center gap-3"
          >
            {current.type === 'vip' && <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />}
            {current.type === 'trend' && <Zap className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />}
            {current.type === 'info' && <Bell className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            {current.type === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
            
            <p className="text-sm font-semibold text-foreground truncate pr-4">
              {current.message}
            </p>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-auto shrink-0">
              {current.time}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AILiveIntelligence;
