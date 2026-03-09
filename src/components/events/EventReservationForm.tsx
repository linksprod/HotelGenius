import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CreateEventReservationDTO, EventReservation } from '@/types/event';
import GuestInfoFields from '@/components/reservation/GuestInfoFields';
import SpecialRequests from '@/components/reservation/SpecialRequests';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useEventReservations } from '@/hooks/useEventReservations';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useTranslation } from 'react-i18next';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

// We'll create the schema dynamically to use translations
const createReservationSchema = (t: any) => z.object({
  guestName: z.string().min(1, {
    message: t('forms.validation.nameRequired')
  }),
  guestEmail: z.string().email({
    message: t('forms.validation.emailInvalid')
  }).optional().or(z.literal('')),
  guestPhone: z.string().optional().or(z.literal('')),
  roomNumber: z.string().min(1, {
    message: t('forms.validation.roomNumberRequired')
  }),
  guests: z.number().min(1, {
    message: t('forms.validation.participantsRequired')
  }),
  specialRequests: z.string().optional().or(z.literal(''))
});

type ReservationFormValues = z.infer<ReturnType<typeof createReservationSchema>>;

export interface EventReservationFormProps {
  eventId: string;
  eventDate: string;
  onSuccess?: () => void;
  buttonText?: string;
  existingReservation?: EventReservation;
  maxGuests?: number;
}

const EventReservationForm: React.FC<EventReservationFormProps> = ({
  eventId,
  eventDate,
  onSuccess,
  buttonText,
  existingReservation,
  maxGuests = 10
}) => {
  const {
    toast
  } = useToast();
  const {
    createReservation,
    isCreating
  } = useEventReservations();
  const {
    userData
  } = useAuth();
  const { hotelId } = useCurrentHotelId();
  const { t } = useTranslation();
  const isEditing = !!existingReservation;

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(createReservationSchema(t)),
    defaultValues: existingReservation ? {
      guestName: existingReservation.guestName || '',
      guestEmail: existingReservation.guestEmail || '',
      guestPhone: existingReservation.guestPhone || '',
      roomNumber: existingReservation.roomNumber || '',
      guests: existingReservation.guests || 1,
      specialRequests: existingReservation.specialRequests || ''
    } : {
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      roomNumber: '',
      guests: 1,
      specialRequests: ''
    }
  });

  useEffect(() => {
    if (userData && !existingReservation) {
      console.log("Populating form with user data:", userData);

      const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      form.setValue('guestName', fullName || '');
      form.setValue('guestEmail', userData.email || '');
      form.setValue('guestPhone', userData.phone || '');
      form.setValue('roomNumber', userData.room_number || '');
      console.log("Form values after update:", {
        name: fullName,
        email: userData.email,
        phone: userData.phone,
        roomNumber: userData.room_number
      });
    } else {
      console.log("No user data available to populate form");

      if (!existingReservation) {
        try {
          const userDataStr = localStorage.getItem('user_data');
          if (userDataStr) {
            const parsedData = JSON.parse(userDataStr);
            console.log("User data from localStorage:", parsedData);
            const fullName = `${parsedData.first_name || ''} ${parsedData.last_name || ''}`.trim();
            form.setValue('guestName', fullName || '');
            form.setValue('guestEmail', parsedData.email || '');
            form.setValue('guestPhone', parsedData.phone || '');
            form.setValue('roomNumber', parsedData.room_number || '');
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }
  }, [userData, form, existingReservation]);

  const onSubmit = async (values: ReservationFormValues) => {
    try {
      const reservationData: CreateEventReservationDTO = {
        eventId,
        guestName: values.guestName,
        guestEmail: values.guestEmail || undefined,
        guestPhone: values.guestPhone || undefined,
        roomNumber: values.roomNumber,
        date: eventDate,
        guests: values.guests,
        specialRequests: values.specialRequests || undefined,
        hotelId: hotelId || undefined
      };
      await createReservation(reservationData);
      toast({
        title: t('forms.messages.reservationSentTitle'),
        description: t('forms.messages.reservationSentDesc')
      });
      if (onSuccess) {
        onSuccess();
      }
      form.reset();
    } catch (error: any) {
      console.error('Error submitting reservation:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('forms.messages.reservationError')
      });
    }
  };

  const guestOptions = Array.from({
    length: maxGuests
  }, (_, i) => i + 1);

  return <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <GuestInfoFields form={form} />

      <div className="form-field">
        <label className="block text-sm font-medium text-foreground mb-1">
          {t('forms.labels.participants')}
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md bg-zinc-100"
          {...form.register("guests", { valueAsNumber: true })}
        >
          {guestOptions.map(num => (
            <option key={num} value={num}>
              {num} {num === 1 ? t('forms.labels.person') : t('forms.labels.people')}
            </option>
          ))}
        </select>
        {form.formState.errors.guests && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.guests.message}
          </p>
        )}
      </div>

      <SpecialRequests form={form} />

      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? t('forms.buttons.processing') : (buttonText || t('forms.buttons.reserve'))}
      </Button>
    </form>
  </Form>;
};

export default EventReservationForm;
