-- Migration to add Seminars & Meetings fields to hotel_about table
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS has_seminars BOOLEAN DEFAULT false;
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS seminar_description TEXT DEFAULT '';
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS seminar_image TEXT DEFAULT '';
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS seminar_services JSONB DEFAULT '[]'::jsonb;
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS seminar_rooms JSONB DEFAULT '[]'::jsonb;
