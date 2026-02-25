import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/types/chat';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onClick,
  unreadCount = 0
}) => {
  const initials = conversation.guest_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100",
        isSelected
          ? "bg-slate-50"
          : ""
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold ring-1 ring-slate-200">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-bold text-[13px] text-slate-700 truncate">{conversation.guest_name}</span>
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            {unreadCount > 0 && (
              <span className="min-w-[17px] h-[17px] rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: false })
                .replace('about ', '')
                .replace('less than a minute', 'now')}
            </span>
          </div>
        </div>
        {conversation.room_number && (
          <p className="text-xs text-muted-foreground truncate">Room {conversation.room_number}</p>
        )}
      </div>
    </div>
  );
};
