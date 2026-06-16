
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from "react-hook-form";
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegistrationFormValues } from '../../hooks/useRegistrationForm';

interface BasicInfoFieldsProps {
  form: UseFormReturn<RegistrationFormValues>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('auth.firstName', 'First Name')}</FormLabel>
            <FormControl>
              <Input placeholder={t('auth.firstName', 'First Name')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('auth.lastName', 'Last Name')}</FormLabel>
            <FormControl>
              <Input placeholder={t('auth.lastName', 'Last Name')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoFields;
