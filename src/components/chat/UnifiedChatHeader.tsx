import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Phone, ArrowLeft } from 'lucide-react';
import type { Conversation } from '@/types/chat';

interface UnifiedChatHeaderProps {
  conversation: Conversation | null;
  currentHandler: 'ai' | 'human';
  isAdmin?: boolean;
  onEscalateToHuman?: () => void;
  onTakeOver?: (conversationId: string) => void;
  onGoBack?: () => void;
}

export const UnifiedChatHeader: React.FC<UnifiedChatHeaderProps> = ({
  conversation,
  currentHandler,
  isAdmin = false,
  onEscalateToHuman,
  onTakeOver,
  onGoBack
}) => {
  const isAIHandling = currentHandler === 'ai';
  const canEscalate = !isAdmin && isAIHandling && onEscalateToHuman;
  const canTakeOver = isAdmin && isAIHandling && conversation && onTakeOver;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center space-x-3">
        {onGoBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onGoBack}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Avatar className="h-10 w-10">
          <AvatarFallback className={`${isAIHandling ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'}`}>
            {isAIHandling ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="font-semibold text-sm">
            {isAIHandling ? 'AI Assistant' : 'Concierge'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAIHandling ? '24/7 Available' : 'Live Support'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {canEscalate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEscalateToHuman}
            className="gap-2"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Talk to Human</span>
          </Button>
        )}

        {canTakeOver && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTakeOver(conversation.id)}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Take Over</span>
          </Button>
        )}

        {!isAdmin && (
          <div className="text-xs text-muted-foreground">
            {conversation?.room_number && `Room ${conversation.room_number}`}
          </div>
        )}
      </div>
    </div>
  );
};