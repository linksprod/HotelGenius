import React, { useState, useEffect } from 'react';
import { UnifiedChatHeader } from './UnifiedChatHeader';
import { UnifiedMessagesList } from './UnifiedMessagesList';
import { UnifiedChatInput } from './UnifiedChatInput';
import { useUnifiedChat } from '@/hooks/useUnifiedChat';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, X, Plus, MessageSquare, Trash2 } from 'lucide-react';
import type { Conversation } from '@/types/chat';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UnifiedChatContainerProps {
  userInfo: {
    name: string;
    email?: string;
    roomNumber?: string;
  };
  isAdmin?: boolean;
  className?: string;
  conversationType?: 'concierge' | 'safety_ai';
  conversationId?: string; // Load specific conversation by ID (for admin)
  hotelId?: string; // Tenant scope
  onGoBack?: () => void;
  onDeleteSuccess?: () => void;
  /** Called when the user requests to switch to a different chat type (e.g., concierge) */
  onSwitchChatType?: (type: 'concierge' | 'safety_ai') => void;
}

export const UnifiedChatContainer: React.FC<UnifiedChatContainerProps> = ({
  userInfo,
  isAdmin = false,
  className = "",
  conversationType = 'concierge',
  conversationId,
  hotelId: propHotelId,
  onGoBack,
  onDeleteSuccess,
  onSwitchChatType
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { hotelId: contextHotelId } = useCurrentHotelId();
  const hotelId = propHotelId || contextHotelId;

  // Manage selected conversation ID for loading historical chats
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(conversationId);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const {
    conversation,
    messages,
    isLoading,
    isTyping,
    currentHandler,
    inputMessage,
    setInputMessage,
    sendMessage,
    sendMessageDirect,
    escalateToHuman,
    takeOverConversation,
    startNewConversation,
    deleteConversation,
    messagesEndRef,
    inputRef,
    showAuthDialog,
    setShowAuthDialog
  } = useUnifiedChat({ 
    userInfo, 
    isAdmin, 
    conversationType, 
    conversationId: selectedConversationId, 
    hotelId 
  });

  const fetchHistory = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await (supabase
        .from('conversations')
        .select('*')
        .eq('guest_id', user.user.id)
        .eq('conversation_type', conversationType) as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  // Fetch history whenever the current active/selected conversation ID changes
  useEffect(() => {
    if (!isAdmin && conversationType === 'safety_ai') {
      fetchHistory();
    }
  }, [conversation?.id, conversationType, isAdmin]);

  // Sync conversationId prop to local state
  useEffect(() => {
    setSelectedConversationId(conversationId);
  }, [conversationId]);

  // Lock body/html scroll on mobile and set full viewport height
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Save original styles
    const originalHtmlOverflow = html.style.overflowY;
    const originalHtmlHeight = html.style.height;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyHeight = body.style.height;

    // Apply scroll lock styles with !important override via setProperty
    html.style.setProperty('overflow-y', 'hidden', 'important');
    html.style.setProperty('height', '100%', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');
    body.style.setProperty('height', '100%', 'important');
    
    return () => {
      // Restore original styles
      if (originalHtmlOverflow) {
        html.style.setProperty('overflow-y', originalHtmlOverflow, 'important');
      } else {
        html.style.removeProperty('overflow-y');
      }
      
      if (originalHtmlHeight) {
        html.style.setProperty('height', originalHtmlHeight);
      } else {
        html.style.removeProperty('height');
      }

      if (originalBodyOverflow) {
        body.style.setProperty('overflow', originalBodyOverflow, 'important');
      } else {
        body.style.removeProperty('overflow');
      }

      if (originalBodyHeight) {
        body.style.setProperty('height', originalBodyHeight);
      } else {
        body.style.removeProperty('height');
      }
    };
  }, []);

  const handleNewConversation = async () => {
    if (conversation && (conversation.status === 'active' || conversation.status === 'escalated')) {
      await startNewConversation();
    }
    setSelectedConversationId(undefined);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversation(conversationToDelete);
      
      // If we deleted the current conversation, clear the selection to load/create active chat
      if (selectedConversationId === conversationToDelete || conversation?.id === conversationToDelete) {
        if (onDeleteSuccess) {
          onDeleteSuccess();
          return;
        }
        setSelectedConversationId(undefined);
      }
      
      // Refresh history list
      fetchHistory();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setConversationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full bg-background ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('chat.container.loadingChat')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full bg-background relative overflow-hidden ${className}`}>
      {/* Sidebar for Chat History */}
      {!isAdmin && conversationType === 'safety_ai' && (
        <>
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/40 z-20 md:hidden" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar Panel */}
          <div className={`
            fixed md:static inset-y-0 left-0 w-64 border-r bg-background md:bg-muted/20 flex flex-col z-30 transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'}
            md:flex flex-shrink-0 h-full
          `}>
            {/* Sidebar Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t('chat.history.title')}
              </h3>
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* New Chat Button in Sidebar */}
            <div className="p-3">
              <Button
                onClick={() => {
                  handleNewConversation();
                  setIsSidebarOpen(false);
                }}
                className="w-full gap-2 border-primary/20 hover:border-primary/40"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                {t('chat.header.newConversation')}
              </Button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  {t('chat.history.empty')}
                </div>
              ) : (
                history.map((item) => {
                  const isActive = selectedConversationId === item.id || (!selectedConversationId && conversation?.id === item.id);
                  const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedConversationId(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-all group
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-[13px] leading-tight">
                          {t('chat.history.chatFrom', { date: formattedDate })}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteConversation(e, item.id)}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <UnifiedChatHeader
          conversation={conversation}
          currentHandler={currentHandler as 'ai' | 'human'}
          isAdmin={isAdmin}
          onEscalateToHuman={escalateToHuman}
          onTakeOver={takeOverConversation}
          onNewConversation={handleNewConversation}
          conversationType={conversationType}
          showHistoryButton={conversationType === 'safety_ai'}
          onToggleHistory={() => setIsSidebarOpen(prev => !prev)}
          onGoBack={onGoBack}
        />

        <UnifiedMessagesList
          messages={messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          currentUser={userInfo}
          isAdmin={isAdmin}
          hotelId={hotelId}
          onQuickOptionSelect={sendMessageDirect}
          onSwitchChatType={onSwitchChatType}
        />

        <UnifiedChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={sendMessage}
          inputRef={inputRef}
          currentHandler={currentHandler as 'ai' | 'human'}
          isTyping={isTyping}
          userInfo={userInfo}
        />
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('chat.history.deleteTitle', 'Supprimer la conversation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('chat.history.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('chat.authRequired.title', 'Account required to continue')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('chat.authRequired.description', 'Please log in or sign up to send messages and interact with our AI concierge.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAuthDialog(false)}>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowAuthDialog(false);
                navigate(resolvePath('/guests/auth/login') + `?redirect=${encodeURIComponent(window.location.pathname)}`);
              }}
              className="bg-[#82A691] text-white hover:bg-[#6D8E7B]"
            >
              {t('chat.authRequired.loginButton', 'Log In / Sign Up')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};