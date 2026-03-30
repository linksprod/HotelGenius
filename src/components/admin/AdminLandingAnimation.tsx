import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, DollarSign, ClipboardCheck, CalendarCheck, ChevronRight, Users, Star, Clock, Smartphone, Zap, ArrowRight, BarChart3 } from 'lucide-react';
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
  const [statsPage, setStatsPage] = useState<1 | 2>(1);
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

  useEffect(() => {
    if (stage === 'stats' && statsPage === 1) {
      const timer = setTimeout(() => {
        setStatsPage(2);
      }, 6500); // Wait for Slide 1 animations to breath before swapping
      return () => clearTimeout(timer);
    }
  }, [stage, statsPage]);

  useEffect(() => {
    if (stage === 'stats' && statsPage === 2) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 400);
      }, 6500); // Auto-dismiss Slide 2 after showing impact cards
      return () => clearTimeout(timer);
    }
  }, [stage, statsPage, onDismiss]);

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
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const renderStars = () => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="landing-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 dark:bg-black/40 backdrop-blur-md md:left-[240px]"
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
                  className="text-muted-foreground text-lg font-light tracking-wide italic"
                >
                  Initializing Admin Neural Interface...
                </motion.p>
                <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                   <AnimatePresence mode="popLayout">
                    <motion.span
                      key={countdown}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5, y: -20 }}
                      transition={{ duration: 0.5, ease: "backOut" }}
                      className="text-7xl font-bold text-foreground dark:text-white tracking-tighter"
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
                className="max-w-4xl w-full p-4 md:p-6 space-y-4"
              >
                <AnimatePresence mode="wait">
                  {statsPage === 1 ? (
                    <motion.div
                      key="page-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-8"
                    >
                      {/* Main Animated Stats - Primary Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                        {/* Revenue / Direct Bookings Panel */}
                        <motion.div
                          variants={cardVariants}
                          className="relative overflow-hidden bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-2xl flex flex-col justify-between group transition-all duration-300 hover:bg-white/10"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-primary/20 rounded-xl">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Live Performance</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-foreground dark:text-white">
                              <CountingNumber value={34} suffix="%" />
                            </h2>
                            <p className="text-sm font-light text-muted-foreground dark:text-white/70">Direct Bookings Growth</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/5">
                            <p className="text-[10px] text-muted-foreground/40 font-medium italic">"Organic growth from channel optimization"</p>
                          </div>
                        </motion.div>

                        {/* Upsells Panel */}
                        <motion.div
                          variants={cardVariants}
                          className="relative overflow-hidden bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 hover:bg-white/10"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-emerald-500/20 rounded-xl">
                              <DollarSign className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">Revenue Boost</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-emerald-500 dark:text-emerald-400">
                              <CountingNumber value={2100} prefix="+ $" />
                            </h2>
                            <p className="text-sm font-light text-muted-foreground dark:text-white/70">Weekly Upsell Revenue</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/5">
                            <p className="text-[10px] text-muted-foreground/40 font-medium italic">"Weekly secondary spend per active guest"</p>
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
                            className="flex flex-col gap-3 bg-card/60 dark:bg-white/5 border border-border dark:border-white/10 p-5 rounded-[1.5rem] backdrop-blur-xl hover:bg-card/80 dark:hover:bg-white/10 transition-colors"
                          >
                            <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                              <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground dark:text-white leading-none">
                                <CountingNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
                              </p>
                              <p className="text-[9px] text-muted-foreground/60 dark:text-white/40 uppercase tracking-[0.2em] font-bold mt-1">{stat.label}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="h-2" /> {/* Spacer for auto-timed swap */}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="page-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
                        {[
                          { icon: ClipboardCheck, color: "text-blue-400", bg: "bg-blue-500/20", value: 60, suffix: "%", label: "Operations", sub: "Task Reduction", desc: "Front desk workload reduced in our pilot." },
                          { icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/20", value: 45, suffix: " min", label: "Guest Time", sub: "Saved per Day", desc: "Faster check-ins via digital service." },
                          { icon: Star, color: "text-amber-400", bg: "bg-amber-500/20", value: 5, label: "Satisfaction", sub: "Guest Rating", stars: true, desc: "Significant boost in feedback quality." },
                          { icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/20", value: 180, prefix: "+$", label: "Revenue", sub: "Extra per Stay", desc: "Upselling via AI concierge services." },
                        ].map((stat, idx) => (
                          <motion.div
                            key={idx}
                            variants={cardVariants}
                            className="relative overflow-hidden bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-2xl flex flex-col justify-between group transition-all duration-300 hover:bg-white/10"
                          >
                            <div className="flex items-start justify-between mb-6">
                              <div className={`p-4 ${stat.bg} rounded-xl`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                              </div>
                              <div className="text-right">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${stat.color}/80`}>{stat.label}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h2 className={`text-2xl md:text-3xl font-bold tracking-tighter ${stat.color}`}>
                                  {stat.stars ? (
                                    <div className="flex flex-col gap-2">
                                      <span>5.0</span>
                                      {renderStars()}
                                    </div>
                                  ) : (
                                    <CountingNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                  )}
                                </h2>
                              </div>
                              <p className="text-sm font-medium text-muted-foreground dark:text-white/70">{stat.sub}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/5">
                              <p className="text-[10px] text-muted-foreground/40 font-medium italic">"{stat.desc}"</p>
                            </div>

                          </motion.div>
                        ))}
                      </div>

                      <div className="h-2" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {statsPage === 1 && (
                  <motion.div
                    variants={cardVariants}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      size="lg"
                      onClick={() => {
                        setIsVisible(false);
                        setTimeout(onDismiss, 400);
                      }}
                      className="h-14 px-10 text-lg font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_20px_50px_rgba(22,163,74,0.3)] group transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    >
                      Enter Command Center
                      <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminLandingAnimation;
