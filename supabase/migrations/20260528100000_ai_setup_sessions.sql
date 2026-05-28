-- ============================================================
-- AI Hotel Setup Sessions
-- Stores progress + AI-extracted drafts for the onboarding flow
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hotel_setup_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,

  -- Processing state
  status TEXT NOT NULL DEFAULT 'idle',
  -- 'idle' | 'uploading' | 'extracting' | 'reviewing' | 'committing' | 'done' | 'error'

  -- Source info
  source_type TEXT, -- 'pdf' | 'website' | 'manual'
  source_names TEXT[] DEFAULT '{}', -- original filenames or URLs

  -- Raw extracted text (before AI structuring)
  raw_text TEXT,

  -- Full structured AI output (JSONB for flexibility)
  ai_draft JSONB,

  -- Which sections have been committed to live tables
  committed_sections TEXT[] DEFAULT '{}',

  -- Progress for the UI (0-100)
  progress_percent INTEGER DEFAULT 0,

  -- Error details if something went wrong
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_hotel_setup_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hotel_setup_sessions_updated_at ON public.hotel_setup_sessions;
CREATE TRIGGER set_hotel_setup_sessions_updated_at
  BEFORE UPDATE ON public.hotel_setup_sessions
  FOR EACH ROW EXECUTE FUNCTION update_hotel_setup_sessions_updated_at();

-- RLS
ALTER TABLE public.hotel_setup_sessions ENABLE ROW LEVEL SECURITY;

-- Hotel admins can manage their own hotel's sessions
CREATE POLICY "Hotel admins can manage their setup sessions"
  ON public.hotel_setup_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.hotel_id = hotel_setup_sessions.hotel_id
        AND ur.role IN ('admin', 'hotel_admin', 'super_admin')
    )
  );

-- Super admins can see all sessions
CREATE POLICY "Super admins can manage all setup sessions"
  ON public.hotel_setup_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hotel_setup_sessions_hotel_id
  ON public.hotel_setup_sessions(hotel_id);

CREATE INDEX IF NOT EXISTS idx_hotel_setup_sessions_status
  ON public.hotel_setup_sessions(status);
