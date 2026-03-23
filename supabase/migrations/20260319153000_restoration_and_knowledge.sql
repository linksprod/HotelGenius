-- ================================================================
-- RESTORATION & KNOWLEDGE BASE MIGRATION
-- 
-- 1. Fixes missing hotel_id columns in Shops and Spa
-- 2. Sets up pgvector and hotel_knowledge table for RAG
-- 3. Enables RLS and auto-tagging for all new data
-- ================================================================

-- Enable the pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Helper function to safely add hotel_id column
CREATE OR REPLACE FUNCTION public.add_tenant_column(table_name text) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'hotel_id'
    ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN hotel_id UUID REFERENCES public.hotels(id)', $1);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ── 1. SCHEMA RESTORATION ──────────────────────────────────────────

-- Add hotel_id to missing tables
SELECT public.add_tenant_column('shops');
SELECT public.add_tenant_column('shop_categories');
SELECT public.add_tenant_column('spa_services');
SELECT public.add_tenant_column('spa_facilities');
SELECT public.add_tenant_column('spa_bookings');

-- Clean up helper
DROP FUNCTION public.add_tenant_column(text);

-- ── 2. AI KNOWLEDGE BASE ───────────────────────────────────────────

-- Create table for hotel-specific knowledge/documentation
CREATE TABLE IF NOT EXISTS public.hotel_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- Optimized for openai text-embedding-3-small
    metadata JSONB DEFAULT '{}'::jsonb,
    source_type TEXT, -- 'pdf', 'text', 'doc', etc
    source_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on the knowledge table
ALTER TABLE public.hotel_knowledge ENABLE ROW LEVEL SECURITY;

-- ── 3. AUTOMATION & TRIGGERS ───────────────────────────────────────

-- Re-apply auto-tagging triggers to new tables
-- (Depends on public.auto_set_hotel_id function existing from 20260223020000_auto_hotel_id_trigger.sql)

DO $$
DECLARE
    t text;
    tables text[] := ARRAY['shops', 'shop_categories', 'spa_services', 'spa_facilities', 'spa_bookings', 'hotel_knowledge'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_auto_hotel_id ON public.%I', t);
        EXECUTE format('
            CREATE TRIGGER trg_auto_hotel_id
            BEFORE INSERT ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.auto_set_hotel_id();
        ', t);
    END LOOP;
END $$;

-- ── 4. RLS POLICIES ────────────────────────────────────────────────

-- Use the existing can_access_hotel_data function for isolation
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['shops', 'shop_categories', 'spa_services', 'spa_facilities', 'spa_bookings', 'hotel_knowledge'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Drop existing to avoid conflicts
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Update" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public.%I', t);
        
        -- Create isolated policies
        EXECUTE format('CREATE POLICY "Tenant Isolation Select" ON public.%I FOR SELECT USING (public.can_access_hotel_data(hotel_id))', t);
        EXECUTE format('CREATE POLICY "Tenant Isolation Insert" ON public.%I FOR INSERT WITH CHECK (public.can_access_hotel_data(hotel_id))', t);
        EXECUTE format('CREATE POLICY "Tenant Isolation Update" ON public.%I FOR UPDATE USING (public.can_access_hotel_data(hotel_id))', t);
        EXECUTE format('CREATE POLICY "Tenant Isolation Delete" ON public.%I FOR DELETE USING (public.can_access_hotel_data(hotel_id))', t);
    END LOOP;
END $$;

-- ── 5. VECTOR INDEX ────────────────────────────────────────────────

-- ── 6. MATCH FUNCTION ──────────────────────────────────────────────

-- Function to match hotel knowledge chunks based on vector similarity
CREATE OR REPLACE FUNCTION public.match_hotel_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_hotel_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hk.id,
    hk.content,
    hk.metadata,
    1 - (hk.embedding <=> query_embedding) AS similarity
  FROM public.hotel_knowledge hk
  WHERE hk.hotel_id = p_hotel_id
    AND 1 - (hk.embedding <=> query_embedding) > match_threshold
  ORDER BY hk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
