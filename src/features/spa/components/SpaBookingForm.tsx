import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { SpaService } from '../types';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import GuestInfoFields from '@/components/reservation/GuestInfoFields';
import { useTranslation } from 'react-i18next';

const createSpaBookingSchema = (t: any) => z.object({
  guestName: z.string().min(1, { message: t('forms.validation.nameRequired') }),
  guestEmail: z.string().email({ message: t('forms.validation.emailInvalid') }).optional().or(z.literal('')),
  guestPhone: z.string().optional().or(z.literal('')),
  roomNumber: z.string().min(1, { message: t('forms.validation.roomNumberRequired') }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  specialRequests: z.string().optional().or(z.literal(''))
});

type SpaBookingFormValues = z.infer<ReturnType<typeof createSpaBookingSchema>>;

interface SpaBookingFormProps {
  service: SpaService;
  onSuccess?: () => void;
  existingBooking?: any;
  isChatMode?: boolean;
}

export default function SpaBookingForm({
  service,
  onSuccess,
  existingBooking,
  isChatMode = false
}: SpaBookingFormProps) {
  const { toast } = useToast();
  const { createBooking } = useSpaBookings();
  const { userData } = useAuth();
  const { hotelId } = useCurrentHotelId();
  const { t } = useTranslation();
  const userId = localStorage.getItem('user_id');

  const form = useForm<SpaBookingFormValues>({
    resolver: zodResolver(createSpaBookingSchema(t)),
    defaultValues: {
      guestName: existingBooking?.guest_name || '',
      guestEmail: existingBooking?.guest_email || '',
      guestPhone: existingBooking?.guest_phone || '',
      roomNumber: existingBooking?.room_number || '',
      date: existingBooking?.date ? new Date(existingBooking.date) : undefined,
      time: existingBooking?.time || '',
      specialRequests: existingBooking?.special_requests || ''
    }
  });

  useEffect(() => {
    if (userData && !existingBooking) {
      const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      form.setValue('guestName', fullName);
      form.setValue('guestEmail', userData.email || '');
      form.setValue('guestPhone', userData.phone || '');
      form.setValue('roomNumber', userData.room_number || '');
    }
  }, [userData, existingBooking, form]);

  const onSubmit = async (values: SpaBookingFormValues) => {
    try {
      const bookingData = {
        service_id: service.id,
        facility_id: service.facility_id,
        user_id: userId,
        guest_name: values.guestName,
        guest_email: values.guestEmail,
        guest_phone: values.guestPhone,
        room_number: values.roomNumber,
        date: values.date.toISOString().split('T')[0],
        time: values.time,
        special_requests: values.specialRequests,
        status: 'pending' as const,
        hotel_id: hotelId || undefined,
        service_name: service.name
      };

      await createBooking(bookingData as any);

      if (isChatMode) {
        window.dispatchEvent(new CustomEvent('ai_reservation_submitted', {
          detail: {
            entityName: service.name,
            entityType: 'spa',
            date: values.date.toISOString().split('T')[0],
            time: values.time,
            guests: 1 // Spa bookings are usually for one service session
          }
        }));
      }

      toast({
        title: "Spa booking request sent",
        description: "We've received your request and will confirm shortly."
      });

      if (onSuccess) {
        onSuccess();
      }
      if (!existingBooking) {
        form.reset();
      }
    } catch (error) {
      console.error("Error creating spa booking:", error);
      toast({
        title: "Error",
        description: "Failed to send spa booking request.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <GuestInfoFields
          form={form}
          hideNameEmail={isChatMode && !!userData}
          hidePhoneRoom={isChatMode && !!userData}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Booking Date</FormLabel>
                <DatePicker
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 30)}
                  required
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select a time</option>
                    {[...Array(13)].map((_, i) => {
                      const hour = (i + 9).toString().padStart(2, '0');
                      return (
                        <React.Fragment key={hour}>
                          <option value={`${hour}:00`}>{hour}:00</option>
                          <option value={`${hour}:30`}>{hour}:30</option>
                        </React.Fragment>
                      );
                    })}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Any details for your treatment?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {existingBooking ? 'Update Booking' : 'Submit Booking Request'}
        </Button>
      </form>
    </Form>
  );
}