ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE spa_services ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE spa_facilities ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
