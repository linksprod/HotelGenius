
import React, { useState } from 'react';
import { EventReservation } from '@/types/event';
import { ReservationCard } from './ReservationCard';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';

interface ReservationsGridProps {
  reservations: EventReservation[];
  onViewDetails: (reservation: EventReservation) => void;
  onUpdateStatus: (reservationId: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
  isUpdating: boolean;
}

export const ReservationsGrid: React.FC<ReservationsGridProps> = ({
  reservations,
  onViewDetails,
  onUpdateStatus,
  isUpdating
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Filtering reservations
  const filteredReservations = reservations
    .filter(res => statusFilter === "all" ? true : res.status === statusFilter)
    .filter(res => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        res.guestName?.toLowerCase().includes(term) ||
        res.guestEmail?.toLowerCase().includes(term) ||
        res.roomNumber?.toLowerCase().includes(term)
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
          {filteredReservations.length} Active Records
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-60 h-10 pl-9 rounded-xl bg-zinc-800/40 border-white/5 text-xs font-medium focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="bg-zinc-800/40 p-1 rounded-xl border border-white/5">
            <TabsList className="bg-transparent h-8 p-0 gap-1">
              <TabsTrigger value="all" className="h-7 rounded-lg text-[10px] font-bold uppercase tracking-widest px-3 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="pending" className="h-7 rounded-lg text-[10px] font-bold uppercase tracking-widest px-3 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">Pending</TabsTrigger>
              <TabsTrigger value="confirmed" className="h-7 rounded-lg text-[10px] font-bold uppercase tracking-widest px-3 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-500">Confirmed</TabsTrigger>
              <TabsTrigger value="cancelled" className="h-7 rounded-lg text-[10px] font-bold uppercase tracking-widest px-3 data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-500">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-2xl">
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No guest records found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredReservations.map((reservation, idx) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ReservationCard
                reservation={reservation}
                onViewDetails={onViewDetails}
                onUpdateStatus={onUpdateStatus}
                isUpdating={isUpdating}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
