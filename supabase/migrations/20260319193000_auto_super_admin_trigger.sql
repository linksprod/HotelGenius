-- Automatic Super Admin assignment trigger
CREATE OR REPLACE FUNCTION public.auto_assign_super_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'projects@hotelgenius.app' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'super_admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS tr_auto_assign_super_admin ON auth.users;
CREATE TRIGGER tr_auto_assign_super_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_super_admin();

-- Also run it for existing user just in case
DO $$
DECLARE
    target_id UUID;
BEGIN
    SELECT id INTO target_id FROM auth.users WHERE email = 'projects@hotelgenius.app' LIMIT 1;
    IF target_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_id, 'super_admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;
