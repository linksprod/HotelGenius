
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, RefreshCw, MessageSquare, Mail, Phone, Home } from 'lucide-react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { TableReservation } from '@/features/dining/types';
import StatusDialog from '@/components/admin/reservations/StatusDialog';
import ErrorState from '@/components/admin/reservations/ErrorState';
import { toast } from 'sonner';
import { useTableReservations } from '@/hooks/useTableReservations';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';

const RestaurantReservationsManager = () => {
  const { id } = useParams<{ id: string }>();
  const { markSectionSeen } = useAdminNotifications();

  useEffect(() => {
    markSectionSeen('restaurants');
  }, [markSectionSeen]);
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { fetchRestaurantById } = useRestaurants();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    reservations,
    isLoading: isLoadingReservations,
    updateReservationStatus,
    refetch
  } = useTableReservations(id);

  const [selectedReservation, setSelectedReservation] = useState<TableReservation | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');

  useEffect(() => {
    if (id && id !== ':id') {
      fetchRestaurantById(id)
        .then(data => {
          setRestaurant(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error loading restaurant:", err);
          setError("Unable to load restaurant details. Please check the restaurant ID.");
          setIsLoading(false);
          toast.error("Error loading restaurant");
        });
    } else {
      setError("Invalid restaurant ID. Please select a valid restaurant.");
      setIsLoading(false);
    }
  }, [id, fetchRestaurantById]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Reservations refreshed");
    } catch (error) {
      console.error("Error refreshing reservations:", error);
      toast.error("Failed to refresh reservations");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = () => {
    if (selectedReservation && newStatus) {
      updateReservationStatus({
        id: selectedReservation.id,
        status: newStatus
      });
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
      return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmée</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Annulée</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
    }
  };

  if (error) {
    return <ErrorState errorMessage={error} onBackClick={() => navigate(resolvePath('/admin/restaurants'))} />;
  }

  if (isLoading || !restaurant) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading restaurant reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(resolvePath('/admin/restaurants'))}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl font-semibold ml-4">{restaurant.name} - Reservations</h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoadingReservations || isRefreshing ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : reservations && reservations.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Couverts</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium cursor-default">
                                {reservation.guestName || 'Client'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="space-y-1 text-xs">
                              {reservation.guestEmail && (
                                <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{reservation.guestEmail}</div>
                              )}
                              {reservation.guestPhone && (
                                <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{reservation.guestPhone}</div>
                              )}
                              {!reservation.guestEmail && !reservation.guestPhone && <span>Aucune info de contact</span>}
                            </TooltipContent>
                          </Tooltip>
                          {reservation.roomNumber && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Home className="h-3 w-3" />
                              Ch. {reservation.roomNumber}
                            </div>
                          )}
                        </div>
                        {reservation.specialRequests && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 cursor-default" />
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                              {reservation.specialRequests}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No reservations found for this restaurant</p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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

export default RestaurantReservationsManager;
