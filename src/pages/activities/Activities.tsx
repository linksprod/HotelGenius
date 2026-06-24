import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Sparkles, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useHotelActivities } from '@/hooks/useHotelActivities';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 90, damping: 16 },
  },
};

const Activities = () => {
  const { t } = useTranslation();
  const { hotelId, hotel } = useHotel();
  const { activities, isLoading } = useHotelActivities(hotelId);

  return (
    <Layout>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-8 pb-10 px-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {hotel?.name || 'Your Hotel'}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          Today's Activities
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
          Explore today's schedule of daily hotel activities.
        </p>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[35vh] gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading today's schedule…</p>
        </div>
      ) : activities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[35vh] text-center px-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
            <Calendar className="w-9 h-9 text-primary/70" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No activities today</h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            The hotel team hasn't scheduled any activities for today yet. Check back soon!
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="relative h-full rounded-2xl bg-card border border-border dark:border-white/[0.05] shadow-sm hover:shadow-lg hover:border-primary/25 transition-all duration-300 overflow-hidden flex flex-col">
                {/* Colored top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/40" />

                <div className="p-4 flex flex-col flex-1 gap-3">
                  {/* Badge */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Hotel Event
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {activity.name}
                  </h3>

                  {/* Divider */}
                  <div className="border-t border-border/60 dark:border-white/5 my-1" />

                  {/* Meta info */}
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/8 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                      </span>
                      <span className="text-muted-foreground font-medium truncate">{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/8 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                      </span>
                      <span className="text-muted-foreground font-medium">{activity.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Layout>
  );
};

export default Activities;
