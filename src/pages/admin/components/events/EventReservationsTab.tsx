
import React, { useState, useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useEventReservations } from '@/hooks/useEventReservations';
import { EventTable } from './EventTable';
import { EventReservationDetail } from './EventReservationDetail';
import { UpdateEventReservationStatusDTO, EventReservation } from '@/types/event';
import { useStories } from '@/hooks/useStories';
import { ReservationsGrid } from './ReservationsGrid';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle, Calendar } from 'lucide-react';

export const EventReservationsTab: React.FC<{
  selectedEventId?: string;
  setSelectedEventId: (eventId: string | undefined) => void;
}> = ({ selectedEventId, setSelectedEventId }) => {
  const { events, loading: eventsLoading } = useEvents();
  const { stories } = useStories();
  const [selectedReservation, setSelectedReservation] = useState<EventReservation | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { 
    reservations, 
    isLoading: reservationsLoading, 
    updateReservationStatus,
    isUpdating,
    error: reservationsError
  } = useEventReservations(selectedEventId);

  // If no events, provide demo events for the selector
  const displayEvents = events.length === 0 ? [
    { id: 'demo-1', title: 'Rooftop Jazz Night', category: 'event', location: 'Sky Bar', date: new Date().toISOString(), time: '08:00 PM', image: 'https://images.unsplash.com/photo-1514525253361-bee8a187449a?w=400&auto=format&fit=crop&q=60', is_featured: true },
    { id: 'demo-2', title: 'Sunset Yoga Session', category: 'event', location: 'Zen Garden', date: new Date().toISOString(), time: '06:30 PM', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68733?w=400&auto=format&fit=crop&q=60', is_featured: false },
  ] : events;
  
  // Reset selected reservation when event changes
  useEffect(() => {
    setSelectedReservation(undefined);
  }, [selectedEventId]);
  
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedReservation(undefined);
  };
  
  const handleViewReservation = (reservation: EventReservation) => {
    setSelectedReservation(reservation);
    setIsDetailOpen(true);
  };
  
  const handleUpdateStatus = (reservationId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const update: UpdateEventReservationStatusDTO = {
        id: reservationId,
        status
      };
      
      updateReservationStatus(update);
      
      setTimeout(() => {
        const statusLabel = status === 'confirmed' ? 'confirmed' : status === 'cancelled' ? 'cancelled' : 'pending';
        toast.success(`Reservation ${statusLabel} successfully`);
      }, 300);
      
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error("Error updating reservation status");
    }
  };
  
  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tighter uppercase mb-1">Reservation Management</h2>
          <p className="text-muted-foreground text-xs font-medium">Select an experience to manage guest attendance and booking status.</p>
        </div>
        <EventTable 
          events={displayEvents} 
          selectedEventId={selectedEventId} 
          onSelectEvent={handleSelectEvent} 
          stories={stories}
        />
      </div>
      
      {selectedEventId && (
        <Card className="p-8 border-border dark:border-white/5 bg-card dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tighter text-foreground uppercase">Guest Attendance</h2>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              Live Feed
            </div>
          </div>
          
          {reservationsLoading ? (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium text-sm">Syncing latest bookings...</p>
            </div>
          ) : reservationsError ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 flex items-center text-rose-500 gap-4">
              <AlertCircle className="h-6 w-6" />
              <div>
                <p className="font-bold text-sm">Synchronization Error</p>
                <p className="text-xs font-medium opacity-80 text-rose-500/80">Could not retrieve reservations for this event.</p>
              </div>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border dark:border-white/5 rounded-2xl">
              <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No active reservations</p>
              <p className="text-muted-foreground/60 font-medium text-[10px] mt-1 italic">Guest bookings will appear here once confirmed.</p>
            </div>
          ) : (
            <ReservationsGrid 
              reservations={reservations} 
              onViewDetails={handleViewReservation}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={isUpdating}
            />
          )}
        </Card>
      )}
      
      {/* Reservation Detail Dialog */}
      {selectedReservation && (
        <EventReservationDetail
          reservation={selectedReservation}
          onOpenChange={setIsDetailOpen}
          open={isDetailOpen}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
