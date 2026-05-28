
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Chat } from '@/components/admin/chat/types';

interface ChatMessagesHeaderProps {
  activeChat: Chat | null;
  handleRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

const ChatMessagesHeader = ({
  activeChat,
  handleRefresh,
  isRefreshing
}: ChatMessagesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">Messages</h1>
      {!activeChat && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
    </div>
  );
};

export default ChatMessagesHeader;
