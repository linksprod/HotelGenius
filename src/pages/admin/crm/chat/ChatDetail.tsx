
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Chat } from './types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { formatMessageTime, groupMessagesByDate } from './utils/messageUtils';

interface ChatDetailProps {
  chat: Chat | null;
  onBack: () => void;
  onSendReply: (chat: Chat, message: string) => Promise<{success: boolean, userName?: string}>;
}

const ChatDetail = ({ chat, onBack, onSendReply }: ChatDetailProps) => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const handleSendMessage = async (chat: Chat, message: string) => {
    if (!message.trim() || !chat) return { success: false };
    
    setIsSending(true);
    try {
      const result = await onSendReply(chat, message);
      if (result.success) {
        toast({
          title: "Message sent",
          description: `Your reply to ${result.userName || 'the guest'} has been sent.`,
        });
      } else {
        toast({
          title: "Error sending message",
          description: "There was a problem sending your message. Please try again.",
          variant: "destructive"
        });
      }
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "There was a problem sending your message.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsSending(false);
    }
  };
  
  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/50">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium text-muted-foreground">Select a conversation</h3>
          <p className="text-muted-foreground mt-2">Choose a conversation from the list to view messages</p>
        </div>
      </div>
    );
  }
  
  const messageGroups = groupMessagesByDate(chat.messages);
    
  return (
    <div className="flex flex-col h-full bg-muted/50">
      <ChatHeader chat={chat} onBack={onBack} />
      <MessageList 
        messageGroups={messageGroups} 
        formatMessageTime={formatMessageTime} 
      />
      <MessageInput 
        chat={chat} 
        onSendMessage={handleSendMessage} 
        isSending={isSending} 
      />
    </div>
  );
};

export default ChatDetail;
