
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface SpecialRequestsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const SpecialRequests = ({ form }: SpecialRequestsProps) => {
  return (
    <FormField
      control={form.control}
      name="specialRequests"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Special Requests</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Special requests (allergies, special occasion, etc.)"
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            We'll do our best to accommodate your requests.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SpecialRequests;
