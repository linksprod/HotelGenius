import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Lightbulb, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoInstructionOverlayProps {
  section: 'dashboard' | 'guests' | 'chat' | 'restaurants' | 'spa';
}

const SECTION_CONTENT = {
  dashboard: {
    title: "Welcome to the Command Center",
    description: "This is your central hub for real-time hotel performance. Monitor reservations, guest satisfaction, and AI-driven insights at a glance.",
    icon: Sparkles,
    color: "text-primary"
  },
  guests: {
    title: "Guest 360° Management",
    description: "Gain a complete view of your guest journey. Filter by in-house, arrivals, or departures to ensure every stay is perfectly personalized.",
    icon: Info,
    color: "text-blue-500"
  },
  chat: {
    title: "AI-Powered Communication",
    description: "Manage guest conversations seamlessly. Our AI handles routine inquiries, while highlighting urgent matters that need your human touch.",
    icon: Lightbulb,
    color: "text-amber-500"
  },
  restaurants: {
    title: "Culinary Operations",
    description: "Manage your hotel's dining experiences. View performance, update menus, and ensure every table reservation is a delightful moment.",
    icon: Sparkles,
    color: "text-emerald-500"
  },
  spa: {
    title: "Wellness & Spa Control",
    description: "Optimize your relaxation services. Track bookings, manage treatments, and showcase your premium wellness offerings to every guest.",
    icon: CheckCircle2,
    color: "text-purple-500"
  }
};

const DemoInstructionOverlay: React.FC<DemoInstructionOverlayProps> = ({ section }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');

  useEffect(() => {
    if (!isDemo) return;

    const hasSeen = localStorage.getItem(`demo_instruction_${section}`);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 1500); // Delay for better flow
      return () => clearTimeout(timer);
    }
  }, [section, isDemo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isVisible) {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`demo_instruction_${section}`, 'true');
  };

  if (!isDemo || !isVisible) return null;

  const content = SECTION_CONTENT[section];
  const Icon = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-end p-6 md:p-12 pointer-events-none"
      >
        <motion.div
          initial={{ x: 100, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.9 }}
          className="w-full max-w-sm bg-white/10 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 bg-white/10 rounded-2xl ${content.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-white/40" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 leading-tight">
            {content.title}
          </h3>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            {content.description}
          </p>
          
          <Button
            onClick={handleDismiss}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-12 font-semibold"
          >
            Got it, Let's Explore
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoInstructionOverlay;
