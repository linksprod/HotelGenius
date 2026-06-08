
import { TableReservation } from '@/features/dining/types';

export const reservationTransformers = {
  // Helper function to transform reservation data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformReservations: (data: any[]): TableReservation[] => {
    return (data || []).map(item => ({
      id: item.id,
      restaurantId: item.restaurant_id,
      userId: item.user_id,
      date: item.date,
      time: item.time,
      guests: item.guests,
      guestName: item.guest_name || '',
      guestEmail: item.guest_email || '',
      guestPhone: item.guest_phone || '',
      specialRequests: item.special_requests || '',
      status: item.status,
      roomNumber: item.room_number || '',
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as TableReservation[];
  },

  // Get the status text in French
  getStatusFrench: (status: string) => {
    switch (status) {
      case 'confirmed': return 'confirmée';
      case 'cancelled': return 'annulée';
      case 'pending': return 'en attente';
      default: return status;
    }
  }
};
