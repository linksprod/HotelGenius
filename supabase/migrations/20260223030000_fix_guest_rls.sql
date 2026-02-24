
-- Ensure RLS is enabled on guests
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own guest record
DROP POLICY IF EXISTS "Users can view their own guest record" ON public.guests;
CREATE POLICY "Users can view their own guest record"
ON public.guests
FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to update their own guest record
DROP POLICY IF EXISTS "Users can update their own guest record" ON public.guests;
CREATE POLICY "Users can update their own guest record"
ON public.guests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to insert their own guest record
DROP POLICY IF EXISTS "Users can insert their own guest record" ON public.guests;
CREATE POLICY "Users can insert their own guest record"
ON public.guests
FOR INSERT
WITH CHECK (auth.uid() = user_id);
