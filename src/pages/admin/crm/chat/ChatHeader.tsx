
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Chat } from './types';

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
}

const ChatHeader = ({ chat, onBack }: ChatHeaderProps) => {
  const userInitials = chat.userInfo?.firstName 
    ? `${chat.userInfo.firstName.charAt(0)}${chat.userInfo.lastName ? chat.userInfo.lastName.charAt(0) : ''}`
    : chat.userName.slice(0, 2).toUpperCase();
  
  const displayName = chat.userInfo?.firstName
    ? `${chat.userInfo.firstName} ${chat.userInfo.lastName || ''}`
    : chat.userName;

  return (
    <div className="flex items-center p-4 border-b bg-card">
      <Button 
        variant="ghost" 
        size="icon" 
        className="mr-2" 
        onClick={onBack}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Avatar className="h-9 w-9 mr-3">
        <AvatarImage src={chat.userInfo?.avatar} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{displayName}</div>
        <div className="text-xs text-muted-foreground">
          {chat.roomNumber && `Room ${chat.roomNumber}`}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
