
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { NotificationDetailHeader } from './components/NotificationDetailHeader';
import NotificationDetailContent from './components/NotificationDetailContent';
import { LoadingState } from './components/LoadingState';
import { NotFoundState } from './components/NotFoundState';
import { useNotificationDetail } from './hooks/useNotificationDetail';
import { useHotelPath } from '@/hooks/useHotelPath';

const NotificationDetail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { notification, isLoading, error } = useNotificationDetail(type, id);
  const { resolvePath } = useHotelPath();

  // Navigation handler
  const handleBack = () => {
    navigate(resolvePath('/notifications'));
  };

  // Show loading state while fetching data
  if (isLoading) {
    return <LoadingState />;
  }

  // Show "not found" state if there's an error or no notification
  if (error || !notification) {
    return (
      <NotFoundState
        onBack={handleBack}
        errorMessage={error instanceof Error ? error.message : String(error)}
      />
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <NotificationDetailHeader
          title={notification.title}
          type={notification.type}
          onBack={handleBack}
        />

        <NotificationDetailContent
          notification={notification}
          notificationType={notification.type}
          notificationId={notification.id}
        />
      </div>
    </Layout>
  );
};

export default NotificationDetail;
