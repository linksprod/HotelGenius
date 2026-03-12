import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message, ChatState } from '@/types/chat';

interface UseUnifiedChatProps {
  userInfo?: {
    name: string;
    email?: string;
    roomNumber?: string;
  };
  isAdmin?: boolean;
  conversationType?: 'concierge' | 'safety_ai';
  conversationId?: string; // Load specific conversation by ID (for admin)
  hotelId?: string; // Tenant scope for conversation creation
}

export const useUnifiedChat = ({
  userInfo,
  isAdmin = false,
  conversationType = 'concierge',
  conversationId,
  hotelId
}: UseUnifiedChatProps) => {
  const [chatState, setChatState] = useState<ChatState>({
    conversation: null,
    messages: [],
    isLoading: true,
    isTyping: false,
    currentHandler: 'ai'
  });

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize or load conversation
  useEffect(() => {
    const loadConversationById = async (id: string) => {
      try {
        setChatState(prev => ({ ...prev, isLoading: true }));

        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', id)
          .single();

        if (convError) throw convError;

        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        setChatState({
          conversation,
          messages: messages || [],
          isLoading: false,
          isTyping: false,
          currentHandler: conversation.current_handler
        });
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation.",
          variant: "destructive"
        });
        setChatState(prev => ({ ...prev, isLoading: false }));
      }
    };

    const initializeConversation = async () => {
      try {
        setChatState(prev => ({ ...prev, isLoading: true }));

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('guest_id', user.user.id)
          .eq('conversation_type', conversationType)
          .in('status', ['active', 'escalated'])
          .maybeSingle();

        let conversation = existingConversation;

        // Self-healing: if conversation exists but has no hotel_id, assign it now
        if (conversation && !conversation.hotel_id && hotelId) {
          console.log(`[useUnifiedChat] Self-healing: Assigning hotel_id ${hotelId} to conversation ${conversation.id}`);
          const { data: updatedConv } = await (supabase
            .from('conversations')
            .update({ hotel_id: hotelId } as any) as any)
            .eq('id', conversation.id)
            .select()
            .single();

          if (updatedConv) conversation = updatedConv;
        }

        if (!conversation) {
          const { data: newConversation, error } = await supabase
            .from('conversations')
            .insert({
              guest_id: user.user.id,
              guest_name: userInfo?.name || 'Guest',
              guest_email: userInfo?.email || user.user.email,
              room_number: userInfo?.roomNumber,
              status: 'active',
              current_handler: conversationType === 'concierge' ? 'human' : 'ai',
              conversation_type: conversationType,
              hotel_id: hotelId ?? null // Always set hotel_id; trigger resolves from guests table if null
            } as any)
            .select()
            .single() as any;

          if (error) throw error;
          conversation = newConversation;

          const welcomeMessage = conversationType === 'safety_ai'
            ? `Hello ${userInfo?.name || 'there'}! I'm your AI Assistant. I can help with bookings, hotel information, and much more. If you need human assistance, I can connect you to our staff. How can I help you today?`
            : `Hello ${userInfo?.name || 'there'}! Welcome to our Hotel Team chat. Our staff will assist you directly with any questions or requests you may have.`;

          await supabase
            .from('messages')
            .insert({
              conversation_id: conversation.id,
              sender_type: conversationType === 'concierge' ? 'staff' : 'ai',
              sender_name: conversationType === 'safety_ai' ? 'AI Assistant' : 'Hotel Team',
              content: welcomeMessage,
              message_type: 'text'
            });
        }

        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        setChatState({
          conversation,
          messages: messages || [],
          isLoading: false,
          isTyping: false,
          currentHandler: conversation.current_handler
        });

      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again.",
          variant: "destructive"
        });
      }
    };

    if (conversationId) {
      loadConversationById(conversationId);
    } else if (userInfo?.name) {
      initializeConversation();
    }
  }, [conversationId, userInfo?.name, userInfo?.email, userInfo?.roomNumber, conversationType, toast]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!chatState.conversation?.id) return;

    const channel = supabase
      .channel(`conversation-${chatState.conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chatState.conversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setChatState(prev => {
            if (prev.messages.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
              isTyping: false
            };
          });
          scrollToBottom();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${chatState.conversation.id}`
        },
        (payload) => {
          const updatedConversation = payload.new as Conversation;
          setChatState(prev => ({
            ...prev,
            conversation: updatedConversation,
            currentHandler: updatedConversation.current_handler
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatState.conversation?.id]);

  // Polling fallback with exponential backoff
  useEffect(() => {
    if (!chatState.conversation?.id) return;

    let pollInterval = 3000;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastMessageTime = chatState.messages.length > 0
      ? chatState.messages[chatState.messages.length - 1].created_at
      : '1970-01-01';

    const poll = async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', chatState.conversation!.id)
          .gt('created_at', lastMessageTime)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, ...data.filter(
              msg => !prev.messages.some(existing => existing.id === msg.id)
            )],
            isTyping: false
          }));
          lastMessageTime = data[data.length - 1].created_at;
          pollInterval = 3000;
        } else {
          pollInterval = Math.min(pollInterval * 1.5, 15000);
        }
      } catch (error) {
        console.error('Polling error:', error);
        pollInterval = Math.min(pollInterval * 1.5, 15000);
      } finally {
        timeoutId = setTimeout(poll, pollInterval);
      }
    };

    timeoutId = setTimeout(poll, pollInterval);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [chatState.conversation?.id]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Listen for client-side form triggers (from ChatActionRenderer)
  useEffect(() => {
    const handleTriggerForm = async (event: any) => {
      const { type, id } = event.detail;
      if (!chatState.conversation?.id) return;

      console.log(`[useUnifiedChat] Triggering form for ${type} ${id}`);

      try {
        await supabase
          .from('messages')
          .insert({
            conversation_id: chatState.conversation.id,
            sender_type: 'ai',
            sender_name: 'AI Assistant',
            content: `I've opened the booking form for you.`,
            message_type: 'action',
            metadata: {
              action_type: 'booking_form',
              entity_type: type,
              entity_id: id
            }
          });
      } catch (error) {
        console.error('Error triggering form from client:', error);
      }
    };

    window.addEventListener('ai_trigger_form', handleTriggerForm);
    return () => window.removeEventListener('ai_trigger_form', handleTriggerForm);
  }, [chatState.conversation?.id]);

  // Listen for reservation submissions to show pending state
  useEffect(() => {
    const handleReservationSubmitted = async (event: any) => {
      if (!chatState.conversation?.id) return;

      const { restaurantName, entityName, date, time, guests, entityType } = event.detail;
      const displayName = entityName || restaurantName || 'your request';

      try {
        await supabase
          .from('messages')
          .insert({
            conversation_id: chatState.conversation.id,
            sender_type: 'ai',
            sender_name: 'AI Assistant',
            content: `Your reservation request for ${displayName} has been received.`,
            message_type: 'action',
            metadata: {
              action_type: 'reservation_pending',
              restaurantName: restaurantName || entityName,
              entityName: entityName || restaurantName,
              entityType,
              date,
              time,
              guests
            }
          });
      } catch (error) {
        console.error('Error inserting pending reservation message:', error);
      }
    };

    window.addEventListener('ai_reservation_submitted', handleReservationSubmitted);
    return () => window.removeEventListener('ai_reservation_submitted', handleReservationSubmitted);
  }, [chatState.conversation?.id]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatState.conversation) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const messageContent = inputMessage.trim();
      setInputMessage('');
      setChatState(prev => ({ ...prev, isTyping: true }));

      await supabase
        .from('messages')
        .insert({
          conversation_id: chatState.conversation.id,
          sender_type: isAdmin ? 'staff' : 'guest',
          sender_id: user.user.id,
          sender_name: isAdmin ? 'Staff' : userInfo?.name || 'Guest',
          content: messageContent,
          message_type: 'text'
        });

      const isAISection = chatState.conversation.conversation_type === 'safety_ai';

      if (isAISection && !isAdmin) {
        // If we are in the AI section, automatically switch back to AI handler if it was human/escalated
        if (chatState.currentHandler !== 'ai') {
          console.log('[useUnifiedChat] Re-activating AI handler for safety_ai conversation');
          await supabase
            .from('conversations')
            .update({ current_handler: 'ai' })
            .eq('id', chatState.conversation.id);

          setChatState(prev => ({ ...prev, currentHandler: 'ai' }));
        }

        await sendToAI(messageContent);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  };

  // Send message to AI
  const sendToAI = async (message: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !userInfo) return;

      const response = await supabase.functions.invoke('ai-chat-booking', {
        body: {
          message,
          userId: user.user.id,
          userName: userInfo.name,
          roomNumber: userInfo.roomNumber || 'N/A',
          conversationId: chatState.conversation?.id,
          hotelId: chatState.conversation?.hotel_id || hotelId
        }
      });

      if (response.error) {
        throw response.error;
      }

      // Also check if the function logic returned an error inside the data payload (for handled 200 responses)
      if (response.data && response.data.error) {
        throw response.data;
      }
    } catch (error: any) {
      console.error('Error communicating with AI:', error);
      setChatState(prev => ({ ...prev, isTyping: false }));

      const errorMessage = error.details || error.message || 'I encountered an error while processing your request.';
      const suggestion = error.suggestion ? `\n\nSuggestion: ${error.suggestion}` : '';

      await supabase
        .from('messages')
        .insert({
          conversation_id: chatState.conversation!.id,
          sender_type: 'ai',
          sender_name: 'AI Assistant',
          content: `I apologize, but I encountered an error: ${errorMessage}${suggestion}\n\nA human staff member will assist you shortly.`,
          message_type: 'system'
        });

      await escalateToHuman('AI Error');
    }
  };

  // Escalate conversation to human staff
  const escalateToHuman = async (reason: string = 'Guest Request') => {
    if (!chatState.conversation) return;

    try {
      await supabase
        .from('conversations')
        .update({
          current_handler: 'human',
          status: 'escalated'
        })
        .eq('id', chatState.conversation.id);

      await supabase
        .from('chat_routing')
        .insert({
          conversation_id: chatState.conversation.id,
          from_handler: 'ai',
          to_handler: 'human',
          reason
        });

      await supabase
        .from('messages')
        .insert({
          conversation_id: chatState.conversation.id,
          sender_type: 'ai',
          sender_name: 'AI Assistant',
          content: 'I\'m connecting you with a human staff member who will be able to provide more personalized assistance. Please hold on for a moment.',
          message_type: 'system'
        });

      toast({
        title: "Connected to Staff",
        description: "A human staff member will assist you shortly."
      });

    } catch (error) {
      console.error('Error escalating to human:', error);
      toast({
        title: "Error",
        description: "Failed to connect to staff. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Take over conversation (for admin)
  const takeOverConversation = async (targetConversationId?: string) => {
    const convId = targetConversationId || chatState.conversation?.id;
    if (!convId) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !isAdmin) return;

      await supabase
        .from('conversations')
        .update({
          current_handler: 'human',
          assigned_staff_id: user.user.id,
          status: 'active'
        })
        .eq('id', convId);

      await supabase
        .from('chat_routing')
        .insert({
          conversation_id: convId,
          from_handler: 'ai',
          to_handler: 'human',
          reason: 'Staff Takeover',
          staff_id: user.user.id
        });

      toast({
        title: "Conversation Taken Over",
        description: "You are now handling this conversation."
      });

    } catch (error) {
      console.error('Error taking over conversation:', error);
      toast({
        title: "Error",
        description: "Failed to take over conversation.",
        variant: "destructive"
      });
    }
  };

  return {
    ...chatState,
    inputMessage,
    setInputMessage,
    sendMessage,
    escalateToHuman,
    takeOverConversation,
    messagesEndRef,
    inputRef
  };
};
