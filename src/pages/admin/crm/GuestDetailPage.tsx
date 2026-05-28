import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isToday, isBefore, isAfter, startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import GuestPageHeader from '../components/guests/GuestPageHeader';
import GuestProfileCard from '../components/guests/GuestProfileCard';
import GuestPreferencesCard from '../components/guests/GuestPreferencesCard';
import GuestActivityCard from '../components/guests/GuestActivityCard';
import GuestIntelligenceCard from '../components/guests/GuestIntelligenceCard';
import { GuestStatus } from '../components/guests/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};



const GuestDetailPage: React.FC = () => {
  const { guestId } = useParams<{ guestId: string }>();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const today = startOfDay(new Date());



  const getGuestStatus = (checkIn: string | null, checkOut: string | null): GuestStatus => {
    if (!checkIn || !checkOut) return null;
    const checkInDate = startOfDay(new Date(checkIn));
    const checkOutDate = startOfDay(new Date(checkOut));

    if (isToday(checkInDate)) return 'arrivals';
    if (isToday(checkOutDate)) return 'departures';
    if (!isBefore(today, checkInDate) && !isAfter(today, checkOutDate)) return 'in-house';
    if (isAfter(checkInDate, today)) return 'upcoming';
    if (isBefore(checkOutDate, today)) return 'past';
    return null;
  };

  // Fetch guest data
  const { data: guest, isLoading: isGuestLoading } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: async () => {
      if (!guestId) return null;



      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!guestId,
  });

  // Fetch room details
  const { data: room } = useQuery({
    queryKey: ['room', guest?.room_number],
    queryFn: async () => {
      if (!guest?.room_number) return null;

      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_number', guest.room_number)
        .single();
      return data;
    },
    enabled: !!guest?.room_number,
  });

  // Fetch companions
  const { data: companions = [] } = useQuery({
    queryKey: ['companions', guest?.user_id],
    queryFn: async () => {
      if (!guest?.user_id) return [];
      const { data } = await supabase
        .from('companions')
        .select('*')
        .eq('user_id', guest.user_id)
        .order('created_at', { ascending: true });
      return data || [];
    },
    enabled: !!guest?.user_id,
  });

  const status = guest ? getGuestStatus(guest.check_in_date, guest.check_out_date) : null;

  if (isGuestLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 bg-background">
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Guest not found</p>
        <button
          onClick={() => navigate(resolvePath('/admin/guests'))}
          className="text-rose-500 hover:text-rose-600 font-bold transition-colors"
        >
          Back to guests
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground overflow-x-hidden">
      <motion.div
        className="p-8 max-w-[1600px] mx-auto space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <GuestPageHeader
            guest={guest}
            room={room || null}
            companions={companions}
            status={status}
          />
        </motion.div>

        {/* Premium Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Guest Identity & Activity (5 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
            <div className="space-y-8">
              <GuestProfileCard guest={guest} />
              <GuestPreferencesCard guestId={guest.id} />
              <GuestActivityCard />
            </div>
          </motion.div>

          {/* Right Column: AI Insight Engine (7 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-12 lg:pl-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                <Brain className="h-4 w-4 text-rose-500" />
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">Guest Insight Engine</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                AI Driven Intelligence
              </h2>
            </div>

            {/* Intelligence Card */}
            <GuestIntelligenceCard guest={guest} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Help Brain icon 
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
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.48Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.48Z" />
  </svg>
);

export default GuestDetailPage;
