
import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  formatMessageTime: (time: string) => string;
}

const MessageBubble = ({ message, formatMessageTime }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex",
        message.sender === 'staff' ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 rounded-2xl",
          message.sender === 'staff'
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted text-foreground rounded-tl-none"
        )}
      >
        {message.type === 'request' && (
          <div className="mb-1 text-xs font-medium">
            {message.requestType} Request
          </div>
        )}
        <div className="break-words">{message.text}</div>
        <div
          className={cn(
            "text-xs mt-1",
            message.sender === 'staff' ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatMessageTime(message.time)}
          {message.status && message.sender === 'staff' && (
            <span className="ml-2">{message.status}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
