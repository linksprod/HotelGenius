import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Users, Hash, MessageSquare, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventReservationDetail } from '@/hooks/useEventReservationDetail';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const EventDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const { reservation, isLoading, error, cancelReservation } = useEventReservationDetail(id || '');

  const handleCancelReservation = async () => {
    if (isCancelling) return;
    
    try {
      setIsCancelling(true);
      console.log("Starting cancellation for reservation ID:", id);
      await cancelReservation();
      console.log("Cancellation completed successfully");
      toast.success(t('events.reservation.cancelSuccess', "Reservation successfully cancelled"));
    } catch (error) {
      console.error("Error during reservation cancellation:", error);
      toast.error(t('events.reservation.cancelError', "An error occurred while cancelling the reservation"));
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (error || !reservation) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-500">{t('events.reservation.errorTitle', 'Error')}</CardTitle>
              <CardDescription>
                {t('events.reservation.errorMessage', "The reservation could not be found or an error occurred.")}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate(-1)}>{t('events.reservation.back', 'Back')}</Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('events.reservation.status.confirmed', 'Confirmed');
      case 'cancelled':
        return t('events.reservation.status.cancelled', 'Cancelled');
      default:
        return t('events.reservation.status.pending', 'Pending');
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            ← {t('events.reservation.back', 'Back')}
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>{t('events.reservation.title', 'Reservation Details')}</CardTitle>
                  <CardDescription>
                    {t('events.reservation.eventLabel', 'Event:')} {reservation.event?.title || t('events.reservation.eventFallback', 'Event')}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Event Details */}
              {reservation.event && (
                <div>
                  <h3 className="text-lg font-medium">{t('events.reservation.eventDetails', 'Event Details')}</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <p className="text-sm">{reservation.event.description}</p>
                    {reservation.event.location && (
                      <p className="text-sm text-muted-foreground">
                        {t('events.reservation.location', 'Location:')} {reservation.event.location}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reservation Info */}
              <div>
                <h3 className="text-lg font-medium">{t('events.reservation.info', 'Reservation Information')}</h3>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">{t('events.reservation.date', 'Date:')} {formatDate(reservation.date)}</span>
                  </div>
                  {reservation.event?.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t('events.reservation.time', 'Time:')} {reservation.event.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">{t('events.reservation.guests', 'Number of guests:')} {reservation.guests}</span>
                  </div>
                  {reservation.roomNumber && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t('events.reservation.room', 'Room:')} {reservation.roomNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-medium">{t('events.reservation.contact', 'Contact Information')}</h3>
                <Separator className="my-2" />
                <div className="space-y-2">
                  <p className="text-sm">{t('events.reservation.name', 'Name:')} {reservation.guestName}</p>
                  {reservation.guestEmail && (
                    <p className="text-sm">{t('events.reservation.email', 'Email:')} {reservation.guestEmail}</p>
                  )}
                  {reservation.guestPhone && (
                    <p className="text-sm">{t('events.reservation.phone', 'Phone:')} {reservation.guestPhone}</p>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {reservation.specialRequests && (
                <div>
                  <h3 className="text-lg font-medium">{t('events.reservation.specialRequests', 'Special Requests')}</h3>
                  <Separator className="my-2" />
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex gap-2">
                      <MessageSquare className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <p className="text-sm">{reservation.specialRequests}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              {reservation.status !== 'cancelled' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto"
                      disabled={isCancelling}
                    >
                      <CalendarX className="mr-2 h-4 w-4" />
                      {isCancelling ? t('events.reservation.cancelling', "Cancelling...") : t('events.reservation.cancelAction', "Cancel reservation")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('events.reservation.cancelConfirmTitle', "Are you sure you want to cancel this reservation?")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('events.reservation.cancelConfirmDesc', "This action cannot be undone. The reservation will be permanently cancelled.")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('events.reservation.cancel', "Cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelReservation}>
                        {t('events.reservation.cancelConfirmYes', "Yes, cancel reservation")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const EventDetailSkeleton = () => {
  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-24 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-px w-full my-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-px w-full my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-px w-full my-2" />
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-4 w-52" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-48" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
