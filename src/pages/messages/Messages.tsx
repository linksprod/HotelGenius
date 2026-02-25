import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedChatContainer } from '@/components/chat/UnifiedChatContainer';
import { AdminChatDashboard } from '@/components/admin/chat/AdminChatDashboard';
import { ChatListScreen } from '@/components/chat/ChatListScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useMessageBadge } from '@/hooks/useMessageBadge';
import Layout from '@/components/Layout';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email?: string;
    roomNumber?: string;
  } | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<'concierge' | 'safety_ai' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    const checkUserAndRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user is admin (we still want to know this for other logic, but we won't show the dashboard here)
        const { data: adminCheck } = await supabase.rpc('is_admin', { user_id: user.id });
        setIsAdmin(adminCheck || false);

        if (!adminCheck) {
          // Get guest info for regular users
          const { data: guestData } = await supabase
            .from('guests')
            .select('first_name, last_name, email, room_number')
            .eq('user_id', user.id)
            .single();

          if (guestData) {
            setUserInfo({
              name: `${guestData.first_name} ${guestData.last_name}`,
              email: guestData.email || user.email,
              roomNumber: guestData.room_number || undefined
            });
          } else {
            // Fallback for users without guest record
            setUserInfo({
              name: user.email?.split('@')[0] || 'Guest',
              email: user.email || undefined
            });
          }
        } else {
          // Admin fallback info
          setUserInfo({
            name: 'Admin',
            email: user.email || undefined
          });
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserInfo({
          name: 'Guest'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndRole();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load user information</p>
        </div>
      </div>
    );
  }

  // Show concierge chat or AI chat if selected
  if (selectedChatType) {
    return (
      <Layout>
        <div className="flex flex-col h-full w-full">
          <UnifiedChatContainer
            userInfo={userInfo}
            conversationType={selectedChatType}
            className="h-full w-full"
            onGoBack={handleBack}
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
