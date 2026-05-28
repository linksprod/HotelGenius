
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EventReservation } from '@/types/event';

interface SpaEventReservationsTabProps {
  reservations: EventReservation[];
  isLoading: boolean;
  onViewReservation: (reservation: EventReservation) => void;
  selectedEvent?: { title: string } | null;
}

const SpaEventReservationsTab: React.FC<SpaEventReservationsTabProps> = ({
  reservations,
  isLoading,
  onViewReservation,
  selectedEvent
}) => {
  if (!selectedEvent) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Veuillez sélectionner un événement pour voir ses réservations
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réservations pour: {selectedEvent.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Chargement des réservations...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-4">Aucune réservation trouvée pour cet événement</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invité</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Chambre</TableHead>
                <TableHead>Nombre d'invités</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.guestName || 'N/A'}</TableCell>
                  <TableCell>{reservation.guestEmail || 'N/A'}</TableCell>
                  <TableCell>{reservation.roomNumber || 'N/A'}</TableCell>
                  <TableCell>{reservation.guests}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        reservation.status === 'confirmed' ? 'default' :
                        reservation.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                    >
                      {reservation.status === 'confirmed' ? 'Confirmé' :
                      reservation.status === 'cancelled' ? 'Annulé' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewReservation(reservation)}
                      >
                        <Users className="h-4 w-4" />
                        <span className="sr-only">Détails</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SpaEventReservationsTab;
