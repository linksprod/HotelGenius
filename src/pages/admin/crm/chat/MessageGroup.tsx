
import React from 'react';
import MessageBubble from './MessageBubble';
import { Message } from './types';

interface MessageGroupProps {
  date: string;
  messages: Message[];
  formatMessageTime: (time: string) => string;
}

const MessageGroup = ({ date, messages, formatMessageTime }: MessageGroupProps) => {
  return (
    <div className="space-y-4">
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground">{date}</span>
        <div className="flex-grow border-t border-border"></div>
      </div>
      
      {messages.map((msg, index) => (
        <MessageBubble 
          key={`${msg.id}-${index}`}
          message={msg} 
          formatMessageTime={formatMessageTime} 
        />
      ))}
    </div>
  );
};

export default MessageGroup;
