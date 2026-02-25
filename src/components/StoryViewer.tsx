
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story } from '@/types/event';
import { useEvents } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import EventBookingDialog from '@/components/events/EventBookingDialog';
import { useToast } from '@/hooks/use-toast';
import { StoryProgressBars } from './stories/StoryProgressBars';
import { StoryContent } from './stories/StoryContent';
import { useStoryNavigation } from '@/hooks/useStoryNavigation';
import { useHotelPath } from '@/hooks/useHotelPath';

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialStoryIndex,
  onClose
}) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { upcomingEvents } = useEvents();
  const storyDuration = 5000; // 5 seconds per story

  const {
    currentIndex,
    progress,
    handlePrevious,
    handleNext,
    handleKeyDown
  } = useStoryNavigation({
    stories,
    initialStoryIndex,
    storyDuration,
    onClose
  });

  const currentStory = stories[currentIndex];
  const linkedEvent = currentStory?.eventId
    ? upcomingEvents.find(event => event.id === currentStory.eventId)
    : null;

  const navigateToEventPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(resolvePath('/events'));
  };

  const handleBookEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsBookingOpen(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StoryProgressBars
        storiesCount={stories.length}
        currentIndex={currentIndex}
        progress={progress}
      />

      <AnimatePresence mode="wait">
        <StoryContent
          story={currentStory}
          linkedEvent={linkedEvent}
          onNavigateToEvents={navigateToEventPage}
          onBookEvent={handleBookEvent}
        />
      </AnimatePresence>

      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white h-16 w-16 flex items-center justify-start"
        onClick={handlePrevious}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white h-16 w-16 flex items-center justify-end"
        onClick={handleNext}
      >
        <ArrowRight className="w-6 h-6" />
      </button>

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
    </motion.div>
  );
};

export default StoryViewer;
