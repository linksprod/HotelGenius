
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useTranslatedServices } from '@/i18n/translationHelpers';

interface ConfirmRequestDialogProps {
  open: boolean;
  isSubmitting: boolean;
  item: {
    id: string;
    name: string;
    category: string;
    description?: string;
  } | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmRequestDialog = ({
  open,
  isSubmitting,
  item,
  onCancel,
  onConfirm,
}: ConfirmRequestDialogProps) => {
  const { t } = useTranslation();
  const { translateItemName, translateItemDescription } = useTranslatedServices();
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('myRoom.request.confirmTitle', 'Confirm Service Request')}</DialogTitle>
          <DialogDescription className="text-gray-500">
            {t('myRoom.request.confirmDesc', 'Are you sure you want to request the following service?')}
          </DialogDescription>
        </DialogHeader>
        <div className="bg-primary/5 rounded-xl p-4 my-4">
          <div className="font-medium text-lg">{translateItemName(item.name)}</div>
          {item.description && (
            <div className="text-gray-600 mt-1">{translateItemDescription(item.name, item.description)}</div>
          )}
        </div>
        <DialogFooter className="sm:justify-between gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('myRoom.request.submitting', 'Submitting...')}</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>{t('myRoom.request.confirmButton', 'Confirm Request')}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmRequestDialog;
