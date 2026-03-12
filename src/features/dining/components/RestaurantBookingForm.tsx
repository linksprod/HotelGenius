import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { createReservation } from '../services/reservationService';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { Restaurant } from '../types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import GuestInfoFields from '@/components/reservation/GuestInfoFields';
import { useTranslation } from 'react-i18next';

const createBookingSchema = (t: any) => z.object({
  guestName: z.string().min(1, { message: t('forms.validation.nameRequired') }),
  guestEmail: z.string().email({ message: t('forms.validation.emailInvalid') }).optional().or(z.literal('')),
  guestPhone: z.string().optional().or(z.literal('')),
  roomNumber: z.string().min(1, { message: t('forms.validation.roomNumberRequired') }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  guests: z.number().min(1, { message: "Min 1 guest" }).max(20, { message: "Max 20 guests" }),
  specialRequests: z.string().optional().or(z.literal(''))
});

type BookingFormValues = z.infer<ReturnType<typeof createBookingSchema>>;

interface RestaurantBookingFormProps {
  restaurant: Restaurant;
  onSuccess?: () => void;
  existingBooking?: any;
  isChatMode?: boolean;
}

export default function RestaurantBookingForm({
  restaurant,
  onSuccess,
  existingBooking,
  isChatMode = false
}: RestaurantBookingFormProps) {
  const { userData } = useAuth();
  const { hotelId } = useCurrentHotelId();
  const { toast } = useToast();
  const { t } = useTranslation();
  const userId = localStorage.getItem('user_id');

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(createBookingSchema(t)),
    defaultValues: {
      guestName: existingBooking?.guestName || '',
      guestEmail: existingBooking?.guestEmail || '',
      guestPhone: existingBooking?.guestPhone || '',
      roomNumber: existingBooking?.roomNumber || '',
      date: existingBooking?.date ? new Date(existingBooking.date) : undefined,
      time: existingBooking?.time || '',
      guests: existingBooking?.guests || 2,
      specialRequests: existingBooking?.specialRequests || ''
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

  const onSubmit = async (values: BookingFormValues) => {
    try {
      const bookingDTO = {
        restaurantId: restaurant.id,
        userId: userId || undefined,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone,
        roomNumber: values.roomNumber,
        date: values.date.toISOString().split('T')[0],
        time: values.time,
        guests: values.guests,
        specialRequests: values.specialRequests,
        status: 'pending' as const,
        hotelId: hotelId || undefined
      };

      await createReservation(bookingDTO);

      toast({
        title: "Reservation request sent",
        description: "Your reservation request has been registered successfully."
      });

      // Dispatch event for AI chat components
      window.dispatchEvent(new CustomEvent('ai_reservation_submitted', {
        detail: {
          entityName: restaurant.name,
          entityType: 'restaurant',
          date: values.date.toISOString().split('T')[0],
          time: values.time,
          guests: values.guests
        }
      }));

      if (onSuccess) {
        onSuccess();
      }
      if (!existingBooking) {
        form.reset();
      }
    } catch (error: any) {
      console.error("Error creating restaurant booking:", error);
      toast({
        title: "Error",
        description: `Failed to send reservation request: ${error.message || 'Unknown error'}`,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Reservation Date</FormLabel>
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
                    className="w-full h-10 p-2 border rounded-md bg-background focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a time</option>
                    {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  min={1}
                  max={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Dietary restrictions or preferences..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Confirming...' : (existingBooking ? 'Update Reservation' : 'Confirm Reservation')}
        </Button>
      </form>
    </Form>
  );
}
