
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageGroup from './MessageGroup';
import { Message } from './types';

interface MessageListProps {
  messageGroups: { date: string; messages: Message[] }[];
  formatMessageTime: (time: string) => string;
}

const MessageList = ({ messageGroups, formatMessageTime }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messageGroups]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-6">
        {messageGroups.map((group, groupIndex) => (
          <MessageGroup
            key={groupIndex}
            date={group.date}
            messages={group.messages}
            formatMessageTime={formatMessageTime}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
