import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { 
  Bot, 
  User, 
  Clock,
  Hotel,
  Utensils,
  Compass,
  Sparkles,
  Car,
  ClipboardList,
  Info,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '@/types/chat';
import { ChatActionRenderer } from './ChatActionRenderer';
import { QuickOptionsList } from './QuickOptionsList';
import {
  ContextualQuickReplies,
  BACK_TO_MENU_ACTION,
} from './ContextualQuickReplies';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const detectTextLanguage = (text: string): 'en' | 'fr' => {
  if (!text) return 'en';
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("j'ai ouvert") ||
    lowerText.includes("je suis là") ||
    lowerText.includes("veuillez") ||
    lowerText.includes("pour vous") ||
    lowerText.includes("ménage") ||
    lowerText.includes("menage")
  ) {
    return 'fr';
  }
  return 'en';
};

/** Regex to clean all emojis from a string */
const removeEmojis = (text: string): string => {
  return text.replace(
    /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g,
    ''
  ).trim();
};

/** Get matching outline icon for a bot message section header */
const getSectionIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('hotel info') || lower.includes('resort info') || lower.includes('accommodation')) {
    return <Hotel className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  if (lower.includes('dining') || lower.includes('restaurant') || lower.includes('bar') || lower.includes('food')) {
    return <Utensils className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  if (lower.includes('activit') || lower.includes('experienc') || lower.includes('tour') || lower.includes('beach')) {
    return <Compass className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  if (lower.includes('spa') || lower.includes('wellness') || lower.includes('massage')) {
    return <Sparkles className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  if (lower.includes('transport') || lower.includes('parking') || lower.includes('transfer') || lower.includes('car')) {
    return <Car className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  if (lower.includes('request') || lower.includes('housekeeping') || lower.includes('maintenance') || lower.includes('service')) {
    return <ClipboardList className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  if (lower.includes('event') || lower.includes('animation') || lower.includes('show')) {
    return <Calendar className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  if (lower.includes('help') || lower.includes('assist') || lower.includes('info')) {
    return <Info className="inline-block mr-1.5 h-4 w-4 text-[#82A691] -translate-y-0.5" strokeWidth={2} />;
  }
  return null;
};

/**
 * Parsers raw markdown-like characters (like **bold** and - list items)
 * into semantic, styled React nodes, strips emojis, and adds outline icons.
 */
const renderFormattedMessage = (text: string, isSelf: boolean) => {
  if (!text) return null;

  // Clean DSML markers
  const cleanText = text.replace(/<[^>]*?DSML[\s\S]*?\/[^>]*?DSML[^>]*?>/gi, '').trim();
  const lines = cleanText.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        // Detect bullet list item
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const displayLine = isBullet ? line.trim().substring(2) : line;

        // Parse **bold** parts
        const parts = displayLine.split('**');
        const parsedElements = parts.map((part, partIdx) => {
          if (partIdx % 2 === 1) {
            // Remove raw emojis in bold titles
            const cleanTitle = removeEmojis(part);
            const icon = !isSelf ? getSectionIcon(cleanTitle) : null;

            return (
              <strong 
                key={partIdx} 
                className={`font-black ${isSelf ? 'text-white' : 'text-white font-bold inline-flex items-center'}`}
              >
                {icon}
                {cleanTitle}
              </strong>
            );
          }
          // Remove raw emojis in standard body text
          return removeEmojis(part);
        });

        if (isBullet) {
          return (
            <span key={lineIdx} className="flex items-start gap-2 pl-1.5 my-1 text-[14px]">
              <span className={`mt-1.5 flex-shrink-0 font-bold ${isSelf ? 'text-white' : 'text-[#82A691]'}`}>•</span>
              <span className="leading-relaxed tracking-[0.01em]">{parsedElements}</span>
            </span>
          );
        }

        return (
          <div key={lineIdx} className="min-h-[1.25rem] text-[14px] leading-relaxed tracking-[0.01em]">
            {parsedElements}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Sentinel – clicking "Talk to a human" emits this action */
export const ESCALATE_TO_HUMAN_ACTION = '__ESCALATE_TO_HUMAN__';

interface UnifiedMessagesListProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  currentUser: {
    name: string;
    email?: string;
    roomNumber?: string;
  };
  isAdmin?: boolean;
  hotelId?: string | null;
  /** Called when a QuickOptionsList card or quick-reply pill is clicked */
  onQuickOptionSelect?: (text: string) => void;
  /** Called to switch the active chat type (e.g. to 'concierge') */
  onSwitchChatType?: (type: 'concierge' | 'safety_ai') => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const UnifiedMessagesList: React.FC<UnifiedMessagesListProps> = ({
  messages,
  isTyping,
  messagesEndRef,
  currentUser,
  isAdmin = false,
  hotelId,
  onQuickOptionSelect,
  onSwitchChatType,
}) => {
  const { t } = useTranslation();

  /**
   * Track whether the main QuickOptionsList has been explicitly re-requested
   * via the "Main Menu" sentinel action.  We reset it whenever a new guest
   * message arrives so it can be re-shown again if the user cycles back.
   */
  const [showMainMenuOverride, setShowMainMenuOverride] = useState(false);

  /**
   * When true, show the "Connect to Hotel Team" escalation card
   * under the last bot message instead of the contextual pills.
   */
  const [showEscalateCard, setShowEscalateCard] = useState(false);

  const formatTime = (dateString: string) =>
    format(new Date(dateString), 'HH:mm');

  const getMessageAlignment = (senderType: string) => {
    if (isAdmin) return senderType === 'staff' ? 'justify-end' : 'justify-start';
    return senderType === 'guest' ? 'justify-end' : 'justify-start';
  };

  const isCurrentUser = (senderType: string) => {
    if (isAdmin) return senderType === 'staff';
    return senderType === 'guest';
  };

  const getMessageStyle = (senderType: string) =>
    isCurrentUser(senderType)
      ? 'bg-[#82A691] text-white shadow-sm'
      : 'bg-muted/50 text-foreground shadow-sm';

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'ai':    return <Bot className="h-4 w-4" />;
      case 'staff': return <User className="h-4 w-4" />;
      case 'guest': return <User className="h-4 w-4" />;
      default:      return <User className="h-4 w-4" />;
    }
  };

  const getSenderName = (message: Message) => {
    if (message.sender_type === 'ai')    return t('chat.messagesList.aiAssistant');
    if (message.sender_type === 'staff') return t('chat.messagesList.staff');
    return message.sender_name || t('chat.messagesList.guest');
  };

  // ------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------

  const guestHasReplied = messages.some(m => m.sender_type === 'guest');
  const lastAiMessageIndex = messages.reduce(
    (last, m, idx) => (m.sender_type === 'ai' || m.sender_type === 'staff' ? idx : last),
    -1
  );

  /**
   * The initial main-menu is shown after the very first AI message
   * as long as the guest hasn't typed anything yet.
   */
  const showInitialMainMenu =
    !isAdmin &&
    !guestHasReplied &&
    messages.length >= 1 &&
    messages[0].sender_type === 'ai' &&
    typeof onQuickOptionSelect === 'function';

  /**
   * The override main-menu is shown when the user pressed "Main Menu"
   * from a contextual pill and we're currently at the last AI message.
   */
  const showOverrideMainMenu =
    !isAdmin &&
    showMainMenuOverride &&
    !isTyping &&
    typeof onQuickOptionSelect === 'function';

  /**
   * Contextual quick replies appear under the LAST bot message,
   * but only when the bot isn't currently typing and after the guest
   * has already sent at least one message.
   */
  const showContextualReplies =
    !isAdmin &&
    guestHasReplied &&
    !showMainMenuOverride &&
    !isTyping &&
    lastAiMessageIndex >= 0 &&
    typeof onQuickOptionSelect === 'function';

  // ------------------------------------------------------------------
  // Event handler
  // ------------------------------------------------------------------

  const handleQuickReply = (action: string) => {
    if (!onQuickOptionSelect) return;

    if (action === BACK_TO_MENU_ACTION) {
      // Don't send a message — just toggle the main menu UI
      setShowMainMenuOverride(true);
      setShowEscalateCard(false);
      return;
    }

    // Detect "Talk to a human" intent from both pill buttons and manual text
    if (
      action === ESCALATE_TO_HUMAN_ACTION ||
      action.toLowerCase().includes('speak with a staff') ||
      action.toLowerCase().includes('talk to a human') ||
      action.toLowerCase().includes('speak with staff') ||
      action.toLowerCase().includes('human assistance') ||
      action.toLowerCase().includes('connect me to a human')
    ) {
      setShowEscalateCard(true);
      setShowMainMenuOverride(false);
      return;
    }

    // Reset escalation card on any real navigation action
    setShowEscalateCard(false);

    // Any real action: reset override so contextual pills come back later
    setShowMainMenuOverride(false);
    onQuickOptionSelect(action);
  };

  // Reset override whenever a new guest message appears
  React.useEffect(() => {
    if (guestHasReplied) {
      // Only clear the override when a new guest message is the very last one
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.sender_type === 'guest') {
        setShowMainMenuOverride(false);
      }
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 sm:space-y-6 bg-background scroll-smooth">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('chat.messagesList.startConversation')}</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isLastBotMessage = index === lastAiMessageIndex;

          return (
            <React.Fragment key={message.id}>
              {/* ── Message bubble ── */}
              <div className={`flex ${getMessageAlignment(message.sender_type)}`}>
                <div
                  className={`flex ${
                    isCurrentUser(message.sender_type)
                      ? 'flex-row-reverse space-x-reverse'
                      : 'flex-row'
                  } items-end space-x-3 max-w-[85%]`}
                >
                  <Avatar className="h-7 w-7 flex-shrink-0 mb-6">
                    <AvatarFallback
                      className={`text-[10px] ${
                        message.sender_type === 'ai'
                          ? 'bg-primary/5 text-primary'
                          : message.sender_type === 'staff'
                          ? 'bg-accent/5 text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {getSenderIcon(message.sender_type)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col w-full">
                    <div className={`rounded-xl px-4 py-2.5 ${getMessageStyle(message.sender_type)}`}>
                      {message.message_type === 'system' && (
                        <div className="text-[10px] opacity-75 mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t('chat.messagesList.systemMessage')}
                        </div>
                      )}
                      {renderFormattedMessage(message.content, isCurrentUser(message.sender_type))}
                    </div>

                    {message.message_type === 'action' && message.metadata && (
                      <ChatActionRenderer
                        type={message.metadata.action_type || 'booking_form'}
                        metadata={message.metadata}
                        hotelId={hotelId}
                        language={detectTextLanguage(message.content)}
                      />
                    )}

                    <div
                      className={`flex items-center gap-2 mt-1.5 px-1 ${
                        isCurrentUser(message.sender_type) ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground font-bold tracking-tight">
                        {getSenderName(message)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-medium">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Initial main menu (shown only after the very first bot message) ── */}
              {showInitialMainMenu && index === 0 && (
                <QuickOptionsList onSelect={handleQuickReply} />
              )}

              {/* ── Override main menu (user pressed "Main Menu" from a contextual pill) ── */}
              {showOverrideMainMenu && isLastBotMessage && (
                <QuickOptionsList onSelect={handleQuickReply} />
              )}

              {/* ── Escalation card: Connect to Hotel Team ── */}
              {showEscalateCard && isLastBotMessage && !showMainMenuOverride && (
                <div className="quick-options-wrapper">
                  <div className="quick-options-container" style={{ gap: 0 }}>
                    {/* Transition message */}
                    <div className="px-4 py-3 text-[13px] text-muted-foreground leading-relaxed">
                      I'll connect you with our Hotel Team right away.
                    </div>
                    <div className="quick-option-separator" />
                    {/* Connect button card */}
                    <button
                      type="button"
                      className="quick-option-card"
                      onClick={() => onSwitchChatType?.('concierge')}
                      aria-label="Connect to Hotel Team"
                    >
                      <div className="quick-option-icon-container">
                        <Users className="quick-option-lucide-icon" size={20} strokeWidth={1.75} />
                      </div>
                      <div className="quick-option-text">
                        <span className="quick-option-title">Connect to Hotel Team</span>
                        <span className="quick-option-description">Our staff will assist you directly</span>
                      </div>
                      <svg
                        className="quick-option-chevron"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Contextual quick replies (shown under the last bot message, not when escalating) ── */}
              {showContextualReplies && isLastBotMessage && !showEscalateCard && (
                <ContextualQuickReplies
                  messageContent={message.content}
                  onSelect={handleQuickReply}
                  disabled={isTyping}
                />
              )}
            </React.Fragment>
          );
        })
      )}

      {/* ── Bot typing indicator ── */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="flex items-end space-x-2 max-w-[80%]">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <div className="rounded-lg px-3 py-2 bg-muted">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('chat.messagesList.aiTyping')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};