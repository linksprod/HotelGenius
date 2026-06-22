-- ================================================================
-- Allow admin to INSERT/DELETE guest_preferences and guest_medical_alerts
-- for guests belonging to the admin's hotel (multi-tenancy safe).
-- The existing "Admins can manage all preferences" policy covers SELECT + ALL,
-- but we add explicit INSERT/DELETE policies scoped to hotel for clarity.
-- ================================================================

-- Ensure admins can insert preferences for their hotel's guests
DROP POLICY IF EXISTS "Admins can insert preferences for hotel guests" ON public.guest_preferences;
CREATE POLICY "Admins can insert preferences for hotel guests"
  ON public.guest_preferences FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.guests g
      JOIN public.user_roles ur ON ur.hotel_id = g.hotel_id
      WHERE g.id = guest_preferences.guest_id
        AND ur.user_id = auth.uid()
    )
  );

-- Ensure admins can delete preferences for their hotel's guests
DROP POLICY IF EXISTS "Admins can delete preferences for hotel guests" ON public.guest_preferences;
CREATE POLICY "Admins can delete preferences for hotel guests"
  ON public.guest_preferences FOR DELETE
  USING (
    public.is_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.guests g
      JOIN public.user_roles ur ON ur.hotel_id = g.hotel_id
      WHERE g.id = guest_preferences.guest_id
        AND ur.user_id = auth.uid()
    )
  );

-- Ensure admins can insert alerts for their hotel's guests
DROP POLICY IF EXISTS "Admins can insert alerts for hotel guests" ON public.guest_medical_alerts;
CREATE POLICY "Admins can insert alerts for hotel guests"
  ON public.guest_medical_alerts FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.guests g
      JOIN public.user_roles ur ON ur.hotel_id = g.hotel_id
      WHERE g.id = guest_medical_alerts.guest_id
        AND ur.user_id = auth.uid()
    )
  );

-- Ensure admins can delete alerts for their hotel's guests
DROP POLICY IF EXISTS "Admins can delete alerts for hotel guests" ON public.guest_medical_alerts;
CREATE POLICY "Admins can delete alerts for hotel guests"
  ON public.guest_medical_alerts FOR DELETE
  USING (
    public.is_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.guests g
      JOIN public.user_roles ur ON ur.hotel_id = g.hotel_id
      WHERE g.id = guest_medical_alerts.guest_id
        AND ur.user_id = auth.uid()
    )
  );
