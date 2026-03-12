
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GuestInfoFieldsProps {
  form: UseFormReturn<any>;
  hideNameEmail?: boolean;
  hidePhoneRoom?: boolean;
}

const GuestInfoFields = ({ form, hideNameEmail, hidePhoneRoom }: GuestInfoFieldsProps) => {
  const roomNumber = form.watch('roomNumber');
  const guestName = form.watch('guestName');
  const { t } = useTranslation();

  return (
    <>
      {!roomNumber && !hidePhoneRoom && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('forms.validation.roomNumberAlert')}</AlertTitle>
          <AlertDescription>
            {t('forms.validation.roomNumberAlertDesc')}
          </AlertDescription>
        </Alert>
      )}

      {!hideNameEmail && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="guestName"
            rules={{ required: t('forms.validation.nameRequired') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('forms.labels.name')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('forms.labels.namePlaceholder')}
                    {...field}
                    className={!field.value ? "border-red-500 focus:ring-red-500" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('forms.labels.email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('forms.labels.emailPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {!hidePhoneRoom && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="guestPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('forms.labels.phone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('forms.labels.phonePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roomNumber"
            rules={{ required: t('forms.validation.roomNumberRequired') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('forms.labels.roomNumber')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('forms.labels.roomNumberPlaceholder')}
                    {...field}
                    className={!field.value ? "border-red-500 focus:ring-red-500" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};

export default GuestInfoFields;
