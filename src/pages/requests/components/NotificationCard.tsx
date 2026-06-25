import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  FileText, 
  Ban,
  Sparkles,
  UtensilsCrossed,
  Calendar
} from 'lucide-react';
import { useHotelPath } from '@/hooks/useHotelPath';

interface NotificationCardProps {
  notification: NotificationItem;
  onCancel: (notification: NotificationItem) => void;
  canCancel: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onCancel,
  canCancel
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { resolvePath } = useHotelPath();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spa_booking':
        return <Sparkles className="h-5 w-5" />;
      case 'reservation':
        return <UtensilsCrossed className="h-5 w-5" />;
      case 'event_reservation':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusDefaultText = (status: string) => {
    switch (status) {
      case 'completed': return "Completed";
      case 'in_progress': return "In Progress";
      case 'cancelled': return "Cancelled";
      case 'confirmed': return "Confirmed";
      default: return "Pending";
    }
  };

  const getStatusText = (status: string) => {
    const defaultText = getStatusDefaultText(status);
    return t('notifications.status.' + status, defaultText);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-100 text-green-800";
      case 'in_progress': return "bg-blue-100 text-blue-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      case 'confirmed': return "bg-blue-100 text-blue-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getDetailLink = () => {
    return resolvePath(notification.link || '/requests');
  };

  const getTranslatedTitle = (rawTitle: string) => {
    const key = rawTitle.toLowerCase().replace(/ /g, '_');
    return t('notifications.types.' + key, rawTitle);
  };

  const getTranslatedDescription = (desc: string, type: string, data: any) => {
    if (type === 'spa_booking') {
      return t('notifications.summaries.spa_booking', {
        date: data?.date || '',
        time: data?.time || '',
        defaultValue: desc
      });
    } else if (type === 'reservation') {
      const restaurantName = data?.restaurant_name || data?.restaurantName || t('notifications.type.restaurant', 'restaurant');
      return t('notifications.summaries.restaurant_booking', {
        guests: data?.guests || '',
        date: data?.date || '',
        time: data?.time || '',
        restaurant: restaurantName,
        defaultValue: desc
      });
    } else if (type === 'request') {
      return desc || t('notifications.summaries.service_request', 'Service request');
    } else if (type === 'event_reservation') {
      return t('notifications.summaries.event_booking', {
        guests: data?.guests || '',
        date: data?.date || '',
        defaultValue: desc
      });
    }
    return desc;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              {getTypeIcon(notification.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{getTranslatedTitle(notification.title)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(notification.time), {
                  addSuffix: true,
                  locale: currentLang === 'fr' ? fr : enUS
                })}
              </p>
            </div>
          </div>
          <Badge className={getStatusClass(notification.status)}>
            {getStatusText(notification.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {notification.description && (
          <div className="mb-4">
            <p className="text-foreground/80">
              {getTranslatedDescription(notification.description, notification.type, notification.data)}
            </p>
            {notification.type === 'reservation' && (notification.data?.restaurant_name || notification.data?.restaurantName) && (
              <div className="mt-2 mr-2 text-xs font-semibold text-primary bg-primary/5 rounded px-2.5 py-1.5 inline-block">
                🍽️ {currentLang === 'fr' ? 'Restaurant :' : 'Restaurant:'} {notification.data.restaurant_name || notification.data.restaurantName}
              </div>
            )}
            {notification.type === 'reservation' && notification.data?.restaurant_location && (
              <div className="mt-2 text-xs font-semibold text-primary bg-primary/5 rounded px-2.5 py-1.5 inline-block">
                📍 {currentLang === 'fr' ? 'Emplacement :' : 'Location:'} {notification.data.restaurant_location}
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getStatusIcon(notification.status)}
            <span className="text-sm font-medium">{getStatusText(notification.status)}</span>
          </div>
          
          <div className="flex gap-2">
            {notification.type !== 'reservation' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(getDetailLink())}
              >
                {t('notifications.action.viewDetails', 'View Details')}
              </Button>
            )}
            
            {canCancel && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onCancel(notification)}
              >
                <Ban className="h-4 w-4 mr-1" />
                {t('notifications.action.cancel', 'Cancel')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
