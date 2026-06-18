
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { NotificationItem } from '../types/notificationTypes';
import { Bell, Calendar, CheckCircle, XCircle, Clock, ShowerHead, Utensils, FileText, Edit, Trash2, Check } from 'lucide-react';
import { NotificationService } from '@/services/NotificationService';
import { toast } from 'sonner';

import { useHotelPath } from '@/hooks/useHotelPath';

interface NotificationCardProps {
  notification: NotificationItem;
  onRefresh?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onRefresh }) => {
  const { resolvePath } = useHotelPath();
  // Get icon based on notification type
  function getNotificationIcon(type: string) {
    switch (type) {
      case 'request': return <FileText className="h-5 w-5" />;
      case 'reservation': return <Utensils className="h-5 w-5" />;
      case 'spa_booking': return <ShowerHead className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  }

  // Get color based on notification status
  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  }

  const { t } = useTranslation();

  function getStatusText(status: string) {
    switch (status) {
      case 'pending': return t('notifications.status.pending');
      case 'in_progress': return t('notifications.status.inProgress');
      case 'completed': return t('notifications.status.completed');
      case 'cancelled': return t('notifications.status.cancelled');
      case 'confirmed': return t('notifications.status.confirmed');
      default: return t('notifications.status.pending');
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'confirmed':
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  }

  // Format time safely - handle invalid dates
  function formatTimeAgo(date: Date | null) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return t('notifications.timeAgo.recently');
    }

    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return t('notifications.timeAgo.recently');
    }
  }

  // Get the background color for the card based on status
  function getCardBackgroundColor(status: string) {
    switch (status) {
      case 'confirmed':
      case 'completed': return 'bg-green-50';
      case 'cancelled': return 'bg-red-50';
      case 'in_progress': return 'bg-blue-50';
      default: return 'bg-yellow-50';
    }
  }

  // Get type label based on notification type
  function getTypeLabel(type: string) {
    switch (type) {
      case 'request': return t('notifications.type.request');
      case 'reservation': return t('notifications.type.restaurant');
      case 'spa_booking': return t('notifications.type.spa');
      default: return t('notifications.type.notification');
    }
  }

  function getTranslatedTitle(rawTitle: string) {
    const key = rawTitle.toLowerCase().replace(/ /g, '_');
    return t('notifications.types.' + key, rawTitle);
  }

  // Get action buttons based on status
  function getActionButtons() {
    const canCancel = ['pending', 'confirmed', 'in_progress'].includes(notification.status);
    const canEdit = ['pending'].includes(notification.status);
    const isUnified = !!notification.data?.notification_id;
    const isUnread = isUnified && notification.status !== 'read';

    const handleMarkAsRead = async (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (!notification.data?.notification_id) return;

      const success = await NotificationService.markAsRead(notification.data.notification_id);
      if (success) {
        toast.success(t('notifications.toast.markedAsRead'));
        onRefresh?.();
      } else {
        toast.error(t('notifications.toast.failedToUpdate'));
      }
    };

    if (!canCancel && !canEdit && !isUnread) return null;

    return (
      <div className="mt-3 flex gap-2">
        {isUnread && (
          <button
            onClick={handleMarkAsRead}
            className="p-1.5 rounded bg-green-100 text-green-700 text-xs flex items-center hover:bg-green-200 transition-colors"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            {t('notifications.action.markAsRead')}
          </button>
        )}
        {canEdit && (
          <Link to={`${notification.link}/edit`} className="p-1.5 rounded bg-blue-100 text-blue-600 text-xs flex items-center">
            <Edit className="h-3 w-3 mr-1" />
            {t('notifications.action.edit')}
          </Link>
        )}
        {canCancel && (
          <Link to={notification.link} className="p-1.5 rounded bg-red-100 text-red-600 text-xs flex items-center">
            <Trash2 className="h-3 w-3 mr-1" />
            {t('notifications.action.cancel')}
          </Link>
        )}
      </div>
    );
  }

  function getSummary() {
    // Check if data exists before trying to access its properties
    if (!notification.data) return null;

    if (notification.type === 'spa_booking') {
      return (
        <div className="mt-1.5">
          <p className="text-sm text-gray-800">{t('notifications.summary.title')}:</p>
          <ul className="text-xs text-gray-600 list-disc pl-5 mt-1 space-y-1">
            <li>{t('notifications.summary.date')}: {notification.data?.date}</li>
            <li>{t('notifications.summary.time')}: {notification.data?.time}</li>
            {notification.data?.room_number && <li>{t('notifications.summary.room')}: {notification.data.room_number}</li>}
            {notification.data?.special_requests && <li>{t('notifications.summary.specialRequests')}: {notification.data.special_requests}</li>}
          </ul>
        </div>
      );
    } else if (notification.type === 'reservation') {
      return (
        <div className="mt-1.5">
          <p className="text-sm text-gray-800">{t('notifications.summary.title')}:</p>
          <ul className="text-xs text-gray-600 list-disc pl-5 mt-1 space-y-1">
            <li>{t('notifications.summary.date')}: {notification.data?.date}</li>
            <li>{t('notifications.summary.time')}: {notification.data?.time}</li>
            <li>{t('notifications.summary.people')}: {notification.data?.guests}</li>
            {notification.data?.room_number && <li>{t('notifications.summary.room')}: {notification.data.room_number}</li>}
            {notification.data?.special_requests && <li>{t('notifications.summary.specialRequests')}: {notification.data.special_requests}</li>}
          </ul>
        </div>
      );
    } else if (notification.type === 'request') {
      return (
        <div className="mt-1.5">
          <p className="text-sm text-gray-800">{t('notifications.summary.title')}:</p>
          <ul className="text-xs text-gray-600 list-disc pl-5 mt-1 space-y-1">
            <li>{t('notifications.summary.type')}: {notification.data?.service_type || t('notifications.summary.service')}</li>
            {notification.data?.description && <li>{t('notifications.summary.description')}: {notification.data.description}</li>}
            {notification.data?.room_number && <li>{t('notifications.summary.room')}: {notification.data.room_number}</li>}
          </ul>
        </div>
      );
    }

    return null;
  }

  // Modified to generate correct notification detail URL
  const getNotificationDetailUrl = () => {
    // Use consistent URL format for notification details
    return resolvePath(`/notifications/${notification.type}/${notification.id}`);
  };

  return (
    <Link to={getNotificationDetailUrl()} className="block">
      <Card className={`hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden ${getCardBackgroundColor(notification.status)}`}>
        {/* Unread indicator bar */}
        {notification.data?.notification_id && notification.status !== 'read' && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        )}
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{getTranslatedTitle(notification.title)}</h3>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {getTypeLabel(notification.type)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.description}</p>

                {getSummary()}

                {notification.data?.room_number && !getSummary() && (
                  <div className="mt-1.5 text-xs bg-gray-100 text-gray-700 inline-block px-2 py-0.5 rounded-full">
                    {t('notifications.summary.room')}: {notification.data.room_number}
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(notification.time)}
                </div>

                {getActionButtons()}
              </div>
            </div>

            <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(notification.status)} ml-2 whitespace-nowrap flex items-center gap-1`}>
              {getStatusIcon(notification.status)}
              <span>{getStatusText(notification.status)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
