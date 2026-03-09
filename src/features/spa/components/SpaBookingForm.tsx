import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { SpaService } from '../types';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
interface SpaBookingFormProps {
  service: SpaService;
  onSuccess?: () => void;
  existingBooking?: any;
}
interface SpaBookingFormValues {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  specialRequests: string;
}
export default function SpaBookingForm({
  service,
  onSuccess,
  existingBooking
}: SpaBookingFormProps) {
  const {
    createBooking
  } = useSpaBookings();
  const {
    userData
  } = useAuth();
  const { hotelId } = useCurrentHotelId();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(existingBooking?.date ? new Date(existingBooking.date) : undefined);
  const [selectedTime, setSelectedTime] = useState<string>(existingBooking?.time || '');
  const userId = localStorage.getItem('user_id');
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    setValue
  } = useForm<SpaBookingFormValues>();
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
  const onSubmit = async (data: SpaBookingFormValues) => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }
    try {
      const bookingData = {
        service_id: service.id,
        facility_id: service.facility_id,
        user_id: userId,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone,
        room_number: data.roomNumber,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        special_requests: data.specialRequests,
        status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed',
        hotel_id: hotelId || undefined,
        // Add service_name for notification purposes even if not in DB schema
        service_name: service.name
      };
      await createBooking(bookingData as any);
      toast.success("Spa booking request sent successfully");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating spa booking:", error);
      toast.error("Error sending spa booking request");
    }
  };
  return <div>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="guestName">Name</Label>
        <Input id="guestName" type="text" {...register("guestName", {
          required: true
        })} className={cn({
          "focus-visible:ring-red-500": errors.guestName
        })} />
        {errors.guestName && <p className="text-red-500 text-sm mt-1">Required field</p>}
      </div>
      <div>
        <Label htmlFor="guestEmail">Email</Label>
        <Input id="guestEmail" type="email" {...register("guestEmail")} className={cn({
          "focus-visible:ring-red-500": errors.guestEmail
        })} />
        {errors.guestEmail && <p className="text-red-500 text-sm mt-1">Invalid email</p>}
      </div>
      <div>
        <Label htmlFor="guestPhone">Phone</Label>
        <Input id="guestPhone" type="tel" {...register("guestPhone")} className={cn({
          "focus-visible:ring-red-500": errors.guestPhone
        })} />
        {errors.guestPhone && <p className="text-red-500 text-sm mt-1">Invalid phone number</p>}
      </div>
      <div>
        <Label htmlFor="roomNumber">Room Number</Label>
        <Input id="roomNumber" type="text" {...register("roomNumber", {
          required: true
        })} className={cn({
          "focus-visible:ring-red-500": errors.roomNumber
        })} />
        {errors.roomNumber && <p className="text-red-500 text-sm mt-1">Required field</p>}
      </div>
      <div>
        <Label>Booking Date</Label>
        <DatePicker mode="single" selected={selectedDate} onSelect={handleDateSelect} minDate={new Date()} maxDate={addDays(new Date(), 30)} required />
      </div>
      <div>
        <Label htmlFor="time">Time</Label>
        <select id="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required className="w-full p-2 border rounded bg-background">
          <option value="">Select a time</option>
          {[...Array(24)].map((_, i) => {
            const hour = i.toString().padStart(2, '0');
            return <option key={hour + ':00'} value={hour + ':00'}>
              {hour}:00
            </option>;
          })}
        </select>
      </div>
      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea id="specialRequests" {...register("specialRequests")} className="w-full border rounded" />
      </div>
      <Button type="submit">Submit Booking Request</Button>
    </form>
  </div>;
}