import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string | number;
  message: string;
  time: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  dismissNotification: (id: string | number) => void;
}

const NotificationsList = ({
  notifications,
  dismissNotification
}: NotificationsListProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleDismiss = (id: string | number) => {
    dismissNotification(id);
    toast({
      title: t('profilePage.notificationsList.toastDismissedTitle'),
      description: t('profilePage.notificationsList.toastDismissedDesc')
    });
  };

  if (notifications.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('profilePage.notificationsList.title')}</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">{t('profilePage.notificationsList.noNotifications')}</h3>
            <p className="text-gray-500 text-sm">
              {t('profilePage.notificationsList.noNotificationsDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default NotificationsList;