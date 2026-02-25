
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { MessageCircle, Headphones as HeadphonesIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRoom } from '@/hooks/useRoom';
import ServiceCard from '@/features/services/components/ServiceCard';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import CommandSearch from '@/pages/my-room/components/CommandSearch';
import { useHotelPath } from '@/hooks/useHotelPath';

interface UserInfo {
  name: string;
  roomNumber: string;
}

const Services = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Guest',
    roomNumber: ''
  });
  const { toast } = useToast();
  const { userData } = useAuth();

  const roomNumber = userInfo.roomNumber || userData?.room_number || localStorage.getItem('user_room_number') || '';
  const { data: room } = useRoom(roomNumber);

  useEffect(() => {
    if (userData) {
      const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      if (fullName || userData.room_number) {
        setUserInfo({
          name: fullName || 'Guest',
          roomNumber: userData.room_number || ''
        });
        if (userData.room_number) {
          localStorage.setItem('user_room_number', userData.room_number);
        }
        return;
      }
    }

    const storedUserData = localStorage.getItem('user_data');
    const storedRoomNumber = localStorage.getItem('user_room_number');

    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        const fullName = `${parsedUserData.first_name || ''} ${parsedUserData.last_name || ''}`.trim();
        const roomNumber = parsedUserData.room_number || storedRoomNumber || '';

        if (fullName || roomNumber) {
          setUserInfo({
            name: fullName || 'Guest',
            roomNumber: roomNumber
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else if (storedRoomNumber) {
      setUserInfo(prev => ({
        ...prev,
        roomNumber: storedRoomNumber
      }));
    }
  }, [userData]);

  const { resolvePath } = useHotelPath();

  const handleStartChat = () => {
    navigate(resolvePath('/messages'), { state: { chatType: 'concierge' } });
  };

  const handleWhatsAppService = () => {
    toast({
      title: "WhatsApp Service",
      description: "Opening WhatsApp to connect with our concierge team."
    });
    window.open('https://wa.me/+21628784080', '_blank');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-foreground mb-4">Hotel Services</h1>
          <p className="text-muted-foreground">24/7 dedicated concierge support</p>
        </div>

        <div className="max-w-xl mx-auto mb-8 px-4">
          <h2 className="text-xl font-medium text-foreground mb-3">Quick Service Search</h2>
          <div className="relative">
            <div className="relative flex items-center border rounded-xl px-4 py-3.5 bg-background shadow-md cursor-pointer hover:shadow-lg transition-all group">
              <Search className="h-5 w-5 mr-3 text-primary group-hover:text-primary/80 transition-colors" />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">Search for services (towels, cleaning, wifi support...)</span>
            </div>

            <div className="absolute inset-0">
              <CommandSearch
                room={room}
                onRequestSuccess={() => {
                  toast({
                    title: "Request Sent",
                    description: "Your service request has been submitted successfully."
                  });
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8 px-4">
          <ServiceCard
            title="Live Chat"
            description="Instant messaging with our concierge team"
            icon={MessageCircle}
            actionText="Start Chat"
            onAction={handleStartChat}
          />

          <ServiceCard
            title="WhatsApp Service"
            description="Direct messaging via WhatsApp"
            icon={HeadphonesIcon}
            actionText="Message Us"
            onAction={handleWhatsAppService}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Services;
