
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EventFormValues } from './EventFormSchema';

interface DateTimeFieldsProps {
  form: UseFormReturn<EventFormValues>;
}

const convertTo12Hour = (timeStr: string | undefined | null): string => {
  if (!timeStr) return '';
  // If it's already in AM/PM format, return it
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  
  // Parse HH:mm
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1].substring(0, 2);
    if (!isNaN(hours)) {
      const hour12 = hours % 12 === 0 ? 12 : hours % 12;
      const ampm = hours < 12 ? 'AM' : 'PM';
      return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }
  }
  return timeStr;
};

const standardOptions: string[] = [];
for (let i = 0; i < 24; i++) {
  const hour12 = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  const formattedHour = hour12.toString().padStart(2, '0');
  standardOptions.push(`${formattedHour}:00 ${ampm}`);
  standardOptions.push(`${formattedHour}:30 ${ampm}`);
}

export const DateTimeFields: React.FC<DateTimeFieldsProps> = ({ form }) => {
  const recurrenceType = form.watch('recurrence_type');
  const isOneTimeEvent = recurrenceType === 'once';
  
  return (
    <>
      {isOneTimeEvent && (
        <FormField 
          control={form.control} 
          name="date" 
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal flex justify-between items-center",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(new Date(field.value), 'dd MMMM yyyy') : <span>Select a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} 
        />
      )}
      
      <FormField 
        control={form.control} 
        name="time" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Time {isOneTimeEvent ? '(optional)' : ''}</FormLabel>
            <FormControl>
              <select
                className="w-full flex h-10 rounded-xl border border-border dark:border-white/10 bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-purple-500"
                value={convertTo12Hour(field.value)}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select a time</option>
                {field.value && !standardOptions.includes(convertTo12Hour(field.value)) && (
                  <option value={convertTo12Hour(field.value)}>{convertTo12Hour(field.value)}</option>
                )}
                {standardOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      
      {!isOneTimeEvent && (
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          This event will repeat {recurrenceType} and doesn't require a specific date.
        </div>
      )}
    </>
  );
};
