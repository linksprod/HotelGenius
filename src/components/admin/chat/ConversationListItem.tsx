import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Bot, User, ShieldCheck } from 'lucide-react';
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
  const isAI = conversation.current_handler === 'ai';
  const isEscalated = conversation.status === 'escalated';
  const isVIP = conversation.guest_name.includes('Sofia') || conversation.guest_name.includes('Moreau'); // Mock VIP for demo

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 p-5 cursor-pointer transition-all duration-300 border-b border-border dark:border-white/[0.03]",
        isSelected
          ? "bg-zinc-100/80 dark:bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          : "hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
      )}
      onClick={onClick}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
      )}

      {/* Top Row: Avatar + Name + Time */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-105",
            isSelected ? "bg-rose-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
          )}>
            {conversation.guest_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] rounded-full bg-rose-500 border-2 border-background text-[10px] font-black text-white flex items-center justify-center px-1 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className={cn(
              "text-[15px] font-bold leading-none truncate",
              isSelected ? "text-rose-600 dark:text-white" : "text-foreground group-hover:text-rose-600 dark:group-hover:text-white"
            )}>
              {conversation.guest_name}
            </h4>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: false })
                .replace('about ', '')
                .replace('less than a minute', 'now')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isVIP && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-tighter">
                <ShieldCheck className="h-2.5 w-2.5" />
                VIP
              </div>
            )}
            <p className="text-xs text-muted-foreground truncate font-medium">
              {conversation.room_number ? `Room ${conversation.room_number}` : 'No room assigned'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Last Message (Mocked if empty) + Handler */}
      <div className="flex items-center justify-between gap-4 mt-1">
        <p className={cn(
          "text-xs truncate flex-1 leading-relaxed",
          isSelected ? "text-muted-foreground dark:text-zinc-300" : "text-muted-foreground group-hover:text-foreground dark:group-hover:text-zinc-300"
        )}>
          {isEscalated ? "Escalated for human intervention..." : "Last activity logged in memory..."}
        </p>
        
        <div className={cn(
          "shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
          isAI ? "bg-rose-500/10 text-rose-500 border border-rose-500/10" : "bg-blue-500/10 text-blue-500 border border-blue-500/10"
        )}>
          {isAI ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
          {isAI ? 'AI' : 'Staff'}
        </div>
      </div>
    </div>
  );
};
