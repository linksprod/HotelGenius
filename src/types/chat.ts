export interface Conversation {
  id: string;
  guest_id: string | null;
  guest_name: string;
  guest_email: string | null;
  room_number: string | null;
  status: string;
  current_handler: string;
  conversation_type: string;
  assigned_staff_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_id: string | null;
  sender_name: string;
  content: string;
  message_type: string;
  metadata?: any;
  created_at: string;
}

export interface ChatRouting {
  id: string;
  conversation_id: string;
  from_handler: 'ai' | 'human';
  to_handler: 'ai' | 'human';
  reason: string | null;
  staff_id: string | null;
  created_at: string;
}

export interface ChatState {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  currentHandler: string;
}