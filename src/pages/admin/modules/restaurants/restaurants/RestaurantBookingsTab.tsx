import React from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useAllTableReservations } from '@/hooks/useAllTableReservations';
import { useRestaurants } from '@/hooks/useRestaurants';
import StatusDialog from '@/components/admin/reservations/StatusDialog';
import { TableReservation } from '@/features/dining/types';
import { RefreshCw, MessageSquare, Mail, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const RestaurantBookingsTab = () => {
  const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedReservation, setSelectedReservation] = React.useState<TableReservation | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<'pending' | 'confirmed' | 'cancelled'>('pending');

  const { restaurants } = useRestaurants();
  const { 
    reservations, 
    isLoading, 
    updateReservationStatus,
    refetch 
  } = useAllTableReservations({
    restaurantId: selectedRestaurantId === 'all' ? undefined : selectedRestaurantId,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  const restaurantMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    restaurants?.forEach(r => { map[r.id] = r.name; });
    return map;
  }, [restaurants]);

  const handleUpdateStatus = () => {
    if (selectedReservation && newStatus) {
      updateReservationStatus({ id: selectedReservation.id, status: newStatus });
      setIsStatusDialogOpen(false);
    }
  };

  const handleOpenStatusDialog = (reservation: TableReservation) => {
    setSelectedReservation(reservation);
    setNewStatus(reservation.status || 'pending');
    setIsStatusDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy', { locale: enUS });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All restaurants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All restaurants</SelectItem>
                {restaurants?.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : reservations.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium cursor-default">
                              {reservation.guestName || 'Guest'}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="space-y-1 text-xs">
                            {reservation.guestEmail && (
                              <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{reservation.guestEmail}</div>
                            )}
                            {reservation.guestPhone && (
                              <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{reservation.guestPhone}</div>
                            )}
                            {!reservation.guestEmail && !reservation.guestPhone && <span>No contact info</span>}
                          </TooltipContent>
                        </Tooltip>
                        {reservation.roomNumber && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Home className="h-3 w-3" />
                            Rm. {reservation.roomNumber}
                          </div>
                        )}
                        {reservation.specialRequests && (
                          <div className="flex items-start gap-1 text-xs text-muted-foreground mt-0.5">
                            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>{reservation.specialRequests}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {restaurantMap[reservation.restaurantId] || '—'}
                    </TableCell>
                    <TableCell>{formatDate(reservation.date)}</TableCell>
                    <TableCell>{reservation.time}</TableCell>
                    <TableCell>{reservation.guests}</TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStatusDialog(reservation)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reservations found</p>
          </div>
        )}
        
        <StatusDialog 
          isOpen={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          reservation={selectedReservation}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </TooltipProvider>
  );
};

export default RestaurantBookingsTab;
