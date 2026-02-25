
import React from 'react';
import { Story, Event } from '@/types/event';
import { StoryContentPresentation } from './StoryContentPresentation';
import { useNavigate } from 'react-router-dom';
import EventBookingDialog from '@/components/events/EventBookingDialog';
import { useToast } from '@/hooks/use-toast';
import { useHotelPath } from '@/hooks/useHotelPath';

interface StoryContentContainerProps {
  story: Story;
  linkedEvent: Event | null;
}

export const StoryContentContainer: React.FC<StoryContentContainerProps> = ({
  story,
  linkedEvent,
}) => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const { toast } = useToast();

  const handleNavigateToEvents = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(resolvePath('/events'));
  };

  const handleBookEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsBookingOpen(false);
    toast({
      title: "Réservation confirmée",
      description: "Votre réservation a été enregistrée avec succès.",
    });
  };

  return (
    <>
      <StoryContentPresentation
        story={story}
        linkedEvent={linkedEvent}
        onNavigateToEvents={handleNavigateToEvents}
        onBookEvent={handleBookEvent}
      />

      {linkedEvent && (
        <EventBookingDialog
          isOpen={isBookingOpen}
          onOpenChange={setIsBookingOpen}
          eventId={linkedEvent.id}
          eventTitle={linkedEvent.title}
          eventDate={linkedEvent.date}
          onSuccess={handleBookingSuccess}
          maxGuests={linkedEvent.capacity || 10}
        />
      )}
    </>
  );
};
