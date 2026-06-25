
import React from 'react';
import { TableReservation } from '@/features/dining/types';
import ReservationCard from './ReservationCard';

interface ReservationListProps {
  reservations: TableReservation[] | undefined;
  onOpenStatusDialog: (reservation: TableReservation) => void;
  restaurantMap?: Record<string, string>;
}

const ReservationList = ({ reservations, onOpenStatusDialog, restaurantMap }: ReservationListProps) => {
  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No reservations for this restaurant</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reservations.map((reservation) => (
        <ReservationCard 
          key={reservation.id} 
          reservation={reservation} 
          onOpenStatusDialog={onOpenStatusDialog}
          restaurantName={restaurantMap?.[reservation.restaurantId] }
        />
      ))}
    </div>
  );
};

export default ReservationList;
