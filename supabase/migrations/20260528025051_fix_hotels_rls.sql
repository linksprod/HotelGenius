-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Hotel Admins can view and update their own hotel" ON public.hotels;
DROP POLICY IF EXISTS "Hotel Admins can update their own hotel" ON public.hotels;

-- Recreate policy for SELECT (if missing from the original FOR ALL)
CREATE POLICY "Hotel Admins can view their own hotel"
ON public.hotels
FOR SELECT
USING (
    id IN (
        SELECT hotel_id FROM public.user_roles
        WHERE user_id = auth.uid()
    )
);

-- Create dedicated policy for UPDATE
CREATE POLICY "Hotel Admins can update their own hotel"
ON public.hotels
FOR UPDATE
USING (
    id IN (
        SELECT hotel_id FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('hotel_admin', 'super_admin')
    )
)
WITH CHECK (
    id IN (
        SELECT hotel_id FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('hotel_admin', 'super_admin')
    )
);
