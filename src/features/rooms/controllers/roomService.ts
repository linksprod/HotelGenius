import { supabase } from '@/integrations/supabase/client';
import { ServiceType } from '../types';
import { toast } from '@/hooks/use-toast';
import { RoomType, ServiceRequestType } from '@/features/types/supabaseTypes';
import { NotificationService } from '@/services/NotificationService';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

// Function to create a new service request
export const createServiceRequest = async (requestData: {
  guest_id: string;
  room_id: string;
  type: string;
  description: string;
  status?: string;
  request_item_id?: string;
  category_id?: string;
  room_number?: string;
  guest_name?: string;
}) => {
  try {
    // S'assurer que le room_number est toujours présent
    if (!requestData.room_number) {
      // Privilégier le room_number stocké dans localStorage
      const storedRoomNumber = localStorage.getItem('user_room_number');
      if (storedRoomNumber) {
        requestData.room_number = storedRoomNumber;
        console.log('Using room number from localStorage:', storedRoomNumber);
      } else {
        // Essayer de récupérer le numéro de chambre à partir des données utilisateur
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            if (userData.room_number) {
              requestData.room_number = userData.room_number;
              console.log('Using room number from user data:', userData.room_number);
            }
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      }
    }

    // S'assurer que le guest_name est toujours présent
    if (!requestData.guest_name || requestData.guest_name === 'Guest') {
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
          if (fullName) {
            requestData.guest_name = fullName || 'Guest';
            console.log('Using guest name from user data:', fullName);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      // If still no guest name, try to get it from the database based on room number
      if ((!requestData.guest_name || requestData.guest_name === 'Guest') && requestData.room_number) {
        try {
          const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .select('first_name, last_name')
            .eq('room_number', requestData.room_number)
            .order('updated_at', { ascending: false })
            .limit(1);

          if (!guestError && guestData && guestData.length > 0) {
            requestData.guest_name = `${guestData[0].first_name || ''} ${guestData[0].last_name || ''}`.trim() || 'Guest';
            console.log('Using guest name from database:', requestData.guest_name);
          }
        } catch (error) {
          console.error("Error fetching guest data:", error);
        }
      }
    }
    console.log('Creating service request with data:', {
      guest_id: requestData.guest_id,
      room_number: requestData.room_number,
      guest_name: requestData.guest_name,
      type: requestData.type
    });

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        ...requestData,
        status: requestData.status || 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service request:', error);
      throw error;
    }

    // Trigger notification for staff
    await NotificationService.createNotification({
      hotel_id: (data as any).hotel_id,
      type: 'service_ticket_created',
      recipient_type: 'staff',
      recipient_id: '00000000-0000-0000-0000-000000000000',
      template_data: {
        room_number: requestData.room_number || 'N/A',
        description: requestData.description
      },
      source_module: 'Service',
      source_event: 'created',
      reference_id: data.id,
      reference_type: 'ServiceRequest'
    });

    return data;
  } catch (error) {
    console.error('Error in createServiceRequest:', error);
    throw error;
  }
};

// Mettre à jour la fonction requestService également
export const requestService = async (
  roomId: string,
  type: ServiceType,
  description: string,
  request_item_id?: string,
  category_id?: string,
  hotelId?: string | null
) => {
  try {
    // Récupérer l'ID utilisateur et les données utilisateur du localStorage
    const userId = localStorage.getItem('user_id') || '00000000-0000-0000-0000-000000000000';

    // Privilégier le room_number stocké directement dans localStorage
    let room_number = localStorage.getItem('user_room_number') || '';
    let guest_name = 'Guest';

    // Si le room_number n'est pas disponible, essayer de le récupérer des données utilisateur
    if (!room_number) {
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);

          // Récupérer le nom complet
          guest_name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Guest';

          // Récupérer le numéro de chambre
          if (userData.room_number) {
            room_number = userData.room_number;
            // Sauvegarder dans localStorage pour un accès plus facile à l'avenir
            localStorage.setItem('user_room_number', room_number);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }

    // Ensure the guest record exists and is associated with the correct hotel
    // This is crucial for the double-fetch logic used in the admin section
    if (userId && hotelId) {
      try {
        const { data: existingGuest } = await supabase
          .from('guests')
          .select('id, hotel_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingGuest) {
          if (!existingGuest.hotel_id || existingGuest.hotel_id === '00000000-0000-0000-0000-000000000000') {
            await supabase
              .from('guests')
              .update({ hotel_id: hotelId } as any)
              .eq('id', existingGuest.id);
            console.log('Updated existing guest with hotelId:', hotelId);
          }
        } else {
          // Create a guest record if it doesn't exist
          await supabase
            .from('guests')
            .insert({
              user_id: userId,
              hotel_id: hotelId,
              room_number: room_number || null,
              first_name: guest_name.split(' ')[0] || 'Guest',
              last_name: guest_name.split(' ').slice(1).join(' ') || '',
            } as any);
          console.log('Created new guest record for hotelId:', hotelId);
        }
      } catch (err) {
        console.error('Error ensuring guest-hotel association:', err);
      }
    }

    // Si le numéro de chambre n'est toujours pas disponible, essayer d'utiliser le roomId
    if (!room_number && !roomId.includes('-')) {
      room_number = roomId;
      // Sauvegarder dans localStorage
      localStorage.setItem('user_room_number', room_number);
    }

    // Si guest_name est 'Guest' et que nous avons un room_number, essayer d'obtenir le nom réel
    if ((guest_name === 'Guest' || !guest_name) && room_number) {
      try {
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('first_name, last_name')
          .eq('room_number', room_number)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!guestError && guestData && guestData.length > 0) {
          guest_name = `${guestData[0].first_name || ''} ${guestData[0].last_name || ''}`.trim() || 'Guest';
          console.log('Found guest name from database:', guest_name);
        }
      } catch (error) {
        console.error("Error fetching guest data:", error);
      }
    }

    console.log('Submitting service request with room_number:', room_number, 'and guest_name:', guest_name);

    // Vérifier si le roomId est au format UUID ou au format numéro de chambre
    let actualRoomId = roomId;

    if (!roomId.includes('-')) {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_number', roomId)
        .maybeSingle();

      if (roomError) {
        console.error('Error fetching room data:', roomError);
        throw roomError;
      }

      if (roomData) {
        actualRoomId = roomData.id;
      } else {
        console.error('Room not found:', roomId);
        toast({
          title: "Room Not Found",
          description: `We couldn't find room ${roomId} in our system.`,
          variant: "destructive"
        });
        throw new Error(`Room ${roomId} not found`);
      }
    }

    console.log('Final request parameters:', {
      guest_id: userId,
      room_id: actualRoomId,
      room_number,
      guest_name,
      type,
      description
    });

    // Ensure we have a category_id for scoping, otherwise it won't be visible in the admin
    let finalCategoryId = category_id;
    if (!finalCategoryId) {
      // Find the first available category for this hotel (could be improved to find a 'General' one)
      const { data: catData } = await supabase
        .from('request_categories')
        .select('id')
        .limit(1); // Since we can't easily filter by hotel_id here without circular dependency or extra query, we just pick one

      if (catData && catData.length > 0) {
        finalCategoryId = catData[0].id;
        console.log('Assigned fallback category_id for scoping:', finalCategoryId);
      }
    }

    // Insérer la demande avec les bonnes données
    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        guest_id: userId,
        room_id: actualRoomId,
        room_number: room_number,
        guest_name,
        type,
        description,
        request_item_id,
        category_id: finalCategoryId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error saving request to database:', error);
      throw error;
    }

    // Trigger notification for staff
    if (data && data.length > 0) {
      await NotificationService.createNotification({
        hotel_id: hotelId || undefined,
        type: 'service_ticket_created',
        recipient_type: 'staff',
        recipient_id: '00000000-0000-0000-0000-000000000000',
        template_data: {
          room_number: room_number || 'N/A',
          description: description
        },
        source_module: 'Service',
        source_event: 'created',
        reference_id: data[0].id,
        reference_type: 'ServiceRequest'
      });
    }

    return data;
  } catch (error) {
    console.error('Error submitting service request:', error);
    throw error;
  }
};

// Function to update the status of a service request
export const updateRequestStatus = async (
  requestId: string,
  status: 'pending' | 'on_hold' | 'in_progress' | 'completed' | 'cancelled'
): Promise<void> => {
  try {
    const { data: request, error: fetchError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('service_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      console.error('Error updating request status:', error);
      throw error;
    }

    // Notify guest if completed
    if (status === 'completed' && request.guest_id) {
      await NotificationService.createNotification({
        hotel_id: (request as any).hotel_id,
        type: 'service_ticket_completed',
        recipient_type: 'guest',
        recipient_id: request.guest_id,
        template_data: {
          description: request.description
        },
        source_module: 'Service',
        source_event: 'completed',
        reference_id: requestId,
        reference_type: 'ServiceRequest'
      });
    }
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Function to get service requests for a room
export const getServiceRequestsForRoom = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        request_items(*)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting service requests:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getServiceRequestsForRoom:', error);
    throw error;
  }
};
