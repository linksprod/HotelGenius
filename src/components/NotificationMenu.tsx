import React, { useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import NotificationList from "./notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { useHotelPath } from "@/hooks/useHotelPath";

const NotificationMenu = () => {
  const {
    notifications,
    unreadCount,
    isAuthenticated,
    hasNewNotifications,
    markAsSeen,
    refetchServices,
    refetchReservations,
    refetchSpaBookings,
    refetchEventReservations,
  } = useNotifications();
  const { resolvePath } = useHotelPath();

  // Reset the badge to 0 when the menu is opened
  // and refresh notifications data to ensure we have the latest data
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        // Mark notifications as seen - this resets the badge to 0
        markAsSeen();

        // Refresh all notifications data when menu opens
        Promise.all([refetchServices(), refetchReservations(), refetchSpaBookings(), refetchEventReservations()]).catch(
          (err) => {
            console.error("Failed to refresh notifications:", err);
          },
        );
      }
    },
    [markAsSeen, refetchServices, refetchReservations, refetchSpaBookings, refetchEventReservations],
  );

  return (
    <DropdownMenu modal={false} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button id="onboarding-notifications" variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Bell className={`h-5 w-5 ${hasNewNotifications ? "text-primary" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center font-medium border border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card/95 backdrop-blur-sm">
        <DropdownMenuLabel>Notifications ({notifications.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <NotificationList notifications={notifications.slice(0, 10)} isAuthenticated={isAuthenticated} />
        </div>

        <DropdownMenuSeparator />
        <Link to={resolvePath("/requests")}>
          <DropdownMenuItem className="text-center cursor-pointer hover:bg-muted">
            <span className="w-full text-center text-primary font-medium">View all Notifications</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
