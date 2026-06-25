
import React from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MessageSquare, CheckCircle, XCircle, Clock3, Home, UtensilsCrossed } from 'lucide-react';
import { TableReservation } from '@/features/dining/types';

interface ReservationCardProps {
  reservation: TableReservation;
  onOpenStatusDialog: (reservation: TableReservation) => void;
  restaurantName?: string;
}

const ReservationCard = ({ reservation, onOpenStatusDialog, restaurantName }: ReservationCardProps) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: enUS });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock3 className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>
            {reservation.guestName || 'Guest'}
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadgeClasses(reservation.status)}`}>
            {getStatusIcon(reservation.status)}
            {getStatusText(reservation.status)}
          </div>
        </div>
        {restaurantName && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>{restaurantName}</span>
          </div>
        )}
        <CardDescription>
          Reservation #{reservation.id.substring(0, 8)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(reservation.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{reservation.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{reservation.guests} guests</span>
        </div>
        
        {/* Room number display */}
        {reservation.roomNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>Room: {reservation.roomNumber}</span>
          </div>
        )}
        
        {reservation.specialRequests && (
          <div className="flex items-start gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="flex-1">{reservation.specialRequests}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Contact Information:</p>
          {reservation.guestEmail && (
            <p className="text-sm text-muted-foreground">Email: {reservation.guestEmail}</p>
          )}
          {reservation.guestPhone && (
            <p className="text-sm text-muted-foreground">Phone: {reservation.guestPhone}</p>
          )}
        </div>
        
        <Button
          onClick={() => onOpenStatusDialog(reservation)}
          className="w-full"
          variant="outline"
        >
          Edit Status
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
