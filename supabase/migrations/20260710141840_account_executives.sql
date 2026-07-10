-- Create Account Executives table
CREATE TABLE IF NOT EXISTS public.account_executives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  affiliate_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Commission Settings table
CREATE TABLE IF NOT EXISTS public.ae_commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_hotels INT NOT NULL,
  max_hotels INT, -- NULL means infinity (e.g. 11+ hotels)
  rate NUMERIC(5,2) NOT NULL, -- e.g. 10.00 for 10%
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default commission settings
INSERT INTO public.ae_commission_settings (min_hotels, max_hotels, rate)
VALUES 
  (1, 5, 10.00),
  (6, 10, 15.00),
  (11, NULL, 20.00)
ON CONFLICT DO NOTHING;

-- Create AE Hotel Leads table
CREATE TABLE IF NOT EXISTS public.ae_hotel_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ae_id UUID REFERENCES public.account_executives(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'en_discussion', 'demo_planifiee', 'contrat_envoye', 'signe', 'refuse', 'perdu')),
  contract_value NUMERIC(12,2),
  commission_amount NUMERIC(12,2),
  commission_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create AE Commissions table
CREATE TABLE IF NOT EXISTS public.ae_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ae_id UUID REFERENCES public.account_executives(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.ae_hotel_leads(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.account_executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ae_commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ae_hotel_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ae_commissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Super admins have full access to account_executives" ON public.account_executives;
DROP POLICY IF EXISTS "Account executives can view their own profile" ON public.account_executives;
DROP POLICY IF EXISTS "Super admins have full access to ae_commission_settings" ON public.ae_commission_settings;
DROP POLICY IF EXISTS "Anyone authenticated can read commission settings" ON public.ae_commission_settings;
DROP POLICY IF EXISTS "Super admins have full access to ae_hotel_leads" ON public.ae_hotel_leads;
DROP POLICY IF EXISTS "Account executives can view their own leads" ON public.ae_hotel_leads;
DROP POLICY IF EXISTS "Account executives can insert their own leads" ON public.ae_hotel_leads;
DROP POLICY IF EXISTS "Super admins have full access to ae_commissions" ON public.ae_commissions;
DROP POLICY IF EXISTS "Account executives can view their own commissions" ON public.ae_commissions;

-- Create Policies

-- 1. account_executives policies
CREATE POLICY "Super admins have full access to account_executives" ON public.account_executives
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Account executives can view their own profile" ON public.account_executives
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. ae_commission_settings policies
CREATE POLICY "Super admins have full access to ae_commission_settings" ON public.ae_commission_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Anyone authenticated can read commission settings" ON public.ae_commission_settings
  FOR SELECT TO authenticated
  USING (true);

-- 3. ae_hotel_leads policies
CREATE POLICY "Super admins have full access to ae_hotel_leads" ON public.ae_hotel_leads
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Account executives can view their own leads" ON public.ae_hotel_leads
  FOR SELECT TO authenticated
  USING (
    ae_id IN (
      SELECT id FROM public.account_executives 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Account executives can insert their own leads" ON public.ae_hotel_leads
  FOR INSERT TO authenticated
  WITH CHECK (
    ae_id IN (
      SELECT id FROM public.account_executives 
      WHERE user_id = auth.uid()
    )
  );

-- 4. ae_commissions policies
CREATE POLICY "Super admins have full access to ae_commissions" ON public.ae_commissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Account executives can view their own commissions" ON public.ae_commissions
  FOR SELECT TO authenticated
  USING (
    ae_id IN (
      SELECT id FROM public.account_executives 
      WHERE user_id = auth.uid()
    )
  );
