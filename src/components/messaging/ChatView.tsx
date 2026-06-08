
import React from 'react';
import { Contact } from '@/types/messaging';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';

interface ChatViewProps {
  contact: Contact;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  onSendMessage: () => void;
  onGoBack: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuickAction?: (action: string, data?: any) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  contact,
  inputMessage,
  setInputMessage,
  onSendMessage,
  onGoBack,
  messagesEndRef,
  inputRef,
  onQuickAction
}) => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col h-screen w-screen">
      <ChatHeader contact={contact} onGoBack={onGoBack} />
      <MessagesList 
        messages={contact.messages} 
        messagesEndRef={messagesEndRef} 
        onQuickAction={onQuickAction}
      />
      <MessageInput 
        inputMessage={inputMessage} 
        setInputMessage={setInputMessage} 
        onSendMessage={onSendMessage} 
        inputRef={inputRef} 
      />
    </div>
  );
};
