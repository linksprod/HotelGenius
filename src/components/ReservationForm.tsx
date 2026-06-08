
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTableReservations } from '@/hooks/useTableReservations';
import { useRestaurantMenus } from '@/hooks/useRestaurantMenus';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { format } from 'date-fns';
import GuestInfoFields from '@/components/reservation/GuestInfoFields';
import DateTimeFields from '@/components/reservation/DateTimeFields';
import MenuSelection from '@/components/reservation/MenuSelection';
import SpecialRequests from '@/components/reservation/SpecialRequests';
import { ReservationFormProps, ReservationFormValues } from '@/components/reservation/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ReservationForm = ({ restaurantId, onSuccess, buttonText, existingReservation }: ReservationFormProps) => {
  const { createReservation, isCreating } = useTableReservations(restaurantId);
  const { menuItems, isLoading: isLoadingMenuItems } = useRestaurantMenus(restaurantId);
  const { userData } = useAuth();
  const { t } = useTranslation();
  
  // Grouper les menus par catégorie pour l'affichage
  const menuCategories = React.useMemo(() => {
    if (!menuItems) return [];
    
    const categories = [...new Set(menuItems.map(item => item.category))];
    return categories.map(category => ({
      category,
      items: menuItems.filter(item => item.category === category)
    }));
  }, [menuItems]);
  
  const form = useForm<ReservationFormValues>({
    defaultValues: {
      guestName: existingReservation?.guestName || '',
      guestEmail: existingReservation?.guestEmail || '',
      guestPhone: existingReservation?.guestPhone || '',
      roomNumber: existingReservation?.roomNumber || '',
      date: existingReservation?.date ? new Date(existingReservation.date) : undefined,
      time: existingReservation?.time || '',
      guests: existingReservation?.guests || 2,
      menuId: 'none',
      specialRequests: existingReservation?.specialRequests || ''
    }
  });

  // Populate form with user data when available
  useEffect(() => {
    if (userData && !existingReservation) {
      console.log("Populating form with user data:", userData);
      
      // Format full name from user data
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
      
      // Get user details from localStorage if available and no existing reservation
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

  const onSubmit = form.handleSubmit((data) => {
    console.log('Form submission data:', data);
    
    if (!data.date) {
      form.setError('date', { message: t('forms.validation.dateRequired') });
      return;
    }
    
    // Validate the room number is present
    if (!data.roomNumber) {
      form.setError('roomNumber', { message: t('forms.validation.roomNumberRequired') });
      toast.error(t('forms.validation.pleaseProvideRoomNumber'));
      return;
    }
    
    if (!data.guestName) {
      form.setError('guestName', { message: t('forms.validation.nameRequired') });
      toast.error(t('forms.validation.pleaseProvideName'));
      return;
    }
    
    // Filter out "none" value for menuId
    const reservation = {
      restaurantId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      roomNumber: data.roomNumber,
      date: format(data.date, 'yyyy-MM-dd'),
      time: data.time,
      guests: data.guests,
      specialRequests: data.specialRequests,
      status: 'pending' as const
    };
    
    console.log('Submitting reservation:', reservation);
    
    createReservation(reservation, {
      onSuccess: () => {
        form.reset();
        toast.success(t('forms.messages.reservationSentSuccess'));
        if (onSuccess) onSuccess();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        console.error('Error creating reservation:', error);
        const errorMessage = error.message || t('forms.messages.reservationCreationError');
        toast.error(`${t('forms.messages.reservationError')}: ${errorMessage}`);
      }
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <GuestInfoFields form={form} />
        <DateTimeFields form={form} />
        <MenuSelection form={form} menuCategories={menuCategories} isLoadingMenuItems={isLoadingMenuItems} />
        <SpecialRequests form={form} />
        
        <Button type="submit" className="w-full" disabled={isCreating}>
          {isCreating ? t('forms.buttons.reserving') : (buttonText || t('forms.buttons.reserveTable'))}
        </Button>
      </form>
    </Form>
  );
};

export default ReservationForm;
