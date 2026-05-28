
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Search, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chat } from './types';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chat: Chat, e: React.MouseEvent) => void;
  activeChat: Chat | null;
  loading: boolean;
  refreshChats: () => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
  filterChats: (tab: string) => Chat[];
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  onSelectChat,
  onDeleteChat,
  activeChat,
  loading,
  refreshChats,
  currentTab,
  onChangeTab,
  filterChats
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredBySearchChats = chats.filter(chat => {
    const name = chat.userInfo?.firstName
      ? `${chat.userInfo.firstName} ${chat.userInfo.lastName || ''}`
      : chat.userName;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.roomNumber && chat.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  
  const displayChats = searchQuery 
    ? filteredBySearchChats 
    : filterChats(currentTab);
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex justify-between">
          <Tabs value={currentTab} onValueChange={onChangeTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
              <TabsTrigger value="requests" className="flex-1">Requests</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon" onClick={refreshChats} disabled={loading}>
            <RotateCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {displayChats.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500 text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y">
            {displayChats.map((chat) => {
              const userInitials = chat.userInfo?.firstName 
                ? `${chat.userInfo.firstName.charAt(0)}${chat.userInfo.lastName ? chat.userInfo.lastName.charAt(0) : ''}`
                : chat.userName.slice(0, 2).toUpperCase();
              
              const displayName = chat.userInfo?.firstName
                ? `${chat.userInfo.firstName} ${chat.userInfo.lastName || ''}`
                : chat.userName;
              
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center p-3 gap-3 hover:bg-gray-100 cursor-pointer transition-colors",
                    activeChat?.id === chat.id && "bg-gray-100"
                  )}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.userInfo?.avatar} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {chat.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{displayName}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {chat.lastActivity}
                      </span>
                    </div>
                    
                    <div className="flex items-center mt-1">
                      {chat.roomNumber && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-md mr-2">
                          Room {chat.roomNumber}
                        </span>
                      )}
                      
                      {chat.type === 'request' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">
                          Request
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => onDeleteChat(chat, e)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatList;
