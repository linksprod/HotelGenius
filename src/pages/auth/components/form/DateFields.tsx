
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegistrationFormValues } from '../../hooks/useRegistrationForm';
import { BirthDatePicker } from '@/components/ui/date-picker-birth';

interface DateFieldsProps {
  form: UseFormReturn<RegistrationFormValues>;
  step?: number;
}

const DateFields: React.FC<DateFieldsProps> = ({ form, step }) => {
  const { t } = useTranslation();
  // Get today's date for validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      {(step === undefined || step === 1) && (
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('auth.dateOfBirth', 'Date of Birth')}</FormLabel>
              <FormControl>
                <BirthDatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(step === undefined || step === 2) && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="checkInDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('auth.checkInDate', 'Check-in Date')}</FormLabel>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          field.value.toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        ) : (
                          <span>{t('common.select', 'Select')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);

                        // If checkOutDate is before the new checkInDate, update checkOutDate
                        const checkOutDate = form.getValues('checkOutDate');
                        if (date && checkOutDate && date > checkOutDate) {
                          // Set checkOutDate to the day after checkInDate
                          const nextDay = new Date(date);
                          nextDay.setDate(date.getDate() + 1);
                          form.setValue('checkOutDate', nextDay);
                        }
                      }}
                      disabled={(date) => date < today}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOutDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('auth.checkOutDate', 'Check-out Date')}</FormLabel>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          field.value.toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        ) : (
                          <span>{t('common.select', 'Select')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        // Get checkInDate value
                        const checkInDate = form.getValues('checkInDate');

                        // Disable dates before checkInDate or today (whichever is later)
                        const minDate = checkInDate || today;
                        return date < minDate;
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};

export default DateFields;
