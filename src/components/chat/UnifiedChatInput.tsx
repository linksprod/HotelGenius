import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, MessageSquare, Paperclip } from 'lucide-react';
import { VoiceMessageInput } from '@/components/voice/VoiceMessageInput';
import UserQuickTemplates from '@/components/messaging/UserQuickTemplates';

interface UnifiedChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  currentHandler: 'ai' | 'human';
  isTyping: boolean;
  userInfo?: {
    name: string;
    email?: string;
    roomNumber?: string;
  };
}

interface ConciergeMessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  isTyping: boolean;
}

const ConciergeMessageInput = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  inputRef,
  isTyping
}: ConciergeMessageInputProps) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (message: string) => {
    setInputMessage(message);
    setShowTemplates(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="border-t bg-muted/20 p-4 pb-6 flex-shrink-0 relative">
      <UserQuickTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 flex-shrink-0 text-muted-foreground hover:bg-muted"
          type="button"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 flex-shrink-0 text-muted-foreground hover:bg-muted font-bold"
          onClick={() => setShowTemplates(!showTemplates)}
          type="button"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message to concierge..."
          className="resize-none min-h-0 h-11 py-3 px-4 rounded-full border border-border/50 focus-visible:ring-1 bg-muted/40 text-sm"
          disabled={isTyping}
        />

        <Button
          type="button"
          size="icon"
          onClick={onSendMessage}
          className="rounded-full h-11 w-11 flex-shrink-0 bg-[#82A691] hover:bg-[#6D8E7B] text-white shadow-md transition-all active:scale-95"
          disabled={!inputMessage.trim() || isTyping}
        >
          <Send className="h-5 w-5 rotate-45 -translate-y-0.5 -translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
};

export const UnifiedChatInput: React.FC<UnifiedChatInputProps> = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  inputRef,
  currentHandler,
  isTyping,
  userInfo
}) => {
  const isAIHandling = currentHandler === 'ai';

  return (
    <div className="bg-card">
      {isAIHandling ? (
        <VoiceMessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={onSendMessage}
          inputRef={inputRef}
          userInfo={userInfo}
        />
      ) : (
        <ConciergeMessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={onSendMessage}
          inputRef={inputRef}
          isTyping={isTyping}
        />
      )}
    </div>
  );
};