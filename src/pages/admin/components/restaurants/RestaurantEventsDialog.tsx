
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/pages/admin/components/events/EventForm';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types/event';
import { toast } from 'sonner';

interface RestaurantEventsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restaurant: any;
  event?: Event;
}

const RestaurantEventsDialog = ({ isOpen, onOpenChange, restaurant, event }: RestaurantEventsDialogProps) => {
  const { createEvent, updateEvent } = useEvents();

  const handleSubmit = async (data: Partial<Event>) => {
    try {
      if (event) {
        await updateEvent(event.id, { ...data, restaurant_id: restaurant.id });
        toast.success("Événement mis à jour avec succès");
      } else {
        // Ensure all required fields are present
        const eventData = {
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          category: data.category || 'event',
          is_featured: data.is_featured || false,
          date: data.date || new Date().toISOString().split('T')[0],
          restaurant_id: restaurant.id,
          // Optional fields
          location: data.location,
          time: data.time,
          capacity: data.capacity,
          price: data.price
        } as Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        
        await createEvent(eventData);
        toast.success("Événement créé avec succès");
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting event:', error);
      toast.error("Une erreur s'est produite");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {event ? "Modifier l'événement" : "Créer un événement"}
          </DialogTitle>
        </DialogHeader>
        <EventForm
          initialData={event || { restaurant_id: restaurant?.id }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantEventsDialog;
