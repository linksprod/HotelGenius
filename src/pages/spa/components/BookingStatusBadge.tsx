
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface BookingStatusBadgeProps {
  status: string;
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t('spa.bookingDetails.status.confirmed', 'Confirmed');
      case 'completed': return t('spa.bookingDetails.status.completed', 'Completed');
      case 'cancelled': return t('spa.bookingDetails.status.cancelled', 'Cancelled');
      case 'in_progress': return t('spa.bookingDetails.status.inProgress', 'In Progress');
      default: return t('spa.bookingDetails.status.pending', 'Pending');
    }
  };
  
  return (
    <Badge className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
};

export default BookingStatusBadge;
