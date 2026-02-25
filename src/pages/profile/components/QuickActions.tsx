
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, CalendarDays, Utensils, ShowerHead } from "lucide-react";
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useHotelPath } from '@/hooks/useHotelPath';
import NotificationsList from './NotificationsList';

const QuickActions = () => {
  const { notifications } = useNotifications();
  const { resolvePath } = useHotelPath();
  const recentNotifications = notifications.slice(0, 3); // Get only the first 3 notifications

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link to={resolvePath("/dining")} className="flex flex-col items-center justify-center">
              <Utensils className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Dining</span>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link to={resolvePath("/spa")} className="flex flex-col items-center justify-center">
              <ShowerHead className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Spa</span>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link to={resolvePath("/events")} className="flex flex-col items-center justify-center">
              <CalendarDays className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Events</span>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link to={resolvePath("/notifications")} className="flex flex-col items-center justify-center">
              <BellRing className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Notifications</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List Section - Converting NotificationItem[] to the expected type */}
      <NotificationsList
        notifications={recentNotifications.map(notification => ({
          id: notification.id,
          message: notification.title, // Use title as message
          time: notification.time instanceof Date ? notification.time.toISOString() : String(notification.time)
        }))}
        dismissNotification={() => { }} // We'll pass an empty function as we're just displaying notifications here
      />
    </div>
  );
};

export default QuickActions;
