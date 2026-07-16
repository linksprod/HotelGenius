import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UnifiedChatContainer } from '@/components/chat/UnifiedChatContainer';
import { ConversationListItem } from './ConversationListItem';
import { 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  Users, 
  Activity, 
  Sparkles, 
  Brain, 
  ArrowUpRight,
  Send,
  Smartphone,
  Loader2,
  Paperclip,
  Smile,
  Mic,
  CheckCheck
} from 'lucide-react';
import DemoInstructionOverlay from '../DemoInstructionOverlay';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import type { Conversation } from '@/types/chat';

// WhatsApp Integration Mock Data Structures
interface WhatsAppMessage {
  id: string;
  sender: 'admin' | 'guest';
  text: string;
  timestamp: string;
}

interface WhatsAppConversation {
  id: string;
  guestName: string;
  roomNumber: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const initialWhatsAppConversations: WhatsAppConversation[] = [
  {
    id: 'wa-1',
    guestName: 'Amine Ben Ali',
    roomNumber: '304',
    lastMessage: 'Hello! Can I order room service via WhatsApp?',
    timestamp: '14:32',
    unread: true
  },
  {
    id: 'wa-2',
    guestName: 'Sarah Jenkins',
    roomNumber: '102',
    lastMessage: 'Perfect, thank you for the recommendations!',
    timestamp: '12:15',
    unread: false
  },
  {
    id: 'wa-3',
    guestName: 'Jean-Pierre',
    roomNumber: '215',
    lastMessage: 'What time is breakfast served tomorrow?',
    timestamp: 'Yesterday',
    unread: false
  }
];

const initialWhatsAppMessages: Record<string, WhatsAppMessage[]> = {
  'wa-1': [
    { id: 'm1', sender: 'guest', text: 'Hello! I just checked in. Is room service available 24/7?', timestamp: '14:30' },
    { id: 'm2', sender: 'admin', text: 'Welcome to our hotel! Yes, room service is available 24/7. You can view the menu on the HotelGenius web app or scan the QR code in your room.', timestamp: '14:31' },
    { id: 'm3', sender: 'guest', text: 'Hello! Can I order room service via WhatsApp?', timestamp: '14:32' }
  ],
  'wa-2': [
    { id: 'm4', sender: 'guest', text: 'Hi, do you recommend any local restaurants near the hotel?', timestamp: '12:05' },
    { id: 'm5', sender: 'admin', text: 'Certainly! We highly recommend Portofino Restaurant for exceptional dining. It is located nearby and serves amazing Mediterranean cuisine.', timestamp: '12:10' },
    { id: 'm6', sender: 'guest', text: 'Perfect, thank you for the recommendations!', timestamp: '12:15' }
  ],
  'wa-3': [
    { id: 'm7', sender: 'guest', text: 'What time is breakfast served tomorrow?', timestamp: 'Yesterday' }
  ]
};

export const AdminChatDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  // WhatsApp Integration States
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [integrationStep, setIntegrationStep] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+216 71 111 000');
  const [wabaId, setWabaId] = useState('WABA-LAICO-HAMMAMET-95');
  
  const [whatsAppConversations, setWhatsAppConversations] = useState<WhatsAppConversation[]>(initialWhatsAppConversations);
  const [selectedWhatsAppConvId, setSelectedWhatsAppConvId] = useState<string | null>(null);
  const [whatsAppMessages, setWhatsAppMessages] = useState<Record<string, WhatsAppMessage[]>>(initialWhatsAppMessages);
  const [whatsAppInput, setWhatsAppInput] = useState('');

  const handleIntegrateWhatsApp = () => {
    if (!phoneNumber || !wabaId) {
      toast({
        title: "Integration Error",
        description: "Please fill in all WhatsApp parameters.",
        variant: "destructive",
      });
      return;
    }
    setIsIntegrating(true);
    setIntegrationStep('Initiating Meta WABA handshake...');
    
    setTimeout(() => {
      setIntegrationStep('Configuring message Webhook listeners...');
      setTimeout(() => {
        setIntegrationStep('Registering official WhatsApp templates...');
        setTimeout(() => {
          setIsIntegrating(false);
          setIsWhatsAppConnected(true);
          setSelectedWhatsAppConvId('wa-1');
          toast({
            title: "WhatsApp Integrated",
            description: "WhatsApp Business API connected successfully! Conversational channels are now live.",
          });
        }, 600);
      }, 600);
    }, 600);
  };

  const handleSendWhatsAppMessage = () => {
    if (!whatsAppInput.trim() || !selectedWhatsAppConvId) return;

    const userText = whatsAppInput.trim();
    setWhatsAppInput('');

    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setWhatsAppMessages(prev => ({
      ...prev,
      [selectedWhatsAppConvId]: [...(prev[selectedWhatsAppConvId] || []), newMsg]
    }));

    setWhatsAppConversations(prev =>
      prev.map(c => c.id === selectedWhatsAppConvId ? { ...c, lastMessage: userText, timestamp: 'Just now' } : c)
    );

    setTimeout(() => {
      let replyText = "Thank you, we received your message!";
      if (selectedWhatsAppConvId === 'wa-1') {
        replyText = "Awesome, thanks! I'll order the grilled sea bass and a sparkling water. Can you charge it to my room?";
      } else if (selectedWhatsAppConvId === 'wa-2') {
        replyText = "Perfect! I will book a table at Portofino for 8 PM tonight. Thanks for the quick support!";
      } else if (selectedWhatsAppConvId === 'wa-3') {
        replyText = "Thank you so much! See you tomorrow morning.";
      }

      const replyMsg: WhatsAppMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'guest',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setWhatsAppMessages(prev => ({
        ...prev,
        [selectedWhatsAppConvId]: [...(prev[selectedWhatsAppConvId] || []), replyMsg]
      }));

      setWhatsAppConversations(prev =>
        prev.map(c => c.id === selectedWhatsAppConvId ? { ...c, lastMessage: replyText, timestamp: 'Just now' } : c)
      );

      toast({
        title: `WhatsApp from ${whatsAppConversations.find(c => c.id === selectedWhatsAppConvId)?.guestName || 'Guest'}`,
        description: replyText,
      });
    }, 1500);
  };
  
  const selectedConversationRef = React.useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ active: 8, escalated: 4, total: 24, aiResolved: 12, avgResponse: '1.2m' });
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { markSectionSeen } = useAdminNotifications();
  const { hotelId, isSuperAdmin } = useUserRole();

  // Clear unread counts locally and mark seen in DB when conversation changes
  useEffect(() => {
    if (selectedConversation?.id) {
      const convId = selectedConversation.id;
      markSectionSeen('chat:' + convId);
      setUnreadCounts(prev => ({ ...prev, [convId]: 0 }));
    }
  }, [selectedConversation?.id, markSectionSeen]);

  useEffect(() => {
    markSectionSeen('chat');
    fetchConversations();
    
    // Real-time subscription for conversations and messages
    const channel = supabase
      .channel('admin-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = payload.new as any;
        if (msg.sender_type === 'guest' && msg.conversation_id) {
          const convId = msg.conversation_id;
          const currentSelected = selectedConversationRef.current;
          if (currentSelected?.id === convId) {
            markSectionSeen('chat:' + convId);
          } else {
            setUnreadCounts(prev => ({ ...prev, [convId]: (prev[convId] || 0) + 1 }));
          }
        }
        fetchUnreadCounts();
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [hotelId, markSectionSeen]);

  const fetchUnreadCounts = useCallback(async (targetConversations?: Conversation[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: seenRows } = await supabase
      .from('admin_section_seen')
      .select('section_key, last_seen_at')
      .eq('user_id', user.id)
      .like('section_key', 'chat:%');

    const seenMap: Record<string, string> = {};
    if (seenRows) {
      for (const row of seenRows) {
        seenMap[row.section_key] = row.last_seen_at;
      }
    }

    const convsToCheck = targetConversations || conversations;

    let messagesQuery = supabase
      .from('messages')
      .select('conversation_id, created_at')
      .eq('sender_type', 'guest');

    if (!isSuperAdmin && hotelId) {
      const convIds = convsToCheck.map(c => c.id);
      if (convIds.length > 0) {
        messagesQuery = messagesQuery.in('conversation_id', convIds);
      } else {
        setUnreadCounts({});
        return;
      }
    }

    const { data: guestMessages } = await messagesQuery;

    const counts: Record<string, number> = {};
    const activeId = selectedConversationRef.current?.id;
    if (guestMessages) {
      for (const msg of guestMessages) {
        if (msg.conversation_id === activeId) {
          counts[msg.conversation_id] = 0;
          continue;
        }
        const lastSeen = seenMap[`chat:${msg.conversation_id}`] || '1970-01-01T00:00:00Z';
        if (msg.created_at > lastSeen) {
          counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
        }
      }
    }
    setUnreadCounts(counts);
  }, [hotelId, isSuperAdmin, conversations]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!isSuperAdmin && hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter out potential duplicates by ID
      const uniqueData = (data || []).reduce((acc: Conversation[], current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      setConversations(uniqueData);
      
      const active = uniqueData.filter(c => c.status === 'active').length || 0;
      const escalated = uniqueData.filter(c => c.status === 'escalated').length || 0;
      
      // Merge real stats with some demo-boosting for empty states
      setStats({ 
        active, 
        escalated, 
        total: uniqueData.length || 0,
        aiResolved: Math.max(12, escalated * 2), // Demo-friendly
        avgResponse: '1.2m'
      });

      fetchUnreadCounts(uniqueData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('escalations');

  const filterConversations = (filter: string) => {
    switch (filter) {
      case 'escalations':
        return conversations.filter(c => c.status === 'escalated');
      case 'human':
        return conversations.filter(c => c.status === 'active' && c.current_handler === 'human');
      case 'ai':
        return conversations.filter(c => c.status === 'active' && c.current_handler === 'ai');
      case 'history':
        return conversations.filter(c => c.status === 'closed');
      default:
        return conversations;
    }
  };

  const renderConversationList = (filter: string) => {
    if (filter === 'whatsapp') {
      if (!isWhatsAppConnected) {
        return (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
            <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-emerald-500">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.453 5.352 1.454 5.482 0 9.949-4.466 9.952-9.948.002-2.656-1.03-5.153-2.903-7.028-1.874-1.874-4.373-2.905-7.031-2.906-5.485 0-9.952 4.467-9.955 9.949-.001 1.838.503 3.633 1.46 5.215L1.69 20.8l5.086-1.332zm10.744-5.32c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">WhatsApp Offline</p>
              <p className="text-zinc-500 text-xs">Integrate WhatsApp to start chatting</p>
            </div>
          </div>
        );
      }
      
      return whatsAppConversations.map(conversation => (
        <div
          key={conversation.id}
          className={cn(
            "p-3 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between border",
            selectedWhatsAppConvId === conversation.id
              ? "bg-emerald-600/10 border-emerald-600/30 text-white"
              : "bg-zinc-900/20 border-white/[0.02] hover:bg-zinc-900/40 text-zinc-300 hover:text-white"
          )}
          onClick={() => {
            setSelectedWhatsAppConvId(conversation.id);
            // Mark read
            setWhatsAppConversations(prev =>
              prev.map(c => c.id === conversation.id ? { ...c, unread: false } : c)
            );
          }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-emerald-600/20 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
              {conversation.guestName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm truncate">{conversation.guestName}</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">Ch. {conversation.roomNumber}</span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">{conversation.lastMessage}</p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 gap-1.5 ml-2">
            <span className="text-[10px] text-zinc-500">{conversation.timestamp}</span>
            {conversation.unread ? (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <CheckCheck className="h-3 w-3 text-emerald-500" />
            )}
          </div>
        </div>
      ));
    }

    const filtered = filterConversations(filter);
    
    if (filtered.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5">
            <MessageSquare className="h-6 w-6 text-zinc-500" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">No {filter} channels</p>
            <p className="text-zinc-500 text-xs">Everything is running smoothly</p>
          </div>
        </div>
      );
    }

    return filtered.map(conversation => (
      <ConversationListItem
        key={conversation.id}
        conversation={conversation}
        isSelected={selectedConversation?.id === conversation.id}
        unreadCount={unreadCounts[conversation.id] || 0}
        onClick={() => setSelectedConversation(conversation)}
      />
    ));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-foreground">
      
      <div className="px-4 md:px-8 pt-4 md:pt-8">
        <AdminPageHeader
          title="Conversation Hub"
          description="Orchestrating guest experiences through AI & human collaboration."
          badge={
            <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          }
          actions={
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Efficiency</span>
                <span className="text-sm font-semibold text-rose-500 leading-none">94.2%</span>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchConversations} 
                disabled={isLoading} 
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>
          }
        />
      </div>

      {/* Stats Command Bar */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 px-4 md:px-8 pb-4 md:pb-8">
        {[
          { label: 'Active Channels', value: stats.active, icon: Activity, color: 'text-emerald-500' },
          { label: 'Escalations', value: stats.escalated, icon: Clock, color: 'text-rose-500' },
          { label: 'AI Resolution', value: stats.aiResolved, icon: Brain, color: 'text-purple-500' },
          { label: 'Avg Response', value: stats.avgResponse, icon: Sparkles, color: 'text-amber-500' },
          { label: 'Total Volume', value: stats.total, icon: Users, color: 'text-muted-foreground' },
        ].map((stat, i) => (
          <Card key={i} className={cn(
            "border-border dark:border-none shadow-sm bg-card/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-xl md:rounded-2xl group hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all cursor-pointer",
            i >= 4 && "hidden md:block" // Hide less important stats on smallest screens
          )}>
            <CardContent className="p-3 md:p-5 flex items-center justify-between">
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{stat.label}</p>
                <div className="text-lg md:text-2xl font-black text-foreground leading-none">{stat.value}</div>
              </div>
              <div className={cn("p-1.5 md:p-2 rounded-lg md:rounded-xl bg-zinc-100 dark:bg-white/5 group-hover:bg-zinc-200 dark:group-hover:bg-white/10 transition-colors", stat.color)}>
                <stat.icon className="h-3 w-3 md:h-4 md:w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Interaction Split */}
      <div className="flex flex-1 min-h-0 px-4 md:px-8 gap-4 md:gap-8 overflow-hidden pb-4 relative">
        {/* Left Side: Conversation Queue */}
        <div className={cn(
          "w-full md:w-[380px] flex flex-col bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg transition-all duration-300",
          (selectedConversation || (activeTab === 'whatsapp' && (selectedWhatsAppConvId || !isWhatsAppConnected))) && "hidden md:flex"
        )}>
          <Tabs value={activeTab} onValueChange={(v) => {
            setActiveTab(v);
            if (v === 'whatsapp') {
              setSelectedConversation(null);
            } else {
              setSelectedWhatsAppConvId(null);
            }
          }} className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-4 border-b border-border dark:border-white/[0.03] bg-zinc-50 dark:bg-zinc-900/40">
              <TabsList className="flex w-full bg-zinc-200 dark:bg-zinc-800/50 rounded-xl p-1 h-12 gap-1 overflow-x-auto">
                <TabsTrigger value="escalations" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-rose-500 data-[state=active]:text-white rounded-lg px-0">Escalations</TabsTrigger>
                <TabsTrigger value="human" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-0">Relations</TabsTrigger>
                <TabsTrigger value="ai" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-0">IA Hub</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-zinc-400 dark:bg-zinc-700 data-[state=active]:text-white rounded-lg px-0">History</TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg px-0 flex items-center justify-center gap-1">
                  <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.453 5.352 1.454 5.482 0 9.949-4.466 9.952-9.948.002-2.656-1.03-5.153-2.903-7.028-1.874-1.874-4.373-2.905-7.031-2.906-5.485 0-9.952 4.467-9.955 9.949-.001 1.838.503 3.633 1.46 5.215L1.69 20.8l5.086-1.332zm10.744-5.32c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-2">
                  {renderConversationList(activeTab)}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Right Side: Visual Messenger */}
        <div className={cn(
          "flex-1 flex flex-col bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg transition-all duration-300",
          activeTab === 'whatsapp'
            ? (!selectedWhatsAppConvId && isWhatsAppConnected) && "hidden md:flex"
            : !selectedConversation && "hidden md:flex"
        )}>
          
          {/* Back button for mobile view when in active WhatsApp chat */}
          {activeTab === 'whatsapp' && isWhatsAppConnected && selectedWhatsAppConvId && (
            <div className="md:hidden p-4 border-b border-border dark:border-white/5 flex items-center justify-between bg-card/50 dark:bg-zinc-900/50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedWhatsAppConvId(null)}
                className="gap-2 text-foreground font-bold"
              >
                <MessageSquare className="h-4 w-4" />
                Back to Queue
              </Button>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">WhatsApp Session</div>
            </div>
          )}

          {/* Back button for mobile view when in active concierge chat */}
          {activeTab !== 'whatsapp' && selectedConversation && (
            <div className="md:hidden p-4 border-b border-border dark:border-white/5 flex items-center justify-between bg-card/50 dark:bg-zinc-900/50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedConversation(null)}
                className="gap-2 text-foreground font-bold"
              >
                <MessageSquare className="h-4 w-4" />
                Back to Queue
              </Button>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">Active Session</div>
            </div>
          )}

          {/* Render Normal Concierge Chat */}
          {activeTab !== 'whatsapp' && selectedConversation && (
            <div className="flex-1 flex flex-col min-h-0">
               <UnifiedChatContainer
                key={selectedConversation.id}
                userInfo={{ name: 'Admin Hub', email: 'concierge@hotelgenius.online' }}
                isAdmin={true}
                className="h-full"
                conversationId={selectedConversation.id}
              />
            </div>
          )}

          {/* Render Normal Concierge Chat Placeholder */}
          {activeTab !== 'whatsapp' && !selectedConversation && (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500/10 dark:bg-rose-500/20 blur-3xl rounded-full" />
                <div className="relative p-8 bg-card dark:bg-zinc-900/80 rounded-[2.5rem] border border-border dark:border-white/5 shadow-xl">
                  <MessageSquare className="h-16 w-16 text-rose-500 opacity-80" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Select a Dialogue</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  Join an active conversation or review AI interaction history to provide premium guest support.
                </p>
              </div>
              <Button variant="ghost" className="text-rose-500 font-bold hover:bg-rose-500/10 gap-2">
                Launch Onboarding
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Render WhatsApp Integration Panel */}
          {activeTab === 'whatsapp' && !isWhatsAppConnected && (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
              <div className="p-4 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500/40">
                <svg className="h-10 w-10 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.453 5.352 1.454 5.482 0 9.949-4.466 9.952-9.948.002-2.656-1.03-5.153-2.903-7.028-1.874-1.874-4.373-2.905-7.031-2.906-5.485 0-9.952 4.467-9.955 9.949-.001 1.838.503 3.633 1.46 5.215L1.69 20.8l5.086-1.332zm10.744-5.32c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </div>
              <p className="text-zinc-500 text-sm font-medium">WhatsApp integration is currently offline.</p>
            </div>
          )}

          {/* Render WhatsApp Active Chat */}
          {activeTab === 'whatsapp' && isWhatsAppConnected && selectedWhatsAppConvId && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#efeae2] dark:bg-[#0b141a] relative">
              {/* WhatsApp Chat Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {whatsAppConversations.find(c => c.id === selectedWhatsAppConvId)?.guestName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {whatsAppConversations.find(c => c.id === selectedWhatsAppConvId)?.guestName}
                    </h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Active • Room {whatsAppConversations.find(c => c.id === selectedWhatsAppConvId)?.roomNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.453 5.352 1.454 5.482 0 9.949-4.466 9.952-9.948.002-2.656-1.03-5.153-2.903-7.028-1.874-1.874-4.373-2.905-7.031-2.906-5.485 0-9.952 4.467-9.955 9.949-.001 1.838.503 3.633 1.46 5.215L1.69 20.8l5.086-1.332zm10.744-5.32c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                    WhatsApp Channel
                  </span>
                </div>
              </div>

              {/* Chat Message Thread */}
              <ScrollArea className="flex-1 px-4 py-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-40 dark:bg-zinc-950">
                <div className="space-y-4 max-w-3xl mx-auto pb-4">
                  {(whatsAppMessages[selectedWhatsAppConvId] || []).map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex w-full",
                        msg.sender === 'admin' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm relative group",
                        msg.sender === 'admin' 
                          ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-tr-none" 
                          : "bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100 rounded-tl-none"
                      )}>
                        <p className="whitespace-pre-wrap leading-relaxed pr-6 pb-2">{msg.text}</p>
                        <div className="flex items-center gap-1 justify-end absolute bottom-1 right-2 text-[9px] text-zinc-400 dark:text-zinc-400 select-none">
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'admin' && (
                            <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer Input Bar */}
              <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0">
                <Button variant="ghost" size="icon" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 hover:bg-zinc-300/20 shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>

                
                <input 
                  type="text" 
                  value={whatsAppInput}
                  onChange={(e) => setWhatsAppInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsAppMessage()}
                  placeholder="Type a WhatsApp message..."
                  className="flex-1 bg-white dark:bg-[#2a3942] text-zinc-900 dark:text-white border border-border dark:border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-zinc-500"
                />

                {whatsAppInput.trim() ? (
                  <Button 
                    onClick={handleSendWhatsAppMessage}
                    className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center p-0 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 hover:bg-zinc-300/20 shrink-0">
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Render WhatsApp Connected, No Chat Selected */}
          {activeTab === 'whatsapp' && isWhatsAppConnected && !selectedWhatsAppConvId && (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl rounded-full" />
                <div className="relative p-8 bg-card dark:bg-zinc-900/80 rounded-[2.5rem] border border-border dark:border-white/5 shadow-xl">
                  <svg className="h-16 w-16 text-emerald-500 opacity-80 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.453 5.352 1.454 5.482 0 9.949-4.466 9.952-9.948.002-2.656-1.03-5.153-2.903-7.028-1.874-1.874-4.373-2.905-7.031-2.906-5.485 0-9.952 4.467-9.955 9.949-.001 1.838.503 3.633 1.46 5.215L1.69 20.8l5.086-1.332zm10.744-5.32c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Select a Chat</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  Choose an active WhatsApp conversation from the queue to start responding to guest requests.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

