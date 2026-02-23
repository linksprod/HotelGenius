
import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import StoryViewer from './StoryViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStories } from '@/hooks/useStories';
import { Story } from '@/types/event';
import { Calendar } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useEvents } from '@/hooks/useEvents';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHotelPath } from '@/hooks/useHotelPath';

const EventsStories: React.FC = () => {
  const {
    stories,
    loading,
    markAsSeen
  } = useStories();
  const {
    upcomingEvents
  } = useEvents();
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const isMobile = useIsMobile();
  const { resolvePath } = useHotelPath();

  // Memorize active stories to avoid unnecessary calculations
  const activeStories = useMemo(() => (stories || []).filter(story => story.is_active).slice(0, 10),
    // Limit to 10 stories max
    [stories]);

  // Memorize event titles to avoid repeated lookups
  const eventTitles = useMemo(() => {
    const titleMap: Record<string, string> = {};
    activeStories.forEach(story => {
      if (story.eventId) {
        const event = upcomingEvents.find(e => e.id === story.eventId);
        if (event) {
          titleMap[story.eventId] = event.title;
        }
      }
    });
    return titleMap;
  }, [activeStories, upcomingEvents]);

  const handleMarkAsSeen = useCallback(async (id: string, index: number) => {
    if (!viewedStories.includes(id)) {
      setViewedStories(prev => [...prev, id]);
      await markAsSeen(id);
    }
    setSelectedStoryIndex(index);
    setStoryViewerOpen(true);
  }, [viewedStories, markAsSeen]);

  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const getEventTitle = useCallback((story: Story) => {
    if (!story.eventId) return null;
    return eventTitles[story.eventId] || null;
  }, [eventTitles]);

  if (loading) {
    return <div className="mb-8 mt-4 md:mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-secondary">Events & Promos</h2>
        <Link to={resolvePath("/events")} className="text-primary text-sm font-medium">See all</Link>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {Array.from({
            length: 5
          }).map((_, index) => <div key={index} className="flex flex-col items-center space-y-1">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>)}
        </div>
      </div>
    </div>;
  }

  if (activeStories.length === 0) {
    return null;
  }

  return <div className="mb-8 mt-4 md:mt-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-secondary">Events & Promos</h2>
      <Link to={resolvePath("/events")} className="text-primary text-sm font-medium">See all</Link>
    </div>

    {isMobile ? <div className="relative">
      <Carousel opts={{
        align: "start",
        loop: false
      }} setApi={setCarouselApi} className="w-full">
        <CarouselContent className="py-2">
          {activeStories.map((story, index) => <CarouselItem key={story.id} className="basis-auto pl-4 pr-2">
            <button className="flex flex-col items-center space-y-1 bg-transparent border-none" onClick={() => handleMarkAsSeen(story.id, index)}>
              <div className={cn("p-1 rounded-full", viewedStories.includes(story.id) || story.seen ? "bg-muted-foreground/30" : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500")}>
                <div className="p-0.5 bg-background rounded-full">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={story.image} alt={story.title} className="object-cover" loading="lazy" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {story.title.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-center w-16 truncate">{story.title}</span>

              {story.eventId && <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0 flex items-center gap-0.5">
                <Calendar className="w-2 h-2" />
                <span className="truncate max-w-12">{getEventTitle(story)}</span>
              </Badge>}
            </button>
          </CarouselItem>)}
        </CarouselContent>
      </Carousel>
    </div> : <div className="overflow-x-auto pb-4">
      <div className="flex space-x-4 pb-2">
        {activeStories.map((story, index) => <button key={story.id} className="flex flex-col items-center space-y-1 bg-transparent border-none" onClick={() => handleMarkAsSeen(story.id, index)}>
          <div className={cn("p-1 rounded-full", viewedStories.includes(story.id) || story.seen ? "bg-muted-foreground/30" : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500")}>
            <div className="p-0.5 bg-background rounded-full">
              <Avatar className="h-16 w-16">
                <AvatarImage src={story.image} alt={story.title} className="object-cover" loading="lazy" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {story.title.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <span className="text-xs text-center w-16 truncate">{story.title}</span>

          {story.eventId && <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0 flex items-center gap-0.5">
            <Calendar className="w-2 h-2" />
            <span className="truncate max-w-12">{getEventTitle(story)}</span>
          </Badge>}
        </button>)}
      </div>
    </div>}

    {storyViewerOpen && <StoryViewer stories={activeStories} initialStoryIndex={selectedStoryIndex} onClose={() => setStoryViewerOpen(false)} />}
  </div>;
};

export default EventsStories;
