
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  handleMessageSubmit: (e: React.FormEvent) => void;
}

const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleMessageSubmit
}: MessageInputProps) => {
  return (
    <div className="border-t p-4 bg-background">
      <form onSubmit={handleMessageSubmit} className="flex items-center gap-2 w-full">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="resize-none min-h-0 h-10 py-2 rounded-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-full"
          disabled={!inputMessage.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
