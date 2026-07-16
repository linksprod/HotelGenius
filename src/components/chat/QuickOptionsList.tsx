import React, { useState } from 'react';
import { 
  Hotel, 
  Utensils, 
  Compass, 
  Sparkles, 
  Car, 
  ClipboardList,
  Info,
  Wrench,
  Monitor,
  ChevronLeft,
  Plus,
  LucideIcon 
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types & Interface
// ---------------------------------------------------------------------------
export interface QuickOption {
  /** Lucide React Component Icon */
  icon: LucideIcon;
  /** Bold title text */
  title: string;
  /** Secondary description shown below the title */
  description: string;
  /** The text that will be sent as a guest message when the card is clicked.
   *  Defaults to `title` if omitted. */
  action?: string;
  /** If set, clicking this option will switch view rather than triggering onSelect */
  subView?: 'requests';
}

// ---------------------------------------------------------------------------
// Main Menu Options
// ---------------------------------------------------------------------------
export const MAIN_OPTIONS: QuickOption[] = [
  {
    icon: Hotel,
    title: 'Hotel Information',
    description: 'Everything about your stay',
    action: 'Hotel Information',
  },
  {
    icon: Utensils,
    title: 'Dining & Bars',
    description: 'Menus, hours, and reservations',
  },
  {
    icon: Compass,
    title: 'Activities & Experiences',
    description: 'Beach, tours, wellness & more',
  },
  {
    icon: Sparkles,
    title: 'Spa & Wellness',
    description: 'Treatments, hours, and booking',
  },
  {
    icon: Car,
    title: 'Transport & Parking',
    description: 'Transfers, rentals, and parking',
  },
  {
    icon: ClipboardList,
    title: 'Requests',
    description: 'Housekeeping, maintenance, IT & more',
    subView: 'requests',
  },
  {
    icon: Info,
    title: 'General Help',
    description: "Questions? We've got you",
    action: 'General Help',
  },
];

// ---------------------------------------------------------------------------
// Requests Sub-Menu Options
// ---------------------------------------------------------------------------
export const REQUESTS_OPTIONS: QuickOption[] = [
  {
    icon: Sparkles,
    title: 'Housekeeping',
    description: 'Room cleaning, towels, amenities',
    action: 'Housekeeping',
  },
  {
    icon: Wrench,
    title: 'Maintenance',
    description: 'Report an issue in your room',
    action: 'Maintenance',
  },
  {
    icon: Monitor,
    title: 'IT Support',
    description: 'Wifi, TV, or device help',
    action: 'Information Technology',
  },
  {
    icon: Plus,
    title: 'Other Request',
    description: 'Anything else you need',
    action: 'Other Requests',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface QuickOptionsListProps {
  onSelect: (text: string) => void;
}

export const QuickOptionsList: React.FC<QuickOptionsListProps> = ({ onSelect }) => {
  const [currentView, setCurrentView] = useState<'main' | 'requests'>('main');

  const handleOptionClick = (option: QuickOption) => {
    if (option.subView) {
      setCurrentView(option.subView);
    } else {
      const actionText = option.action ?? option.title;
      onSelect(actionText);
    }
  };

  const options = currentView === 'main' ? MAIN_OPTIONS : REQUESTS_OPTIONS;

  return (
    <div className="quick-options-wrapper flex flex-col gap-3">
      {/* Back button header if in a sub-view */}
      {currentView !== 'main' && (
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start pl-2 font-medium"
          onClick={() => setCurrentView('main')}
        >
          <ChevronLeft size={14} className="text-[#82A691]" />
          Back to Main Menu
        </button>
      )}

      <div className="quick-options-container">
        {options.map((option, index) => {
          const isLast = index === options.length - 1;
          const IconComponent = option.icon;

          return (
            <React.Fragment key={option.title}>
              <button
                type="button"
                className="quick-option-card"
                onClick={() => handleOptionClick(option)}
                aria-label={`Select ${option.title}`}
              >
                {/* Outline Icon */}
                <div className="quick-option-icon-container">
                  <IconComponent className="quick-option-lucide-icon" size={20} strokeWidth={1.75} />
                </div>

                {/* Text */}
                <div className="quick-option-text">
                  <span className="quick-option-title">{option.title}</span>
                  <span className="quick-option-description">{option.description}</span>
                </div>

                {/* Chevron */}
                <svg
                  className="quick-option-chevron"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Separator between cards (not after the last one) */}
              {!isLast && <div className="quick-option-separator" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
