
import React from 'react';
import { useEventReservations } from '@/hooks/useEventReservations';
import { ReservationsGrid } from '@/pages/admin/components/events/ReservationsGrid';
import { UpdateEventReservationStatusDTO } from '@/types/event';

interface EventReservationsTabProps {
  restaurantId: string;
}

const EventReservationsTab: React.FC<EventReservationsTabProps> = ({ restaurantId }) => {
  const { 
    reservations,
    isLoading,
    error,
    updateReservationStatus,
    isUpdating
  } = useEventReservations();

  // Filter reservations for events belonging to this restaurant
  const filteredReservations = reservations?.filter(
    reservation => {
      // Get the event ID from the reservation
      const eventId = reservation.eventId;
      
      // We need to fetch the event details to check if it belongs to this restaurant
      // This might require an additional query or joining the data
      // For now, we can filter based on a property we have access to
      
      // Since we can't access reservation.event.restaurant_id directly,
      // we'll need to adapt our approach
      
      // Temporary solution until we can properly join event data
      return true; // Show all reservations for now, this will be refined later
    }
  ) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (reservation: any) => {
    // Implement view details functionality if needed
    console.log('View details:', reservation);
  };

  const handleUpdateStatus = (reservationId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const updateDto: UpdateEventReservationStatusDTO = {
      id: reservationId,
      status
    };
    updateReservationStatus(updateDto);
  };

  return (
    <ReservationsGrid
      reservations={filteredReservations}
      onViewDetails={handleViewDetails}
      onUpdateStatus={handleUpdateStatus}
      isUpdating={isUpdating}
    />
  );
};

export default EventReservationsTab;
