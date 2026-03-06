
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { NotificationItem } from '../types/notificationTypes';
import { Bell, Calendar, CheckCircle, XCircle, Clock, ShowerHead, Utensils, FileText, Edit, Trash2, Check } from 'lucide-react';
import { NotificationService } from '@/services/NotificationService';
import { toast } from 'sonner';

interface NotificationCardProps {
  notification: NotificationItem;
  onRefresh?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onRefresh }) => {
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

  function getStatusText(status: string) {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'confirmed': return 'Confirmed';
      default: return 'Pending';
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
      return 'recently';
    }

    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'recently';
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
      case 'request': return 'Request';
      case 'reservation': return 'Restaurant';
      case 'spa_booking': return 'Spa';
      default: return 'Notification';
    }
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
        toast.success('Marked as read');
        onRefresh?.();
      } else {
        toast.error('Failed to update notification');
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
            Mark as read
          </button>
        )}
        {canEdit && (
          <Link to={`${notification.link}/edit`} className="p-1.5 rounded bg-blue-100 text-blue-600 text-xs flex items-center">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Link>
        )}
        {canCancel && (
          <Link to={notification.link} className="p-1.5 rounded bg-red-100 text-red-600 text-xs flex items-center">
            <Trash2 className="h-3 w-3 mr-1" />
            Cancel
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
          <p className="text-sm text-gray-800">Summary:</p>
          <ul className="text-xs text-gray-600 list-disc pl-5 mt-1 space-y-1">
            <li>Date: {notification.data?.date}</li>
            <li>Time: {notification.data?.time}</li>
            {notification.data?.room_number && <li>Room: {notification.data.room_number}</li>}
            {notification.data?.special_requests && <li>Special requests: {notification.data.special_requests}</li>}
          </ul>
        </div>
      );
    } else if (notification.type === 'reservation') {
      return (
        <div className="mt-1.5">
          <p className="text-sm text-gray-800">Summary:</p>
          <ul className="text-xs text-gray-600 list-disc pl-5 mt-1 space-y-1">
            <li>Date: {notification.data?.date}</li>
            <li>Time: {notification.data?.time}</li>
            <li>People: {notification.data?.guests}</li>
            {notification.data?.room_number && <li>Room: {notification.data.room_number}</li>}
            {notification.data?.special_requests && <li>Special requests: {notification.data.special_requests}</li>}
          </ul>
        </div>
      );
    } else if (notification.type === 'request') {
      return (
        <div className="mt-1.5">
          <p className="text-sm text-gray-800">Summary:</p>
          <ul className="text-xs text-gray-600 list-disc pl-5 mt-1 space-y-1">
            <li>Type: {notification.data?.service_type || 'Service'}</li>
            {notification.data?.description && <li>Description: {notification.data.description}</li>}
            {notification.data?.room_number && <li>Room: {notification.data.room_number}</li>}
          </ul>
        </div>
      );
    }

    return null;
  }

  // Modified to generate correct notification detail URL
  const getNotificationDetailUrl = () => {
    // Use consistent URL format for notification details
    return `/notifications/${notification.type}/${notification.id}`;
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
                  <h3 className="font-medium">{notification.title}</h3>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {getTypeLabel(notification.type)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.description}</p>

                {getSummary()}

                {notification.data?.room_number && !getSummary() && (
                  <div className="mt-1.5 text-xs bg-gray-100 text-gray-700 inline-block px-2 py-0.5 rounded-full">
                    Room: {notification.data.room_number}
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
