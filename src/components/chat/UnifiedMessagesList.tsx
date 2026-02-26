import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '@/types/chat';

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
}

export const UnifiedMessagesList: React.FC<UnifiedMessagesListProps> = ({
  messages,
  isTyping,
  messagesEndRef,
  currentUser,
  isAdmin = false
}) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const getMessageAlignment = (senderType: string) => {
    if (isAdmin) {
      return senderType === 'staff' ? 'justify-end' : 'justify-start';
    }
    return senderType === 'guest' ? 'justify-end' : 'justify-start';
  };

  const isCurrentUser = (senderType: string) => {
    if (isAdmin) return senderType === 'staff';
    return senderType === 'guest';
  };

  const getMessageStyle = (senderType: string) => {
    if (isCurrentUser(senderType)) {
      return 'bg-[#82A691] text-white shadow-sm';
    }
    return 'bg-muted/50 text-foreground shadow-sm';
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'staff':
        return <User className="h-4 w-4" />;
      case 'guest':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getSenderName = (message: Message) => {
    if (message.sender_type === 'ai') return 'AI Assistant';
    if (message.sender_type === 'staff') return 'Staff';
    return message.sender_name || 'Guest';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-background">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start a conversation with our AI assistant!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={`flex ${getMessageAlignment(message.sender_type)}`}>
            <div className={`flex ${isCurrentUser(message.sender_type) ? 'flex-row-reverse space-x-reverse' : 'flex-row'} items-end space-x-3 max-w-[85%]`}>
              <Avatar className="h-7 w-7 flex-shrink-0 mb-6">
                <AvatarFallback className={`text-[10px] ${message.sender_type === 'ai' ? 'bg-primary/5 text-primary' :
                  message.sender_type === 'staff' ? 'bg-accent/5 text-accent-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                  {getSenderIcon(message.sender_type)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <div className={`rounded-xl px-4 py-2.5 ${getMessageStyle(message.sender_type)}`}>
                  {message.message_type === 'system' && (
                    <div className="text-[10px] opacity-75 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      System Message
                    </div>
                  )}
                  <p className="text-[14px] leading-relaxed tracking-[0.01em] whitespace-pre-wrap">{message.content}</p>
                </div>

                <div className={`flex items-center gap-2 mt-1.5 px-1 ${isCurrentUser(message.sender_type) ? 'justify-end' : 'justify-start'}`}>
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
        ))
      )}

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
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">AI Assistant is typing...</div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};