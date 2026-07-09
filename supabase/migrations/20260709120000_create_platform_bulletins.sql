-- ================================================================
-- Platform Bulletins : Informational global section for hotel admins
-- Published by Super Admin, read-only for hotel admins, invisible to guests
-- ================================================================

CREATE TABLE IF NOT EXISTS public.platform_bulletins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT 'Info',
  color        TEXT NOT NULL DEFAULT 'blue',
  items        JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index  INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_platform_bulletins_updated_at ON public.platform_bulletins;
CREATE TRIGGER trg_platform_bulletins_updated_at
  BEFORE UPDATE ON public.platform_bulletins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.platform_bulletins ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read (hotel admins)
CREATE POLICY "Authenticated can read bulletins"
  ON public.platform_bulletins FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only super_admin can write
CREATE POLICY "Super admin full access bulletins"
  ON public.platform_bulletins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Grants
GRANT SELECT ON public.platform_bulletins TO authenticated;

-- ================================================================
-- Seed: Barème de Points initial
-- ================================================================

INSERT INTO public.platform_bulletins (title, icon, color, order_index, is_published, items) VALUES
(
  'Points de Dépense (Cash-to-Points)',
  'Coins',
  'amber',
  1,
  true,
  '[
    {"label": "1 TND dépensé", "value": "+5 Points", "note": "Sur tout le hors-hébergement : Restaurants, Bars, Spa, Activités facturés sur la chambre ou payés au comptoir"}
  ]'::jsonb
),
(
  'Points de Bienvenue & Profil (Onboarding)',
  'Star',
  'blue',
  2,
  true,
  '[
    {"label": "Création de compte sur l''application", "value": "+100 Points"},
    {"label": "Profil 100% complété", "value": "+200 Points"}
  ]'::jsonb
),
(
  'Points d''Automatisation & Interaction (Digital Reflex)',
  'Zap',
  'emerald',
  3,
  true,
  '[
    {"label": "Commande de service autonome via l''App (Request)", "value": "+100 Points / request", "note": "Demander du Housekeeping / Signaler un problème / Commander un Room-service ou réserver un créneau horaire au Spa..."},
    {"label": "Première interaction avec la Conciergerie IA", "value": "+50 Points"}
  ]'::jsonb
),
(
  'Points de Feedback & Réputation',
  'MessageSquare',
  'purple',
  4,
  true,
  '[
    {"label": "Réponse au questionnaire de satisfaction à chaud (In-App)", "value": "+150 Points"}
  ]'::jsonb
);
