
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSpaServices } from '@/hooks/useSpaServices';
import SpaBookingForm from './SpaBookingForm';
import { SpaService } from '../types';

interface SpaBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  onSuccess: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingBooking?: any;
}

const SpaBookingDialog = ({
  isOpen,
  onOpenChange,
  serviceId,
  onSuccess,
  existingBooking
}: SpaBookingDialogProps) => {
  const { t } = useTranslation();
  const { getServiceById } = useSpaServices();
  const [service, setService] = React.useState<SpaService | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchService = async () => {
      if (serviceId) {
        const serviceData = await getServiceById(serviceId);
        setService(serviceData);
      }
      setLoading(false);
    };

    if (isOpen && serviceId) {
      fetchService();
    }
  }, [isOpen, serviceId, getServiceById]);

  const isEditing = !!existingBooking;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {isEditing 
              ? t('spa.edit_booking_title', 'Edit Your Booking - {{serviceName}}', { serviceName: service?.name }) 
              : t('spa.book_treatment_title', 'Book a Treatment - {{serviceName}}', { serviceName: service?.name })}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? t('spa.edit_booking_desc', 'Modify your booking details below.')
              : t('spa.book_treatment_desc', 'Fill out the form below to book a treatment.')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 pt-2">
            {!loading && service && (
              <SpaBookingForm
                service={service}
                onSuccess={onSuccess}
                existingBooking={existingBooking}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SpaBookingDialog;
