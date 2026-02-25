
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { NotificationItem } from '@/types/notification';
import { RequestDetail } from './details/request/RequestDetail';
import { SpaBookingDetail } from './details/spa/SpaBookingDetail';
import { EventReservationDetail } from './details/event/EventReservationDetail';
import { Button } from '@/components/ui/button';

interface NotificationDetailContentProps {
  notification: NotificationItem;
  notificationType: string;
  notificationId: string;
}

const NotificationDetailContent: React.FC<NotificationDetailContentProps> = ({
  notification,
  notificationType,
  notificationId
}) => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();

  // Redirect to the appropriate dedicated page for each notification type
  React.useEffect(() => {
    switch (notificationType) {
      case 'request':
        navigate(resolvePath(`/requests/${notificationId}`));
        break;
      case 'reservation':
        navigate(resolvePath(`/dining/reservations/${notificationId}`));
        break;
      case 'spa_booking':
        navigate(resolvePath(`/spa/booking/${notificationId}`));
        break;
      case 'event_reservation':
        navigate(resolvePath(`/events/${notificationId}`));
        break;
      default:
        // No redirect for unknown types
        break;
    }
  }, [notificationType, notificationId, navigate]);

  // This will rarely be rendered due to the redirects above,
  // but serves as a fallback
  return (
    <div className="space-y-6">
      {/* Header based on notification type */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{notification.title}</h2>
        <Button variant="outline" onClick={() => navigate(resolvePath('/notifications'))}>
          Back to notifications
        </Button>
      </div>

      {/* Content based on notification type */}
      {notificationType === 'request' && <RequestDetail notification={notification} />}
      {notificationType === 'spa_booking' && <SpaBookingDetail notification={notification} />}
      {notificationType === 'event_reservation' && <EventReservationDetail notification={notification} />}

      {/* Fallback for types without dedicated components */}
      {notificationType !== 'request' &&
        notificationType !== 'spa_booking' &&
        notificationType !== 'event_reservation' && (
          <div className="text-center py-8">
            <p>Redirecting to details page...</p>
          </div>
        )}
    </div>
  );
};

export default NotificationDetailContent;
