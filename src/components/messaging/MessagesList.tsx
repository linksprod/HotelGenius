
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/types/messaging';
import AIMessageRenderer from './AIMessageRenderer';

interface MessagesListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuickAction?: (action: string, data?: any) => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, messagesEndRef, onQuickAction }) => {
  const formatTime = (timeString: string) => {
    if (!isNaN(Date.parse(timeString))) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timeString;
  };

  return (
    <ScrollArea className="flex-1 px-4 py-2 md:px-2">
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={cn(
                "flex", 
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === 'user' ? (
                <div 
                  className="max-w-[80%] px-4 py-2 rounded-2xl mb-1 bg-primary text-primary-foreground rounded-tr-none"
                >
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-primary-foreground/80">
                    <span className="text-[10px]">
                      {formatTime(message.time)}
                    </span>
                    {message.status && (
                      <span className="text-[10px] ml-1">
                        {message.status === 'read' && '✓✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'sent' && '✓'}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%] space-y-2">
                  <AIMessageRenderer 
                    message={message.text} 
                    onQuickAction={onQuickAction}
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(message.time)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
