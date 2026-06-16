
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt } from "lucide-react";

interface BillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firstName: string;
  lastName: string;
  stayDuration: number | null;
}

const BillDialog = ({ open, onOpenChange, firstName, lastName, stayDuration }: BillDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t('profilePage.billDialog.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">{t('profilePage.billDialog.customerInfo')}</h3>
            <p className="text-sm text-muted-foreground">
              {firstName} {lastName}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t('profilePage.billDialog.stayDetails')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('profilePage.billDialog.duration', {
                nights: t(stayDuration === 1 ? 'profilePage.currentStay.night' : 'profilePage.currentStay.nights', { count: stayDuration })
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillDialog;
