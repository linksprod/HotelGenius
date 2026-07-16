import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuickReply {
  /** Label displayed on the pill button */
  label: string;
  /**
   * Text sent as a guest message when clicked.
   * Defaults to `label` if omitted.
   */
  action?: string;
}

interface ContextRule {
  /**
   * Keywords to match against the bot message content (case-insensitive).
   * If **any** keyword is found, this rule's replies are shown.
   */
  keywords: string[];
  replies: QuickReply[];
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// ➡️  To add a new category: add a new entry to CONTEXT_RULES with its
//     keywords and desired reply buttons. Nothing else needs to change.
// ---------------------------------------------------------------------------

/** Sentinel label – pressing this re-opens the main menu */
export const BACK_TO_MENU_LABEL = '🏠 Main Menu';
export const BACK_TO_MENU_ACTION = '__SHOW_MAIN_MENU__';

const BACK_BUTTON: QuickReply = {
  label: BACK_TO_MENU_LABEL,
  action: BACK_TO_MENU_ACTION,
};

export const CONTEXT_RULES: ContextRule[] = [
  // ── Requests (evaluated first to avoid generic match conflicts) ─────────────
  {
    keywords: ['requests', 'housekeeping', 'maintenance', 'it ', 'room service', 'cleaning', 'towel', 'minibar', 'bed', 'chambre', 'ménage'],
    replies: [
      { label: '🛏️ Housekeeping', action: 'I need housekeeping service' },
      { label: '🔧 Maintenance', action: 'I have a maintenance request' },
      { label: '💻 IT Support', action: 'I need IT assistance' },
      BACK_BUTTON,
    ],
  },

  // ── Dining & Bars ──────────────────────────────────────────────────────────
  {
    keywords: ['dining', 'bars', 'restaurant', 'restaurant menu', 'dining menu', 'food menu', 'drinks menu', 'food', 'drink', 'réserver une table', 'réservation'],
    replies: [
      { label: '🍽️ View the menu', action: 'Show me the restaurant menu' },
      { label: '📅 Book a table', action: 'I would like to book a table' },
      { label: '🕐 Opening hours', action: 'What are the dining hours?' },
      BACK_BUTTON,
    ],
  },

  // ── Spa & Wellness ─────────────────────────────────────────────────────────
  {
    keywords: ['spa', 'wellness', 'massage', 'treatment', 'soin', 'relaxation', 'hammam', 'sauna'],
    replies: [
      { label: '💆 Available treatments', action: 'Show me available spa treatments' },
      { label: '📅 Book a massage', action: 'I would like to book a massage' },
      { label: '🕐 Spa hours', action: 'What are the spa opening hours?' },
      BACK_BUTTON,
    ],
  },

  // ── Activities & Experiences ────────────────────────────────────────────────
  {
    keywords: ['activities', 'experiences', 'excursion', 'tour', 'beach', 'plage', 'activités'],
    replies: [
      { label: '📋 Today\'s activities', action: 'What activities are available today?' },
      { label: '🏄 Book an excursion', action: 'I would like to book an excursion' },
      { label: '🗺️ Beach info', action: 'Tell me about the beach' },
      BACK_BUTTON,
    ],
  },

  // ── Transport & Parking ─────────────────────────────────────────────────────
  {
    keywords: ['transport', 'parking', 'transfer', 'taxi', 'shuttle', 'car', 'vehicle', 'rental'],
    replies: [
      { label: '🚖 Request a transfer', action: 'I need a transfer' },
      { label: '🅿️ Parking info', action: 'Tell me about parking options' },
      { label: '🚗 Car rental', action: 'I need information about car rental' },
      BACK_BUTTON,
    ],
  },

  // ── Hotel Information ──────────────────────────────────────────────────────
  {
    keywords: ['hotel info', 'hotel information', 'resort', 'information', 'pool', 'piscine', 'wifi', 'check-in', 'check-out', 'amenities', 'facilities'],
    replies: [
      { label: '🏊 Pool hours', action: 'What are the pool opening hours?' },
      { label: '📶 WiFi & access', action: 'What is the WiFi password?' },
      { label: '🕐 Check-in / Check-out', action: 'What are the check-in and check-out times?' },
      BACK_BUTTON,
    ],
  },

  // ── Booking & Reservations (generic) ────────────────────────────────────────
  {
    keywords: ['booking', 'reservation', 'booked', 'reserved', 'confirm', 'cancel', 'modify'],
    replies: [
      { label: '✅ Confirm reservation', action: 'I would like to confirm my reservation' },
      { label: '❌ Cancel reservation', action: 'I need to cancel my reservation' },
      { label: '✏️ Modify reservation', action: 'I would like to modify my reservation' },
      BACK_BUTTON,
    ],
  },
];

/** Fallback shown when no rule matches */
const DEFAULT_REPLIES: QuickReply[] = [
  { label: 'Another question', action: 'I have another question' },
  { label: 'Talk to staff', action: '__ESCALATE_TO_HUMAN__' },
  BACK_BUTTON,
];

// ---------------------------------------------------------------------------
// Helper – pick relevant replies for a given bot message
// ---------------------------------------------------------------------------

export function getRepliesForMessage(content: string): QuickReply[] {
  const lower = content.toLowerCase();
  const matched = CONTEXT_RULES.find(rule =>
    rule.keywords.some(kw => lower.includes(kw.toLowerCase()))
  );
  return matched ? matched.replies : DEFAULT_REPLIES;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ContextualQuickRepliesProps {
  /** The bot message content used to derive the reply buttons */
  messageContent: string;
  /** Called with the action text when a button is pressed */
  onSelect: (action: string) => void;
  /** When true, buttons are disabled (e.g. while bot is typing) */
  disabled?: boolean;
}

export const ContextualQuickReplies: React.FC<ContextualQuickRepliesProps> = ({
  messageContent,
  onSelect,
  disabled = false,
}) => {
  const [clickedAction, setClickedAction] = useState<string | null>(null);

  const replies = getRepliesForMessage(messageContent);

  const handleClick = (reply: QuickReply) => {
    if (disabled || clickedAction !== null) return;
    const action = reply.action ?? reply.label;
    setClickedAction(action);
    onSelect(action);
  };

  return (
    <div className="cqr-wrapper" aria-label="Quick reply options">
      {replies.map((reply) => {
        const action = reply.action ?? reply.label;
        const isClicked = clickedAction === action;
        const isAnyClicked = clickedAction !== null;

        return (
          <button
            key={reply.label}
            type="button"
            className={`cqr-pill ${isClicked ? 'cqr-pill--active' : ''} ${isAnyClicked && !isClicked ? 'cqr-pill--faded' : ''}`}
            onClick={() => handleClick(reply)}
            disabled={disabled || isAnyClicked}
            aria-pressed={isClicked}
          >
            {reply.label}
          </button>
        );
      })}
    </div>
  );
};
