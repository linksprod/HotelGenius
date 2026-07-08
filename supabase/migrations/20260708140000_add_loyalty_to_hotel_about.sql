-- Migration to add Loyalty Program fields to hotel_about table
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS loyalty_enabled BOOLEAN DEFAULT false;
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS loyalty_title TEXT DEFAULT 'Loyalty Program';
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS loyalty_description TEXT DEFAULT 'Join our exclusive loyalty program to unlock premium benefits and rewards during your stay.';
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS loyalty_tiers JSONB DEFAULT '[
  {"name": "Bronze", "points": "0 - 1000 pts"},
  {"name": "Silver", "points": "1000 - 3000 pts"},
  {"name": "Gold", "points": "3000 - 6000 pts"},
  {"name": "VIP", "points": "6,000+ pts"}
]'::jsonb;
ALTER TABLE hotel_about ADD COLUMN IF NOT EXISTS loyalty_benefits JSONB DEFAULT '[
  {"name": "Points Required", "values": ["0 - 1000 pts", "1000 - 3000 pts", "3000 - 6000 pts", "6,000+ pts"]},
  {"name": "In-App Service Discount", "values": ["—", "5% Off", "10% Off", "15% Off"]},
  {"name": "24/7 AI Concierge Access", "values": ["✓", "✓", "✓", "✓"]},
  {"name": "Premium High-Speed Wi-Fi", "values": ["✓", "✓", "✓", "✓"]},
  {"name": "Complimentary Welcome Drink", "values": ["—", "✓", "✓", "✓"]},
  {"name": "Early Check-in (Subject to availability)", "values": ["—", "—", "✓", "✓"]},
  {"name": "Guaranteed Late Check-out (Until 1:00 PM)", "values": ["—", "—", "—", "✓"]},
  {"name": "VIP Welcome In-Room Gift", "values": ["—", "—", "—", "✓"]},
  {"name": "Priority Support Canal", "values": ["—", "—", "—", "✓"]}
]'::jsonb;
