
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import NotificationItem from './NotificationItem';
import { NotificationItem as NotificationItemType } from '@/types/notification';

interface NotificationListProps {
  notifications: NotificationItemType[];
  isAuthenticated: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  isAuthenticated 
}) => {
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        {t('notifications.signInToView')}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        {t('notifications.noNotifications')}
      </div>
    );
  }

  return (
    <DropdownMenuGroup>
      {notifications.map((notification) => (
        <DropdownMenuItem key={`${notification.type}-${notification.id}`} className="p-0 focus:bg-transparent">
          <NotificationItem
            id={notification.id}
            type={notification.type}
            title={notification.title}
            description={notification.description}
            icon={notification.icon}
            status={notification.status}
            time={notification.time}
            link={notification.link || ''}
            data={notification.data}
          />
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
};

export default NotificationList;
