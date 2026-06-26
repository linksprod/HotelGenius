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
import { Calendar as CalendarIcon } from 'lucide-react';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import GuestInfoFields from '@/components/reservation/GuestInfoFields';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createSpaBookingSchema = (t: any) => z.object({
  guestName: z.string().min(1, { message: t('forms.validation.nameRequired') }),
  guestEmail: z.string().email({ message: t('forms.validation.emailInvalid') }).optional().or(z.literal('')),
  guestPhone: z.string().optional().or(z.literal('')),
  roomNumber: z.string().min(1, { message: t('forms.validation.roomNumberRequired') }),
  date: z.date({ required_error: t('forms.validation.dateRequired', 'Please select a date') }),
  time: z.string().min(1, { message: t('forms.validation.timeRequired', 'Please select a time') }),
  specialRequests: z.string().optional().or(z.literal(''))
});

type SpaBookingFormValues = z.infer<ReturnType<typeof createSpaBookingSchema>>;

interface SpaBookingFormProps {
  service: SpaService;
  onSuccess?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingBooking?: any;
  isChatMode?: boolean;
  language?: 'en' | 'fr';
}

export default function SpaBookingForm({
  service,
  onSuccess,
  existingBooking,
  isChatMode = false,
  language
}: SpaBookingFormProps) {
  const { toast } = useToast();
  const { createBooking } = useSpaBookings();
  const { userData } = useAuth();
  const { hotelId } = useCurrentHotelId();
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(language || i18n.language);
  const userId = localStorage.getItem('user_id');

  const form = useForm<SpaBookingFormValues>({
    resolver: zodResolver(createSpaBookingSchema(t)),
    defaultValues: {
      guestName: existingBooking?.guest_name || '',
      guestEmail: existingBooking?.guest_email || '',
      guestPhone: existingBooking?.guest_phone || '',
      roomNumber: existingBooking?.room_number || userData?.room_number || localStorage.getItem('user_room_number') || '406',
      date: existingBooking?.date ? new Date(existingBooking.date) : undefined,
      time: existingBooking?.time || '',
      specialRequests: existingBooking?.special_requests || ''
    }
  });

  useEffect(() => {
    if (userData && !existingBooking) {
      const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      form.setValue('guestName', fullName || 'Guest');
      form.setValue('guestEmail', userData.email || '');
      form.setValue('guestPhone', userData.phone || '');
      const rNum = userData.room_number || localStorage.getItem('user_room_number') || '406';
      form.setValue('roomNumber', rNum);
    }
  }, [userData, existingBooking, form]);

  const formatDateLocal = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
        date: formatDateLocal(values.date),
        time: values.time,
        special_requests: values.specialRequests,
        status: 'pending' as const,
        hotel_id: hotelId || undefined,
        service_name: service.name
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        title: t('spa.booking_sent_title', 'Spa booking request sent'),
        description: t('spa.booking_sent_desc', "We've received your request and will confirm shortly.")
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
        title: t('common.error', 'Error'),
        description: t('spa.booking_failed', 'Failed to send spa booking request.'),
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("SpaBookingForm validation errors:", errors);
          toast({
            title: t('common.error', 'Validation Error'),
            description: Object.values(errors).map(err => err.message).join(', '),
            variant: "destructive"
          });
        })} 
        className="space-y-3"
      >
        <GuestInfoFields
          form={form}
          hideNameEmail={isChatMode && !!userData}
          hidePhoneRoom={isChatMode && !!userData}
          t={t}
        />

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('spa.booking_date', 'Booking Date')}</FormLabel>
                <FormControl>
                  <div className="relative w-full min-w-0">
                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={field.value ? formatDateLocal(field.value) : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val ? new Date(val + 'T00:00:00') : undefined);
                      }}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {
                          console.error("showPicker not supported", err);
                        }
                      }}
                      min={formatDateLocal(new Date())}
                      max={formatDateLocal(addDays(new Date(), 365 * 5))}
                      className="w-full max-w-full min-w-0 pl-10 pr-3 block h-9 rounded-md border border-input bg-background py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground dark:[color-scheme:dark]"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('spa.time', 'Time')}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{t('spa.select_time', 'Select a time')}</option>
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
              <FormLabel>{t('spa.special_requests_label', 'Special Requests')}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t('spa.special_requests_placeholder', 'Any details for your treatment?')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {existingBooking ? t('spa.update_booking', 'Update Booking') : t('spa.submit_booking', 'Submit Booking Request')}
        </Button>
      </form>
    </Form>
  );
}