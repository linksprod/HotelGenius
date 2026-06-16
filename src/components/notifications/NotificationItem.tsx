import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ShowerHead, Calendar, Utensils, FileText, Clock, Bell, CheckCircle, XCircle, Pause } from 'lucide-react';

import { useHotelPath } from '@/hooks/useHotelPath';

interface NotificationItemProps {
  id: string;
  type: 'request' | 'reservation' | 'spa_booking' | 'general' | 'event_reservation';
  title: string;
  description: string;
  icon: string;
  status: string;
  time: Date;
  link: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  description,
  icon,
  status,
  time,
  link,
  data
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { resolvePath } = useHotelPath();

  // Get direct link - all notifications redirect to /requests
  function getDirectLink() {
    return resolvePath('/requests');
  }

  // Get color based on notification status
  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  function getStatusDefaultText(status: string) {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'confirmed': return 'Confirmed';
      case 'on_hold': return 'On hold';
      default: return 'Unknown';
    }
  }

  function getStatusText(status: string) {
    const defaultText = getStatusDefaultText(status);
    return t('notifications.status.' + status, defaultText);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'confirmed':
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'on_hold': return <Pause className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  }

  function renderIcon() {
    if (type === 'spa_booking') {
      return <ShowerHead className="h-4 w-4 text-blue-600" />;
    } else if (type === 'reservation') {
      return <Utensils className="h-4 w-4 text-orange-600" />;
    } else if (type === 'request') {
      return <FileText className="h-4 w-4 text-purple-600" />;
    } else if (type === 'event_reservation') {
      return <Calendar className="h-4 w-4 text-green-600" />;
    } else if (type === 'general') {
      return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
    return <span className="text-lg">{icon}</span>;
  }

  function getSafeTimeAgo(date: Date) {
    try {
      const dateLocale = currentLang === 'fr' ? fr : enUS;
      return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('notifications.timeAgo.recently', 'recently');
    }
  }

  function getSummary() {
    if (type === 'spa_booking') {
      return t('notifications.summaries.spa_booking', {
        date: data?.date || '',
        time: data?.time || '',
        defaultValue: `Booking for ${data?.date || ''} at ${data?.time || ''}`
      });
    } else if (type === 'reservation') {
      return t('notifications.summaries.restaurant_booking', {
        guests: data?.guests || '',
        date: data?.date || '',
        time: data?.time || '',
        defaultValue: `Reservation for ${data?.guests || ''} person(s) on ${data?.date || ''} at ${data?.time || ''}`
      });
    } else if (type === 'request') {
      return description || t('notifications.summaries.service_request', 'Service request');
    } else if (type === 'event_reservation') {
      return t('notifications.summaries.event_booking', {
        guests: data?.guests || '',
        date: data?.date || '',
        defaultValue: `Reservation for ${data?.guests || ''} person(s) on ${data?.date || ''}`
      });
    }
    return description;
  }

  function getActions() {
    const canCancel = ['pending', 'confirmed', 'in_progress'].includes(status);
    const canEdit = ['pending'].includes(status);
    
    if (!canCancel && !canEdit) return null;
    
    return (
      <div className="mt-1 text-xs">
        {canCancel && <span className="text-red-600 mr-2">{t('notifications.action.cancel', 'Cancel')}</span>}
        {canEdit && <span className="text-blue-600">{t('notifications.action.edit', 'Edit')}</span>}
      </div>
    );
  }

  function getTranslatedTitle(rawTitle: string) {
    const key = rawTitle.toLowerCase().replace(/ /g, '_');
    return t('notifications.types.' + key, rawTitle);
  }

  return (
    <Link to={getDirectLink()} key={id}>
      <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted">
        <div className="flex-shrink-0 mt-1">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
            {renderIcon()}
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{getTranslatedTitle(title)}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
          </div>
          <p className="text-xs text-foreground">{getSummary()}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {getSafeTimeAgo(time)}
          </div>
          {getActions()}
        </div>
      </div>
    </Link>
  );
};

export default NotificationItem;
