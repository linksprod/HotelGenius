
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useTableReservations } from '@/hooks/useTableReservations';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StatusDialog from '@/components/admin/reservations/StatusDialog';
import ReservationList from '@/components/admin/reservations/ReservationList';
import ErrorState from '@/components/admin/reservations/ErrorState';
import { toast } from 'sonner';
import { TableReservation } from '@/features/dining/types';

const ReservationManager = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { fetchRestaurantById } = useRestaurants();
  const { reservations, isLoading, error, updateReservationStatus } = useTableReservations(id);

  const [restaurant, setRestaurant] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<TableReservation | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== ':id') {
      fetchRestaurantById(id)
        .then(data => setRestaurant(data))
        .catch(err => {
          console.error("Erreur lors du chargement du restaurant:", err);
          setLoadingError("Impossible de charger le restaurant. Veuillez vérifier l'identifiant.");
          toast.error("Erreur lors du chargement du restaurant");
        });
    } else {
      setLoadingError("ID de restaurant invalide. Veuillez sélectionner un restaurant valide.");
    }
  }, [id, fetchRestaurantById]);

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

  if (loadingError) {
    return <ErrorState errorMessage={loadingError} onBackClick={() => navigate(resolvePath('/admin/restaurants'))} />;
  }

  if (isLoading || !restaurant) {
    return <div className="p-8 text-center">Chargement des réservations...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(resolvePath('/admin/restaurants'))}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold">{restaurant.name}</h1>
        <p className="text-muted-foreground">Gestion des Réservations</p>
      </div>

      {error && (
        <ErrorState
          errorMessage={`Impossible de charger les réservations: ${error instanceof Error ? error.message : 'Erreur inconnue'}`}
          onBackClick={() => navigate(resolvePath('/admin/restaurants'))}
        />
      )}

      <ReservationList
        reservations={reservations}
        onOpenStatusDialog={handleOpenStatusDialog}
      />

      <StatusDialog
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        reservation={selectedReservation}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default ReservationManager;
