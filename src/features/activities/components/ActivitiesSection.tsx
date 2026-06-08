
import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import ActivityCard from './ActivityCard';
import { Activity } from '../types';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ActivitiesSection = () => {
  const { toast } = useToast();

  const activities: Activity[] = [
    {
      id: '1',
      name: 'Wine Tasting',
      description: 'Experience the finest wines',
      date: '2024-03-15',
      time: '18:00',
      duration: '2 hours',
      location: 'Wine Cellar',
      price: 75,
      capacity: 12,
      image: '/placeholder.svg',
      category: 'entertainment',
      status: 'upcoming'
    },
    {
      id: '2',
      name: 'Yoga Class',
      description: 'Morning yoga session',
      date: '2024-03-16',
      time: '08:00',
      duration: '1 hour',
      location: 'Wellness Center',
      price: 25,
      capacity: 15,
      image: '/placeholder.svg',
      category: 'fitness',
      status: 'upcoming'
    },
    {
      id: '3',
      name: 'Treasure Hunt Adventure',
      description: 'An exciting treasure hunt around the hotel grounds',
      date: '2024-03-20',
      time: '10:00 AM',
      duration: '1.5 hours',
      location: 'Hotel Garden',
      price: 45,
      capacity: 20,
      image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'entertainment',
      status: 'upcoming'
    }
  ];

  const handleBookActivity = async (activityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to book an activity');

      toast({
        title: "Success",
        description: "Activity booked successfully!",
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-secondary">Activities</h2>
        <Link to="/activities">
          <Button variant="ghost" className="text-primary flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <div className="relative w-full">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 animate-pulse hidden md:block">
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>
        <CarouselContent className="-ml-4">
          {activities.map((activity) => (
            <CarouselItem key={activity.id} className="md:basis-2/5 lg:basis-[30%] pl-4">
              <div className="px-2">
                <ActivityCard
                  activity={activity}
                  onBook={handleBookActivity}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default ActivitiesSection;
