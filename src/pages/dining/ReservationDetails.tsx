import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTableReservations } from '@/hooks/useTableReservations';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, CalendarClock, Users, Utensils, FileText, Edit, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { TableReservation } from '@/features/dining/types';
import { ServiceRequest } from '@/features/rooms/types';
import BookingDialog from './components/BookingDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useHotelPath } from '@/hooks/useHotelPath';

const ReservationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { reservations = [], updateReservationStatus, isUpdating } = useTableReservations();
  const { fetchRestaurantById } = useRestaurants();

  const [reservation, setReservation] = useState<TableReservation | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      toast.error("Identifiant de réservation manquant");
      navigate('/notifications');
      return;
    }

    // Trouver la réservation
    const foundReservation = reservations && Array.isArray(reservations)
      ? reservations.find(r => r.id === id)
      : null;

    if (foundReservation) {
      setReservation(foundReservation);

      // Charger les détails du restaurant
      fetchRestaurantById(foundReservation.restaurantId)
        .then(data => {
          setRestaurant(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Erreur lors du chargement du restaurant:", err);
          toast.error("Impossible de charger les détails du restaurant");
          setIsLoading(false);
        });
    } else {
      if (reservations.length > 0) {
        // If we have reservations but can't find this one
        toast.error("Réservation non trouvée");
        navigate('/notifications');
      } else {
        // Wait for reservations to load
        setIsLoading(true);
      }
    }
  }, [id, reservations, fetchRestaurantById, navigate]);

  const handleCancelReservation = () => {
    if (!reservation) return;

    updateReservationStatus({
      id: reservation.id,
      status: 'cancelled'
    });

    toast.success("Votre réservation a été annulée");
    setIsCancelDialogOpen(false);

    // Mettre à jour l'état local
    if (reservation) {
      setReservation({
        ...reservation,
        status: 'cancelled'
      });
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    toast.success("Votre réservation a été modifiée");

    // Recharger les données
    const updatedReservation = reservations.find(r => r.id === id);
    if (updatedReservation) {
      setReservation(updatedReservation);
    }
  };

  const getStatusIcon = () => {
    if (!reservation) return null;

    switch (reservation.status) {
      case 'confirmed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (!reservation) return "";

    switch (reservation.status) {
      case 'confirmed': return "Confirmée";
      case 'cancelled': return "Annulée";
      default: return "En attente";
    }
  };

  const getStatusClass = () => {
    if (!reservation) return "";

    switch (reservation.status) {
      case 'confirmed': return "bg-green-100 text-green-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!reservation || !restaurant) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Impossible de trouver les détails de cette réservation.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate(resolvePath('/notifications'))}>
                Back to notifications
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  const reservationDate = new Date(reservation.date);
  const formattedDate = format(reservationDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isPending = reservation.status === 'pending';
  const isConfirmed = reservation.status === 'confirmed';
  const isCancelled = reservation.status === 'cancelled';

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Détails de votre réservation</h1>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>{restaurant.name}</CardTitle>
              <Badge className={getStatusClass()}>{getStatusText()}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarClock className="h-5 w-5 text-gray-500" />
              <span className="capitalize">{formattedDate} à {reservation.time}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 text-gray-500" />
              <span>{reservation.guests} {reservation.guests > 1 ? 'personnes' : 'personne'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Utensils className="h-5 w-5 text-gray-500" />
              <span>Restaurant: {restaurant.cuisine}</span>
            </div>

            {reservation.specialRequests && (
              <div className="flex items-start gap-2 text-gray-700">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Demandes spéciales:</p>
                  <p className="text-gray-600">{reservation.specialRequests}</p>
                </div>
              </div>
            )}

            <div className="pt-4">
              {isPending && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Réservation en attente</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Votre réservation est en cours de traitement. Vous recevrez une confirmation prochainement.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isConfirmed && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Réservation confirmée</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Votre table est réservée. Nous vous attendons le {format(reservationDate, 'd MMMM', { locale: fr })} à {reservation.time}.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Réservation annulée</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Cette réservation a été annulée.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-2 flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => navigate(resolvePath('/dining'))}>
              Voir le restaurant
            </Button>
            <Button variant="outline" onClick={() => navigate(resolvePath('/requests'))}>
              View All Requests
            </Button>

            {isPending && (
              <>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>

                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  <Ban className="h-4 w-4" />
                  Annuler
                </Button>
              </>
            )}

            {isConfirmed && (
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                <Ban className="h-4 w-4" />
                Annuler
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Dialog de modification */}
      <BookingDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        onSuccess={handleEditSuccess}
        buttonText="Modifier ma réservation"
        existingReservation={reservation}
      />

      {/* Dialog de confirmation d'annulation */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Annuler votre réservation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler votre réservation au restaurant {restaurant.name} pour le {format(reservationDate, 'd MMMM', { locale: fr })} à {reservation.time} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Non, garder ma réservation
            </Button>
            <Button variant="destructive" onClick={handleCancelReservation} disabled={isUpdating}>
              {isUpdating ? 'Annulation...' : 'Oui, annuler'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ReservationDetails;
