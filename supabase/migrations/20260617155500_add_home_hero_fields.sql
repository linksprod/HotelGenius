-- Add home hero customization fields to hotel_config
ALTER TABLE hotel_config ADD COLUMN IF NOT EXISTS home_hero_title TEXT;
ALTER TABLE hotel_config ADD COLUMN IF NOT EXISTS home_hero_subtitle TEXT;
ALTER TABLE hotel_config ADD COLUMN IF NOT EXISTS home_hero_image TEXT;
