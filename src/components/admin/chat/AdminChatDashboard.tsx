import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UnifiedChatContainer } from '@/components/chat/UnifiedChatContainer';
import { ConversationListItem } from './ConversationListItem';
import { RefreshCw, MessageSquare, Clock, Users, Activity, Sparkles, Brain, ArrowUpRight } from 'lucide-react';
import DemoInstructionOverlay from '../DemoInstructionOverlay';
import type { Conversation } from '@/types/chat';

export const AdminChatDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ active: 8, escalated: 4, total: 24, aiResolved: 12, avgResponse: '1.2m' });
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { markSectionSeen } = useAdminNotifications();

  useEffect(() => {
    markSectionSeen('chat');
    fetchConversations();
    // In a real app, we'd have a real-time subscription here
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
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
      
      // Mock stats for demo density
      setStats({ 
        active: (uniqueData.filter(c => c.status === 'active').length || 0) + 5, 
        escalated: (uniqueData.filter(c => c.status === 'escalated').length || 0) + 2, 
        total: (uniqueData.length || 0) + 12,
        aiResolved: 18,
        avgResponse: '0.8m'
      });
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
    const filtered = filterConversations(filter);
    
    // Add some mock data if empty for demo
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
      
      {/* Header Area */}
      <div id="admin-ob-chat-header" className="shrink-0 p-4 md:p-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Monitoring
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground">Conversation Hub</h1>
          <p className="text-muted-foreground font-medium text-xs md:text-sm">Orchestrating guest experiences through AI & human collaboration.</p>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="flex flex-col items-start md:items-end md:mr-4">
            <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Efficiency</span>
            <span className="text-base md:text-lg font-black text-rose-500 leading-none">94.2%</span>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchConversations} 
            disabled={isLoading} 
            className="h-10 md:h-12 px-4 md:px-6 gap-2 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground rounded-xl shadow-sm transition-all active:scale-95 text-xs"
          >
            <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Hub
          </Button>
        </div>
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
          selectedConversation && "hidden md:flex"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-border dark:border-white/[0.03] bg-zinc-50 dark:bg-zinc-900/40">
              <TabsList className="flex w-full bg-zinc-200 dark:bg-zinc-800/50 rounded-xl p-1 h-12 gap-1">
                <TabsTrigger value="escalations" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-rose-500 data-[state=active]:text-white rounded-lg px-0">Escalations</TabsTrigger>
                <TabsTrigger value="human" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-0">Relations</TabsTrigger>
                <TabsTrigger value="ai" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-0">IA Hub</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-[9px] font-bold uppercase tracking-tight data-[state=active]:bg-zinc-400 dark:bg-zinc-700 data-[state=active]:text-white rounded-lg px-0">History</TabsTrigger>
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
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation && (
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
          {selectedConversation ? (
            <div className="flex-1 flex flex-col min-h-0">
               < UnifiedChatContainer
                userInfo={{ name: 'Admin Hub', email: 'concierge@hotelgenius.online' }}
                isAdmin={true}
                className="h-full"
                conversationId={selectedConversation.id}
              />
            </div>
          ) : (
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
        </div>
      </div>
    </div>
  );
};
