
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'lastSeenMessagesAt';

export const useMessageBadge = () => {
  const location = useLocation();
  const isMessagesPage = location.pathname.includes('/messages');

  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || new Date(0).toISOString();
  });

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    try {
      if (isMessagesPage) {
        setUnreadCount(0);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnreadCount(0);
        return;
      }

      // Get conversations for this user
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('guest_id', user.id);

      if (convError || !conversations?.length) {
        setUnreadCount(0);
        return;
      }

      // Count messages from staff/AI after lastSeenAt
      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversations.map(c => c.id))
        .in('sender_type', ['staff', 'ai'])
        .gt('created_at', lastSeenAt);

      if (countError) {
        console.error('Error counting unread messages:', countError);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [lastSeenAt, isMessagesPage]);

  // Mark messages as seen
  const markAsSeen = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, now);
    setLastSeenAt(now);
    setUnreadCount(0);
    window.dispatchEvent(new Event('messages-seen'));
  }, []);

  // Listen to messages-seen events from other instances
  useEffect(() => {
    const handleSeen = () => {
      const now = localStorage.getItem(STORAGE_KEY) || new Date(0).toISOString();
      setLastSeenAt(now);
      setUnreadCount(0);
    };

    window.addEventListener('messages-seen', handleSeen);
    return () => {
      window.removeEventListener('messages-seen', handleSeen);
    };
  }, []);

  // Automatically mark as seen when page becomes messages page
  useEffect(() => {
    if (isMessagesPage) {
      markAsSeen();
    }
  }, [isMessagesPage, markAsSeen]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    if (!isMessagesPage) {
      fetchUnreadCount();
    }

    // Subscribe to new messages
    const channel = supabase
      .channel('message-badge-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as { sender_type: string; created_at: string };
        // Only increment if message is from staff/AI and after our lastSeenAt
        if ((newMessage.sender_type === 'staff' || newMessage.sender_type === 'ai') && 
            newMessage.created_at > lastSeenAt) {
          if (isMessagesPage) {
            markAsSeen();
          } else {
            setUnreadCount(prev => prev + 1);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadCount, lastSeenAt, isMessagesPage, markAsSeen]);

  return { unreadCount: isMessagesPage ? 0 : unreadCount, markAsSeen, refetch: fetchUnreadCount };
};
