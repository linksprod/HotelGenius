import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';
import { createReservation } from '../services/reservationService';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { Restaurant } from '../types';

interface RestaurantBookingFormProps {
  restaurant: Restaurant;
  onSuccess?: () => void;
  existingBooking?: any;
}

interface RestaurantBookingFormValues {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  guests: number;
  specialRequests: string;
}

export default function RestaurantBookingForm({
  restaurant,
  onSuccess,
  existingBooking
}: RestaurantBookingFormProps) {
  const { userData } = useAuth();
  const { hotelId } = useCurrentHotelId();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    existingBooking?.date ? new Date(existingBooking.date) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(existingBooking?.time || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = localStorage.getItem('user_id');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<RestaurantBookingFormValues>();

  useEffect(() => {
    if (userData) {
      setValue('guestName', userData.first_name + ' ' + userData.last_name);
      setValue('guestEmail', userData.email);
      setValue('guestPhone', userData.phone);
      setValue('roomNumber', userData.room_number);
    }
  }, [userData, setValue]);

  // Handle date selection with proper typing
  const handleDateSelect = (date: Date | Date[] | DateRange | undefined) => {
    // Handle only single date selection for this form
    if (date instanceof Date) {
      setSelectedDate(date);
    }
  };

  const onSubmit = async (data: RestaurantBookingFormValues) => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (!data.guests || data.guests < 1) {
      toast.error("Please specify the number of guests");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingDTO = {
        restaurantId: restaurant.id,
        userId: userId || undefined,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        roomNumber: data.roomNumber,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        guests: data.guests,
        specialRequests: data.specialRequests,
        status: 'pending' as const,
        hotelId: hotelId || undefined
      };

      console.log('Creating restaurant booking with service:', bookingDTO);

      const result = await createReservation(bookingDTO);

      toast.success("Restaurant booking request sent successfully!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating restaurant booking:", error);
      toast.error(`Error sending restaurant booking request: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="guestName">Name *</Label>
          <Input
            id="guestName"
            type="text"
            {...register("guestName", { required: "Name is required" })}
            className={cn({
              "focus-visible:ring-red-500": errors.guestName
            })}
          />
          {errors.guestName && (
            <p className="text-red-500 text-sm mt-1">{errors.guestName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="guestEmail">Email</Label>
          <Input
            id="guestEmail"
            type="email"
            {...register("guestEmail", {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            className={cn({
              "focus-visible:ring-red-500": errors.guestEmail
            })}
          />
          {errors.guestEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.guestEmail.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="guestPhone">Phone</Label>
          <Input
            id="guestPhone"
            type="tel"
            {...register("guestPhone")}
          />
        </div>

        <div>
          <Label htmlFor="roomNumber">Room Number *</Label>
          <Input
            id="roomNumber"
            type="text"
            {...register("roomNumber", { required: "Room number is required" })}
            className={cn({
              "focus-visible:ring-red-500": errors.roomNumber
            })}
          />
          {errors.roomNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.roomNumber.message}</p>
          )}
        </div>

        <div>
          <Label>Reservation Date *</Label>
          <DatePicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            minDate={new Date()}
            maxDate={addDays(new Date(), 30)}
            required
          />
          {!selectedDate && (
            <p className="text-red-500 text-sm mt-1">Please select a date</p>
          )}
        </div>

        <div>
          <Label htmlFor="time">Time *</Label>
          <select
            id="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            className="w-full p-2 border rounded bg-background"
          >
            <option value="">Select a time</option>
            {/* Restaurant hours typically 17:00 - 23:00 */}
            {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {!selectedTime && (
            <p className="text-red-500 text-sm mt-1">Please select a time</p>
          )}
        </div>

        <div>
          <Label htmlFor="guests">Number of Guests *</Label>
          <Input
            id="guests"
            type="number"
            min="1"
            max="20"
            {...register("guests", {
              required: "Number of guests is required",
              min: { value: 1, message: "At least 1 guest required" },
              max: { value: 20, message: "Maximum 20 guests allowed" },
              valueAsNumber: true
            })}
            className={cn({
              "focus-visible:ring-red-500": errors.guests
            })}
          />
          {errors.guests && (
            <p className="text-red-500 text-sm mt-1">{errors.guests.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="specialRequests">Special Requests</Label>
          <Textarea
            id="specialRequests"
            {...register("specialRequests")}
            className="w-full border rounded"
            placeholder="Any dietary restrictions, special occasions, or other requests..."
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reservation Request'}
        </Button>
      </form>
    </div>
  );
}