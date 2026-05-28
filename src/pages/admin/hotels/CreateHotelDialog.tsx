import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import HotelCreationWizard from './HotelCreationWizard';

interface CreateHotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateHotelDialog: React.FC<CreateHotelDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0">
        <HotelCreationWizard
          onSuccess={() => {
            onSuccess();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateHotelDialog;
