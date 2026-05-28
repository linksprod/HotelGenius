// ─── AI Setup System — Shared TypeScript Types ─────────────────────────────

export type AIConfidence = 'high' | 'medium' | 'low';

export type SetupSessionStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'reviewing'
  | 'committing'
  | 'done'
  | 'error';

// ─── Raw AI Draft Shapes ────────────────────────────────────────────────────

export interface AIAbout {
  confidence: number;
  name: string | null;
  tagline: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  checkIn: string | null;
  checkOut: string | null;
  starRating: number | null;
  amenities: string[];
}

export interface AIRoom {
  name: string;
  type: string;
  description: string | null;
  amenities: string[];
  maxGuests: number | null;
  priceEstimate: string | null;
}

export interface AIRestaurant {
  name: string;
  cuisine: string | null;
  description: string | null;
  hours: string | null;
  priceRange: string | null;
  dressCode: string | null;
}

export interface AISpaTreatment {
  name: string;
  description: string | null;
  duration: string | null;
  price: string | null;
}

export interface AISpa {
  confidence: number;
  description: string | null;
  hours: string | null;
  treatments: AISpaTreatment[];
}

export interface AIActivity {
  name: string;
  description: string | null;
  duration: string | null;
  price: string | null;
}

export interface AIPolicy {
  title: string;
  content: string;
}

export interface AIFAQ {
  question: string;
  answer: string;
}

export interface AIExtractedContent {
  about: AIAbout;
  rooms: {
    confidence: number;
    items: AIRoom[];
  };
  restaurants: {
    confidence: number;
    items: AIRestaurant[];
  };
  spa: AISpa;
  activities: {
    confidence: number;
    items: AIActivity[];
  };
  policies: {
    confidence: number;
    items: AIPolicy[];
  };
  faqs: {
    confidence: number;
    items: AIFAQ[];
  };
}

// ─── Section Keys ───────────────────────────────────────────────────────────

export type SectionKey =
  | 'about'
  | 'rooms'
  | 'restaurants'
  | 'spa'
  | 'activities'
  | 'policies'
  | 'faqs';

export const SECTION_LABELS: Record<SectionKey, string> = {
  about: 'About Hotel',
  rooms: 'Rooms & Suites',
  restaurants: 'Restaurants & Bars',
  spa: 'Spa & Wellness',
  activities: 'Activities',
  policies: 'Policies',
  faqs: 'FAQs',
};

export const SECTION_ICONS: Record<SectionKey, string> = {
  about: '🏨',
  rooms: '🛏️',
  restaurants: '🍽️',
  spa: '💆',
  activities: '🏊',
  policies: '📋',
  faqs: '❓',
};

// ─── Session Shape ──────────────────────────────────────────────────────────

export interface SetupSession {
  id: string;
  hotel_id: string;
  status: SetupSessionStatus;
  source_type: string | null;
  source_names: string[];
  raw_text: string | null;
  ai_draft: AIExtractedContent | null;
  committed_sections: SectionKey[];
  progress_percent: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Confidence Helpers ─────────────────────────────────────────────────────

export function getConfidenceLevel(score: number): AIConfidence {
  if (score >= 0.75) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export function getConfidenceLabel(confidence: AIConfidence): string {
  switch (confidence) {
    case 'high': return 'High Confidence';
    case 'medium': return 'Needs Review';
    case 'low': return 'Low — Manual Entry Recommended';
  }
}

export function getConfidenceColor(confidence: AIConfidence): string {
  switch (confidence) {
    case 'high': return 'text-emerald-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-rose-500';
  }
}

export function getConfidenceBg(confidence: AIConfidence): string {
  switch (confidence) {
    case 'high': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    case 'medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    case 'low': return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
  }
}

// ─── Uploaded File Shape ────────────────────────────────────────────────────

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'reading' | 'done' | 'error';
  progress: number;
  extractedText?: string;
  error?: string;
}
