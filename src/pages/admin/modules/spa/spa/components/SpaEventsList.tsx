
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { format } from 'date-fns';
import { Edit, Trash, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SpaFacility } from '@/features/spa/types';

interface SpaEventsListProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
  isLoading: boolean;
  facilities: SpaFacility[];
  onViewReservations?: (event: Event) => void; // Added this prop
}

const SpaEventsList: React.FC<SpaEventsListProps> = ({
  events,
  onEditEvent,
  onDeleteEvent,
  isLoading,
  facilities,
  onViewReservations // Added this prop
}) => {
  const getFacilityName = (facilityId: string) => {
    const facility = facilities?.find(f => f.id === facilityId);
    return facility ? facility.name : 'Non spécifié';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        Chargement des événements...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun événement trouvé pour ce spa
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Installation</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.title}</TableCell>
            <TableCell>{getFacilityName(event.spa_facility_id!)}</TableCell>
            <TableCell>
              {format(new Date(event.date), 'dd/MM/yyyy')}
              {event.time && ` à ${event.time}`}
            </TableCell>
            <TableCell>
              {event.is_featured ? (
                <Badge variant="secondary">Mis en avant</Badge>
              ) : (
                <Badge variant="outline">Standard</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                {onViewReservations && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewReservations(event)}
                    title="Voir les réservations"
                  >
                    <Users className="h-4 w-4" />
                    <span className="sr-only">Réservations</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditEvent(event)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Modifier</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-600">
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer cet événement ? Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeleteEvent(event)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SpaEventsList;
