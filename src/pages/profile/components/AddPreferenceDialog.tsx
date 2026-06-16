
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const suggestions: Record<string, string[]> = {
  room: ['High floor', 'Sea view', 'Quiet room', 'Non-smoking', 'King size bed'],
  dining: ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'No seafood'],
  service: ['Early check-in', 'Late check-out', 'Extra towels', 'Hypoallergenic pillows'],
};

interface AddPreferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: string, value: string) => void;
}

const AddPreferenceDialog: React.FC<AddPreferenceDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('room');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd(category, value.trim());
    setValue('');
    setCategory('room');
    onOpenChange(false);
  };

  const getSuggestionKey = (s: string) => {
    return s.toLowerCase().replace(/ /g, '_');
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />}
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('profilePage.preferences.dialogs.addPref')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profilePage.preferences.dialogs.prefType')}</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="room">{t('profilePage.preferences.categories.room')}</SelectItem>
                <SelectItem value="dining">{t('profilePage.preferences.categories.dining')}</SelectItem>
                <SelectItem value="service">{t('profilePage.preferences.categories.service')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profilePage.preferences.dialogs.pref')}</label>
            <Input
              placeholder={t('profilePage.preferences.dialogs.prefPlaceholder')}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t('profilePage.preferences.dialogs.quickSuggestions')}</label>
            <div className="flex flex-wrap gap-2">
              {(suggestions[category] || []).map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setValue(s)}
                >
                  {t(`profilePage.preferences.suggestions.${getSuggestionKey(s)}`, s)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('profilePage.preferences.dialogs.cancel')}</Button>
          <Button onClick={handleAdd} disabled={!value.trim()}>{t('profilePage.preferences.dialogs.add')}</Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default AddPreferenceDialog;
