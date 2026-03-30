
-- Add hotel_id column to service_requests if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'hotel_id') THEN
        ALTER TABLE service_requests ADD COLUMN hotel_id UUID REFERENCES hotels(id);
    END IF;
END $$;

-- Add hotel_id column to shops if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'hotel_id') THEN
        ALTER TABLE shops ADD COLUMN hotel_id UUID REFERENCES hotels(id);
    END IF;
END $$;

-- Add hotel_id column to shop_categories if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_categories' AND column_name = 'hotel_id') THEN
        ALTER TABLE shop_categories ADD COLUMN hotel_id UUID REFERENCES hotels(id);
    END IF;
END $$;
