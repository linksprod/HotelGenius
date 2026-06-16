
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';
import BookingDetailsHeader from './components/BookingDetailsHeader';
import BookingServiceInfo from './components/BookingServiceInfo';
import BookingFacilityInfo from './components/BookingFacilityInfo';
import BookingDateInfo from './components/BookingDateInfo';
import BookingContactInfo from './components/BookingContactInfo';
import BookingActionButtons from './components/BookingActionButtons';
import BookingStatusBadge from './components/BookingStatusBadge';
import BookingNotFound from './components/BookingNotFound';
import BookingLoadingState from './components/BookingLoadingState';
import { useBookingDetails } from './hooks/useBookingDetails';
import BookingDialog from '@/features/spa/components/SpaBookingDialog';

const SpaBookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const {
    booking,
    service,
    facility,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    canCancel,
    canEdit,
    handleEdit,
    handleCancelBooking
  } = useBookingDetails({ id });

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <BookingDetailsHeader />
          <BookingLoadingState />
        </div>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <BookingDetailsHeader />
          <BookingNotFound bookingId={id} errorMessage={error} />
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <BookingDetailsHeader />
          <BookingNotFound 
            bookingId={id} 
            errorMessage={t('spa.bookingDetails.serviceNotFound', 'Service details for this reservation could not be found')} 
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <BookingDetailsHeader />
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('spa.bookingDetails.title', 'Reservation Details')}</CardTitle>
              <BookingStatusBadge status={booking.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <BookingServiceInfo service={service} />
              
              <div className="grid md:grid-cols-2 gap-6">
                <BookingFacilityInfo facility={facility} />
                <BookingDateInfo date={booking.date} time={booking.time} />
              </div>
              
              <Separator />
              
              <BookingContactInfo booking={booking} />
              
              <BookingActionButtons 
                canEdit={canEdit}
                canCancel={canCancel}
                onEdit={handleEdit}
                onCancel={handleCancelBooking}
              />
            </div>
          </CardContent>
        </Card>
        
        {isEditDialogOpen && service && (
          <BookingDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            serviceId={service.id}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              navigate(0);
            }}
            existingBooking={booking}
          />
        )}
      </div>
    </Layout>
  );
};

export default SpaBookingDetails;
