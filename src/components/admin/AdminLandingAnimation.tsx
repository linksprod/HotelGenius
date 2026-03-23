import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, DollarSign, ClipboardCheck, CalendarCheck, ChevronRight, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CountingNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

const CountingNumber: React.FC<CountingNumberProps> = ({ value, duration = 2, prefix = '', suffix = '', className = '', decimals = 0 }) => {
  const springValue = useSpring(0, {
    mass: 1,
    stiffness: 40,
    damping: 20,
  });

  const displayValue = useTransform(springValue, (latest) => {
    const formatted = latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      springValue.set(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value, springValue]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};

interface AdminLandingAnimationProps {
  onDismiss: () => void;
}

const AdminLandingAnimation: React.FC<AdminLandingAnimationProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<'countdown' | 'stats'>('countdown');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (stage === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setStage('stats'), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [countdown, stage]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Apple-style ease-out expo
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="landing-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xl md:left-[240px] flex flex-col items-center py-10 md:justify-center"
        >
          <AnimatePresence mode="wait">
            {stage === 'countdown' ? (
              <motion.div
                key="countdown-stage"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center space-y-4"
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/60 text-lg font-light tracking-wide italic"
                >
                  Loading your Command Center...
                </motion.p>
                <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={countdown}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5, y: -20 }}
                      transition={{ duration: 0.5, ease: "backOut" }}
                      className="text-7xl font-bold text-white tracking-tighter"
                    >
                      {countdown > 0 ? countdown : "Go"}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="stats-stage"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl w-full p-6 md:p-12 space-y-8"
              >
                {/* Main Animated Stats - Primary Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  {/* Revenue / Direct Bookings Panel - Apple Style Glassmorphism */}
                  <motion.div
                    variants={cardVariants}
                    className="relative overflow-hidden bg-white/10 dark:bg-white/5 border border-white/20 rounded-[2rem] p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 bg-primary/20 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Live Performance</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                        <CountingNumber value={34} suffix="%" />
                      </h2>
                      <p className="text-xl font-light text-white/70">Direct Bookings Growth</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/40 font-medium tracking-wide italic">"Optimizing channel conversion"</p>
                    </div>
                  </motion.div>

                  {/* Upsells Panel - Emerald Accent */}
                  <motion.div
                    variants={cardVariants}
                    className="relative overflow-hidden bg-white/10 dark:bg-white/5 border border-white/20 rounded-[2rem] p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 bg-emerald-500/20 rounded-xl">
                        <DollarSign className="h-8 w-8 text-emerald-400" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">Revenue Boost</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-emerald-400">
                        <CountingNumber value={2100} prefix="+ $" />
                      </h2>
                      <p className="text-xl font-light text-white/70">Weekly Upsell Revenue</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/40 font-medium tracking-wide italic">"Exceeding revenue targets"</p>
                    </div>
                  </motion.div>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: ClipboardCheck, color: "text-blue-400", bg: "bg-blue-500/10", value: 20, label: "Requests Solved", prefix: "+ " },
                    { icon: CalendarCheck, color: "text-orange-400", bg: "bg-orange-500/10", value: 48, label: "Bookings Today", prefix: "+ " },
                    { icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", value: 124, label: "Guests Connected", prefix: "" },
                    { icon: Star, color: "text-amber-400", bg: "bg-amber-500/10", value: 9.2, label: "Feedback Rating", suffix: "/10", decimals: 1 },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      variants={cardVariants}
                      className="flex flex-col gap-3 bg-white/5 border border-white/10 p-5 rounded-[1.5rem] backdrop-blur-xl hover:bg-white/10 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white leading-none">
                          <CountingNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
                        </p>
                        <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold mt-1">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button - Cinematic Transition */}
                <motion.div
                  variants={cardVariants}
                  className="flex justify-center pt-8"
                >
                  <Button
                    size="lg"
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(onDismiss, 400);
                    }}
                    className="h-16 px-12 text-xl font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_20px_50px_rgba(22,163,74,0.3)] group transition-all duration-300 hover:scale-[1.03] active:scale-95"
                  >
                    Access Command Center
                    <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminLandingAnimation;
