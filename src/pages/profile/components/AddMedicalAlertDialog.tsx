
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddMedicalAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (alert: { alert_type: string; severity: string; description: string }) => void;
}

const AddMedicalAlertDialog: React.FC<AddMedicalAlertDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const { t } = useTranslation();
  const [alertType, setAlertType] = useState('Allergy');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!description.trim()) return;
    onAdd({ alert_type: alertType, severity, description: description.trim() });
    setDescription('');
    setAlertType('Allergy');
    setSeverity('Medium');
    onOpenChange(false);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />}
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('profilePage.preferences.dialogs.addMedical')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profilePage.preferences.dialogs.alertType')}</label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Medical alert">{t('profilePage.preferences.dialogs.types.medicalAlert')}</SelectItem>
                <SelectItem value="Allergy">{t('profilePage.preferences.dialogs.types.allergy')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profilePage.preferences.dialogs.severityLevel')}</label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">{t('profilePage.preferences.dialogs.severity.low')}</SelectItem>
                <SelectItem value="Medium">{t('profilePage.preferences.dialogs.severity.medium')}</SelectItem>
                <SelectItem value="High">{t('profilePage.preferences.dialogs.severity.high')}</SelectItem>
                <SelectItem value="Critical">{t('profilePage.preferences.dialogs.severity.critical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profilePage.preferences.dialogs.description')}</label>
            <Textarea
              placeholder={t('profilePage.preferences.dialogs.medicalDescPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('profilePage.preferences.dialogs.cancel')}</Button>
          <Button onClick={handleAdd} disabled={!description.trim()}>{t('profilePage.preferences.dialogs.add')}</Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default AddMedicalAlertDialog;
