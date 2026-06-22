
import React from 'react';
import { EventReservation } from '@/types/event';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, AtSign, Phone, Home, Calendar, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EventReservationDetailProps {
  reservation: EventReservation;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  onUpdateStatus?: (reservationId: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
  isUpdating?: boolean;
}

export const EventReservationDetail: React.FC<EventReservationDetailProps> = ({ 
  reservation, 
  onOpenChange, 
  open = false,
  onUpdateStatus,
  isUpdating = false
}) => {
  // Function to get status label and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', className: 'bg-green-500' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-500' };
      case 'pending':
        return { label: 'Pending', className: 'bg-yellow-500' };
      default:
        return { label: status, className: 'bg-gray-500' };
    }
  };
  
  const statusInfo = getStatusInfo(reservation.status);

  const handleUpdateStatus = (status: 'pending' | 'confirmed' | 'cancelled') => {
    if (onUpdateStatus) {
      onUpdateStatus(reservation.id, status);
    }
  };

  const reservationContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">
          Reservation by {reservation.guestName}
        </h3>
        <Badge className={statusInfo.className}>
          {statusInfo.label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Contact Information</h4>
            <div className="space-y-3">
              <p className="text-sm flex items-center">
                <User className="h-4 w-4 mr-2 opacity-70" />
                <span className="font-medium">Name:</span> <span className="ml-1">{reservation.guestName || '-'}</span>
              </p>
              <p className="text-sm flex items-center">
                <AtSign className="h-4 w-4 mr-2 opacity-70" />
                <span className="font-medium">Email:</span> <span className="ml-1">{reservation.guestEmail || '-'}</span>
              </p>
              <p className="text-sm flex items-center">
                <Phone className="h-4 w-4 mr-2 opacity-70" />
                <span className="font-medium">Phone:</span> <span className="ml-1">{reservation.guestPhone || '-'}</span>
              </p>
              <p className="text-sm flex items-center">
                <Home className="h-4 w-4 mr-2 opacity-70" />
                <span className="font-medium">Room:</span> <span className="ml-1">{reservation.roomNumber || '-'}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Reservation Details</h4>
            <div className="space-y-3">
              <p className="text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-2 opacity-70" />
                <span className="font-medium">Date:</span> <span className="ml-1">{format(new Date(reservation.date), 'dd MMMM yyyy', { locale: enUS })}</span>
              </p>
              <p className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-2 opacity-70" />
                <span className="font-medium">Participants:</span> <span className="ml-1">{reservation.guests}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Created on:</span> <span className="ml-1">{format(new Date(reservation.createdAt), 'dd/MM/yyyy HH:mm', { locale: enUS })}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {reservation.specialRequests && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Special Requests</h4>
            <p className="text-sm">{reservation.specialRequests}</p>
          </CardContent>
        </Card>
      )}
      
      {onUpdateStatus && (
        <div className="flex justify-end space-x-2 pt-4">
          {reservation.status !== 'confirmed' && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={isUpdating}
              className="bg-green-500 hover:bg-green-600"
            >
              Confirm
            </Button>
          )}
          
          {reservation.status !== 'cancelled' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this reservation? This action is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleUpdateStatus('cancelled')}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Confirm Cancellation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          {reservation.status !== 'pending' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleUpdateStatus('pending')}
              disabled={isUpdating}
            >
              Mark as Pending
            </Button>
          )}
        </div>
      )}
    </div>
  );
  
  if (!onOpenChange || open === undefined) {
    return reservationContent;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservation Details</DialogTitle>
        </DialogHeader>
        {reservationContent}
      </DialogContent>
    </Dialog>
  );
};
