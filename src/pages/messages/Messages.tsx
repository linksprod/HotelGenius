import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedChatContainer } from '@/components/chat/UnifiedChatContainer';
import { AdminChatDashboard } from '@/components/admin/chat/AdminChatDashboard';
import { ChatListScreen } from '@/components/chat/ChatListScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useMessageBadge } from '@/hooks/useMessageBadge';
import Layout from '@/components/Layout';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useTranslation } from 'react-i18next';

import { useHotelPath } from '@/hooks/useHotelPath';

const Messages = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hotel } = useHotel();
  const { resolvePath } = useHotelPath();
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email?: string;
    roomNumber?: string;
  } | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<'concierge' | 'safety_ai' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const { markAsSeen } = useMessageBadge();

  const handleBack = () => {
    if (selectedChatType) {
      setSelectedChatType(null);
    } else {
      navigate(-1);
    }
  };

  // Mark messages as seen when the page loads (for non-admin users)
  useEffect(() => {
    if (!isAdmin && !isLoading) {
      markAsSeen();
    }
  }, [isAdmin, isLoading, markAsSeen]);

  useEffect(() => {
    let isMounted = true;
    
    const checkUserAndRole = async () => {
      try {
        console.log('[Messages] Initializing chat session...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;

        if (!user) {
          console.warn('[Messages] No active session found, redirecting to login');
          if (isMounted) {
            navigate(resolvePath('/guests/auth/login') + `?redirect=${encodeURIComponent(location.pathname)}`);
          }
          return;
        }

        console.log('[Messages] User authenticated:', user.id);

        // Check if user is admin
        const { data: adminCheck, error: rpcError } = await supabase.rpc('is_admin', { user_id: user.id });
        if (isMounted) setIsAdmin(!!adminCheck);

        if (!adminCheck) {
          console.log('[Messages] User is guest, fetching profile...');
          const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .select('first_name, last_name, email, room_number')
            .eq('user_id', user.id)
            .maybeSingle();

          if (isMounted) {
            if (guestData) {
              setUserInfo({
                name: `${guestData.first_name} ${guestData.last_name}`,
                email: guestData.email || user.email,
                roomNumber: guestData.room_number || undefined
              });
            } else {
              setUserInfo({
                name: user.email?.split('@')[0] || 'Guest',
                email: user.email || undefined
              });
            }
          }
        } else {
          console.log('[Messages] User is admin');
          if (isMounted) {
            setUserInfo({
              name: 'Admin',
              email: user.email || undefined
            });
          }
        }
      } catch (error) {
        console.error('[Messages] Critical error in session initialization:', error);
        if (isMounted) {
          setUserInfo({
            name: 'Guest'
          });
        }
      } finally {
        console.log('[Messages] Initialization complete');
        if (isMounted) setIsLoading(false);
      }
    };

    checkUserAndRole();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-medium animate-pulse">{t('chat.messagesPage.initializingChat')}</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
          <div className="bg-muted rounded-full p-6 mb-6">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('chat.messagesPage.sessionRequired')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            {t('chat.messagesPage.loginPrompt')}
          </p>
          <Button onClick={() => navigate(resolvePath('/guests/auth/login'))}>
            {t('chat.messagesPage.goToLogin')}
          </Button>
        </div>
      </Layout>
    );
  }

  // Show concierge chat or AI chat if selected
  if (selectedChatType) {
    return (
      <Layout hideBottomNav={true} hideHeader={true}>
        <div className="flex flex-col h-full w-full">
          <UnifiedChatContainer
            key={chatKey}
            userInfo={userInfo}
            conversationType={selectedChatType}
            className="h-full w-full"
            hotelId={hotel?.id}
            onGoBack={handleBack}
            onDeleteSuccess={() => setChatKey(prev => prev + 1)}
          />
        </div>
      </Layout>
    );
  }

  // Show chat selection screen
  return (
    <Layout>
      <ChatListScreen
        userInfo={userInfo}
        onSelectChat={setSelectedChatType}
      />
    </Layout>
  );
};

export default Messages;
