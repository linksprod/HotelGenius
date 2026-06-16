import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReservationForm from '@/components/ReservationForm';
import { TableReservation } from '@/features/dining/types';

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  restaurantName: string;
  onSuccess: () => void;
  buttonText?: string;
  existingReservation?: TableReservation;
}

const BookingDialog = ({ 
  isOpen, 
  onOpenChange, 
  restaurantId, 
  restaurantName,
  onSuccess,
  buttonText,
  existingReservation
}: BookingDialogProps) => {
  const { t } = useTranslation();
  const isEditing = !!existingReservation;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {isEditing ? t('dining.booking.editTitle', 'Edit your reservation - {{name}}', { name: restaurantName }) : t('dining.booking.bookTitle', 'Book a Table - {{name}}', { name: restaurantName })}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? t('dining.booking.editDesc', "Edit the details of your reservation below.")
              : t('dining.booking.bookDesc', "Fill out the form below to book a table.")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 pt-2">
            {restaurantId && restaurantId !== ':id' && (
              <ReservationForm 
                restaurantId={restaurantId} 
                onSuccess={onSuccess}
                buttonText={buttonText || (isEditing ? t('dining.booking.updateBtn', "Update Reservation") : t('dining.booking.bookBtn', "Book a Table"))}
                existingReservation={existingReservation}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
