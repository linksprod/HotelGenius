
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegistrationFormValues } from '../../hooks/useRegistrationForm';

interface AdditionalFieldsProps {
  form: UseFormReturn<RegistrationFormValues>;
  step?: number;
}

const AdditionalFields: React.FC<AdditionalFieldsProps> = ({ form, step }) => {
  const { t } = useTranslation();
  return (
    <>
      {(step === undefined || step === 1) && (
        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.nationality', 'Nationality')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.nationalityPlaceholder', 'Nationality')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {(step === undefined || step === 2) && (
        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Room Number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {(step === undefined || step === 3) && (
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default AdditionalFields;
