ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS checkin_token TEXT UNIQUE;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS checkin_status TEXT DEFAULT 'pending';
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS room_type TEXT;

-- Create a SECURITY DEFINER RPC function to search for guest by checkin_token anonymously
CREATE OR REPLACE FUNCTION public.get_guest_by_token(p_token TEXT)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  v_guest RECORD;
BEGIN
  SELECT g.*, h.name as hotel_name 
  INTO v_guest
  FROM public.guests g
  LEFT JOIN public.hotels h ON g.hotel_id = h.id
  WHERE g.checkin_token = p_token
  LIMIT 1;

  IF v_guest.id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_guest.id,
    'first_name', v_guest.first_name,
    'last_name', v_guest.last_name,
    'email', v_guest.email,
    'phone', v_guest.phone,
    'check_in_date', v_guest.check_in_date,
    'check_out_date', v_guest.check_out_date,
    'birth_date', v_guest.birth_date,
    'nationality', v_guest.nationality,
    'hotel_id', v_guest.hotel_id,
    'hotel_name', v_guest.hotel_name,
    'room_type', v_guest.room_type,
    'room_number', v_guest.room_number,
    'checkin_status', v_guest.checkin_status
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_guest_by_token(TEXT) TO anon, authenticated;
