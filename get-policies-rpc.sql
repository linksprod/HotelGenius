CREATE OR REPLACE FUNCTION get_hotel_policies()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t)) INTO result
    FROM (
        SELECT policyname, cmd, roles, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'hotels'
    ) t;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
