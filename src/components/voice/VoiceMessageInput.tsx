import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, MessageSquare, Paperclip, MicOff } from 'lucide-react';
import { VoiceInterface } from './VoiceInterface';
import UserQuickTemplates from '@/components/messaging/UserQuickTemplates';

interface VoiceMessageInputProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  onSendMessage: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  userInfo?: {
    name: string;
    email?: string;
    roomNumber?: string;
  };
}

export const VoiceMessageInput: React.FC<VoiceMessageInputProps> = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  inputRef,
  userInfo
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [aiTranscript, setAiTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTemplateSelect = (message: string) => {
    setInputMessage(message);
    setShowTemplates(false);
  };

  const handleTranscriptUpdate = (transcript: string, isPartial: boolean) => {
    if (isPartial) {
      setAiTranscript(prev => prev + transcript);
    } else {
      if (transcript) {
        setInputMessage(transcript);
        setIsVoiceMode(false);
      }
      setAiTranscript('');
    }
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  return (
    <div className="border-t bg-card p-3 sm:p-4 flex-shrink-0 relative">
      <UserQuickTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      {isVoiceMode ? (
        <VoiceInterface
          userInfo={userInfo}
          onTranscriptUpdate={handleTranscriptUpdate}
          onSpeakingChange={handleSpeakingChange}
        />
      ) : (
        <>
          {aiTranscript && (
            <div className="mb-3 p-2 bg-primary/10 rounded-md">
              <p className="text-sm font-medium mb-1">AI Response:</p>
              <p className="text-sm">{aiTranscript}</p>
            </div>
          )}

          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0 mb-0.5"
              type="button"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0 mb-0.5"
              onClick={() => setShowTemplates(!showTemplates)}
              type="button"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-10 w-10 flex-shrink-0 mb-0.5 ${isSpeaking ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              type="button"
            >
              {isSpeaking ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Type or speak your message..."
              className="resize-none min-h-[40px] max-h-32 py-2.5 px-4 rounded-2xl border border-border/50 focus-visible:ring-1 bg-muted/50 text-[15px] leading-tight flex-1"
            />

            <Button
              type="button"
              size="icon"
              onClick={onSendMessage}
              className="rounded-full h-10 w-10 flex-shrink-0 mb-0.5 bg-[#82A691] hover:bg-[#6D8E7B] text-white shadow-md transition-all active:scale-95"
              disabled={!inputMessage.trim()}
            >
              <Send className="h-5 w-5 rotate-45 -translate-y-0.5 -translate-x-0.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};