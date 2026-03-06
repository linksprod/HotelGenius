
import React from 'react';
import Layout from '@/components/Layout';
import { NotificationsList } from './components/NotificationsList';
import { EmptyState } from './components/EmptyState';
import { AuthPrompt } from './components/AuthPrompt';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationsData } from './hooks/useNotificationsData';
import { NotificationItem as NotificationItemType } from './types/notificationTypes';

const Notifications: React.FC = () => {
  const { notifications, isAuthenticated, isLoading, refetchUnified } = useNotificationsData();

  // Transform notifications to match the expected type if needed
  const typedNotifications: NotificationItemType[] = notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    description: notification.description,
    status: notification.status,
    time: notification.time,
    link: notification.link,
    data: notification.data
  }));

  // Show authentication prompt if user is not logged in
  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : typedNotifications.length > 0 ? (
          <NotificationsList notifications={typedNotifications} onRefresh={refetchUnified} />
        ) : (
          <EmptyState />
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
