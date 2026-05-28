import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ChatList from '@/components/admin/chat/ChatList';
import ChatDetail from '@/components/admin/chat/ChatDetail';
import DeleteChatDialog from '@/components/admin/chat/DeleteChatDialog';
import ChatMessagesHeader from '@/components/admin/chat/ChatMessagesHeader';
import { Chat } from '@/components/admin/chat/types';

interface ChatMessagesContainerProps {
  chats: Chat[];
  activeChat: Chat | null;
  loading: boolean;
  getFilteredChats: (tab: string) => Chat[];
  fetchChats: () => Promise<void>;
  currentTab: string;
  setCurrentTab: (value: string) => void;
  handleSelectChat: (chat: Chat) => void;
  handleDeleteChat: (chat: Chat, e: React.MouseEvent) => void;
  sendReply: (chat: Chat, message: string) => Promise<{success: boolean, userName?: string}>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  chatToDelete: Chat | null;
  confirmDelete: () => Promise<void>;
}

const ChatMessagesContainer = ({
  chats,
  activeChat,
  loading,
  getFilteredChats,
  fetchChats,
  currentTab,
  setCurrentTab,
  handleSelectChat,
  handleDeleteChat,
  sendReply,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  chatToDelete,
  confirmDelete
}: ChatMessagesContainerProps) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleSendReply = async (chat: Chat, message: string) => {
    if (!message.trim() || !chat) {
      return { success: false };
    }
    
    const result = await sendReply(chat, message);
    
    if (result.success) {
      setReplyMessage('');
      toast({
        title: "Message sent",
        description: "Your reply has been sent to " + result.userName,
      });
    } else {
      toast({
        title: "Error sending message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const handleBackToList = () => {
    handleSelectChat(null as unknown as Chat);
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchChats();
      toast({
        title: "Data refreshed",
        description: "The messages have been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Error refreshing data",
        description: "There was a problem refreshing the data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <ChatMessagesHeader 
        activeChat={activeChat}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      {!activeChat ? (
        <ChatList
          chats={chats}
          loading={loading}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          activeChat={activeChat}
          refreshChats={handleRefresh}
          currentTab={currentTab}
          onChangeTab={handleTabChange}
          filterChats={getFilteredChats}
        />
      ) : (
        <ChatDetail
          chat={activeChat}
          onBack={handleBackToList}
          onSendReply={handleSendReply}
        />
      )}

      <DeleteChatDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        chatToDelete={chatToDelete}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default ChatMessagesContainer;
