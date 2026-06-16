
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onBook: (activityId: string) => void;
  showBookingButton?: boolean;
}

const ActivityCard = ({ activity, onBook, showBookingButton = true }: ActivityCardProps) => {
  const { t } = useTranslation();
  const statusColors = {
    'upcoming': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-green-100 text-green-800',
    'full': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  return (
    <Card className="w-full overflow-hidden h-full transition-all hover:shadow-md animate-fade-in">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img 
          src={activity.image} 
          alt={activity.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
            {activity.status === 'upcoming' 
              ? t('activities.status.available', 'Available') 
              : t(`activities.status.${activity.status}`, activity.status)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-secondary">{activity.name}</h3>
          <span className="text-primary font-semibold">${activity.price}</span>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {activity.date}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {activity.time} ({activity.duration})
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {activity.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {t('activities.spotsAvailable', '{{count}} spots available', { count: activity.capacity })}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
        {showBookingButton && (
          <Button 
            onClick={() => onBook(activity.id)}
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
            disabled={activity.status === 'full' || activity.status === 'cancelled'}
          >
            {t('activities.bookActivity', 'Book Activity')}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ActivityCard;
