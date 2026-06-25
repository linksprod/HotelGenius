import { useState } from 'react';
import { toast } from 'sonner';
import { NotificationItem } from '@/types/notification';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import { useTableReservations } from '@/hooks/useTableReservations';
import { useEventReservations } from '@/hooks/useEventReservations';

export const useUnifiedCancellation = (
  refetchServices: () => void,
  refetchSpaBookings: () => void,
  refetchReservations: () => void,
  refetchEventReservations: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { cancelRequest } = useServiceRequests();
  const { cancelBooking: cancelSpaBooking } = useSpaBookings();
  const { cancelReservation: cancelTableReservation } = useTableReservations();
  const { cancelReservation: cancelEventReservation } = useEventReservations();

  const canCancelNotification = (notification: NotificationItem): boolean => {
    return ['pending', 'in_progress', 'confirmed'].includes(notification.status);
  };

  const openCancelDialog = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setIsCancelDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleCancel = async () => {
    if (!selectedNotification) return;
    
    setIsUpdating(true);
    try {
      const targetId = selectedNotification.data?.reference_id || selectedNotification.id;
      
      switch (selectedNotification.type) {
        case 'request':
          await cancelRequest(targetId);
          refetchServices();
          break;
        case 'spa_booking':
          await cancelSpaBooking(targetId);
          refetchSpaBookings();
          break;
        case 'reservation':
          cancelTableReservation(targetId);
          refetchReservations();
          break;
        case 'event_reservation':
          cancelEventReservation(targetId);
          refetchEventReservations();
          break;
        default:
          throw new Error('Unknown notification type');
      }
      toast.success("Successfully cancelled");
      closeCancelDialog();
    } catch (error) {
      toast.error("Error cancelling");
      console.error("Error cancelling:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    selectedNotification,
    isCancelDialogOpen,
    canCancelNotification,
    openCancelDialog,
    closeCancelDialog,
    handleCancel
  };
};
