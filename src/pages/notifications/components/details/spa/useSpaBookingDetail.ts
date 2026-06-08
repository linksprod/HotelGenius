
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import { supabase } from '@/integrations/supabase/client';
import { NotificationItem } from '@/types/notification';
import { useNavigate } from 'react-router-dom';
import { SpaBooking } from '@/features/spa/types';

export interface BookingDetailState {
  booking: SpaBooking | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  facility: any | null;
  isLoading: boolean;
  error: string | null;
}

export const useSpaBookingDetail = (notification: NotificationItem) => {
  const navigate = useNavigate();
  const [state, setState] = useState<BookingDetailState>({
    booking: null,
    service: null,
    facility: null,
    isLoading: true,
    error: null
  });
  
  const { getBookingById, cancelBooking } = useSpaBookings();
  
  // Fetch booking details
  const loadBookingDetails = useCallback(async () => {
    if (!notification || !notification.id) {
      console.error('No notification or notification ID provided');
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Aucun identifiant de réservation fourni'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('Loading booking details for notification ID:', notification.id);
      const bookingData = await getBookingById(notification.id);
      
      if (!bookingData) {
        console.error('No booking data found for ID:', notification.id);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: `Réservation avec ID ${notification.id} introuvable`
        }));
        return;
      }
      
      setState(prev => ({ ...prev, booking: bookingData }));
      
      // Get service details
      if (bookingData.service_id) {
        const { data: serviceData, error: serviceError } = await supabase
          .from('spa_services')
          .select('*')
          .eq('id', bookingData.service_id)
          .maybeSingle();
        
        if (serviceError) {
          console.error('Error fetching service:', serviceError);
        } else if (serviceData) {
          setState(prev => ({ ...prev, service: serviceData }));
          
          // Get facility details if service has facility_id
          if (serviceData.facility_id) {
            const { data: facilityData, error: facilityError } = await supabase
              .from('spa_facilities')
              .select('*')
              .eq('id', serviceData.facility_id)
              .maybeSingle();
            
            if (facilityError) {
              console.error('Error fetching facility:', facilityError);
            } else if (facilityData) {
              setState(prev => ({ ...prev, facility: facilityData }));
            }
          }
        }
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      
    } catch (error) {
      console.error('Error loading booking details:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Erreur lors du chargement des détails de la réservation"
      }));
    }
  }, [notification, getBookingById]);
  
  useEffect(() => {
    loadBookingDetails();
  }, [loadBookingDetails]);

  // Cancel booking handler
  const handleCancelBooking = async (id: string) => {
    if (!id) return;
    
    try {
      await cancelBooking(id);
      toast.success("Réservation annulée avec succès");
      
      // Reload the data to show the updated status
      const updatedBooking = await getBookingById(id);
      setState(prev => ({ ...prev, booking: updatedBooking }));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error("Erreur lors de l'annulation de la réservation");
    }
  };

  return {
    ...state,
    handleCancelBooking
  };
};
