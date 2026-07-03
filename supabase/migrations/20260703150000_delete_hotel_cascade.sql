CREATE OR REPLACE FUNCTION public.delete_hotel_cascade(target_hotel_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to bypass RLS
AS $$
BEGIN
  -- 1. Delete notifications
  DELETE FROM public.notifications WHERE hotel_id = target_hotel_id;

  -- 2. Delete hotel_about
  DELETE FROM public.hotel_about WHERE hotel_id = target_hotel_id;

  -- 3. Delete hotel_activities
  DELETE FROM public.hotel_activities WHERE hotel_id = target_hotel_id;

  -- 4. Delete hotel_setup_sessions
  DELETE FROM public.hotel_setup_sessions WHERE hotel_id = target_hotel_id;

  -- 5. Delete table_reservations
  DELETE FROM public.table_reservations WHERE hotel_id = target_hotel_id;

  -- 6. Delete event_reservations
  DELETE FROM public.event_reservations WHERE hotel_id = target_hotel_id;

  -- 7. Delete request_items
  DELETE FROM public.request_items WHERE hotel_id = target_hotel_id;

  -- 8. Delete messages
  DELETE FROM public.messages WHERE hotel_id = target_hotel_id;

  -- 9. Delete conversations
  DELETE FROM public.conversations WHERE hotel_id = target_hotel_id;

  -- 10. Delete service_requests
  DELETE FROM public.service_requests WHERE hotel_id = target_hotel_id;

  -- 11. Delete stories
  DELETE FROM public.stories WHERE hotel_id = target_hotel_id;

  -- 12. Delete spa_bookings
  DELETE FROM public.spa_bookings WHERE hotel_id = target_hotel_id;

  -- 13. Delete spa_services
  DELETE FROM public.spa_services WHERE hotel_id = target_hotel_id;

  -- 14. Delete spa_facilities
  DELETE FROM public.spa_facilities WHERE hotel_id = target_hotel_id;

  -- 15. Delete events
  DELETE FROM public.events WHERE hotel_id = target_hotel_id;

  -- 16. Delete restaurants
  DELETE FROM public.restaurants WHERE hotel_id = target_hotel_id;

  -- 17. Delete request_categories
  DELETE FROM public.request_categories WHERE hotel_id = target_hotel_id;

  -- 18. Delete hotel_config
  DELETE FROM public.hotel_config WHERE hotel_id = target_hotel_id;

  -- 19. Delete guest_feedback
  DELETE FROM public.guest_feedback WHERE hotel_id = target_hotel_id;

  -- 20. Update guest_digital_twin (SET NULL)
  UPDATE public.guest_digital_twin SET hotel_id = NULL WHERE hotel_id = target_hotel_id;

  -- 21. Delete user_roles
  DELETE FROM public.user_roles WHERE hotel_id = target_hotel_id;

  -- 22. Delete guests
  DELETE FROM public.guests WHERE hotel_id = target_hotel_id;

  -- 23. Update child hotels (SET NULL)
  UPDATE public.hotels SET parent_hotel_id = NULL WHERE parent_hotel_id = target_hotel_id;

  -- 24. Finally, delete the hotel itself
  DELETE FROM public.hotels WHERE id = target_hotel_id;

  RETURN TRUE;
END;
$$;
