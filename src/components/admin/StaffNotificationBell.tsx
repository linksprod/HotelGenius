import React, { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStaffNotifications } from '@/hooks/admin/useStaffNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const categoryNameToRoute: Record<string, string> = {
  housekeeping: '/admin/housekeeping',
  maintenance: '/admin/maintenance',
  security: '/admin/security',
  'information technology': '/admin/information-technology',
};

// Fallback keyword matching
const serviceTypeToRoute: Record<string, string> = {
  housekeeping: '/admin/housekeeping',
  maintenance: '/admin/maintenance',
  security: '/admin/security',
  it_support: '/admin/information-technology',
  'information-technology': '/admin/information-technology',
};

export const StaffNotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useStaffNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = async (notif: typeof notifications[0]) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }

    if (notif.reference_type === 'service_request' && notif.reference_id) {
      // Fetch the service request to get its category
      const { data: request } = await supabase
        .from('service_requests')
        .select('category_id')
        .eq('id', notif.reference_id)
        .single();

      let targetRoute: string | undefined;

      if (request?.category_id) {
        // Look up category name
        const { data: category } = await supabase
          .from('request_categories')
          .select('name')
          .eq('id', request.category_id)
          .single();

        if (category?.name) {
          targetRoute = categoryNameToRoute[category.name.toLowerCase()];
        }
      }

      // Fallback: keyword matching in message
      if (!targetRoute) {
        const entry = Object.entries(serviceTypeToRoute).find(([key]) =>
          notif.message.toLowerCase().includes(key)
        );
        if (entry) targetRoute = entry[1];
      }

      if (targetRoute) {
        navigate(`${targetRoute}?tab=requests&requestId=${notif.reference_id}`);
      }
    } else if (notif.reference_type === 'spa_booking' && notif.reference_id) {
      navigate(`/admin/spa?tab=bookings&bookingId=${notif.reference_id}`);
    } else if (notif.reference_type === 'reservation' && notif.reference_id) {
      navigate(`/admin/restaurants?tab=reservations&reservationId=${notif.reference_id}`);
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 shrink-0"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors ${!notif.is_read ? 'bg-accent/20' : ''
                  }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default StaffNotificationBell;
