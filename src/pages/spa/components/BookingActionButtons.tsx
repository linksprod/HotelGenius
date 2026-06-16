
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BookingActionButtonsProps {
  canEdit: boolean;
  canCancel: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

const BookingActionButtons: React.FC<BookingActionButtonsProps> = ({ 
  canEdit, 
  canCancel, 
  onEdit, 
  onCancel 
}) => {
  const { t } = useTranslation();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  if (!canEdit && !canCancel) return null;
  
  return (
    <>
      <div className="flex justify-end gap-4 pt-4">
        {canEdit && (
          <Button variant="outline" onClick={onEdit}>
            {t('spa.bookingDetails.actions.edit', 'Edit')}
          </Button>
        )}
        
        {canCancel && (
          <Button
            variant="destructive"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            {t('spa.bookingDetails.actions.cancel', 'Cancel')}
          </Button>
        )}
      </div>
      
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('spa.bookingDetails.actions.cancelBooking', 'Cancel Booking')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('spa.bookingDetails.actions.cancelConfirmDescription', 'Are you sure you want to cancel this booking? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('spa.bookingDetails.actions.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCancel();
                setIsCancelDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('spa.bookingDetails.actions.confirmCancellation', 'Confirm Cancellation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingActionButtons;
