
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRoom } from '@/hooks/useRoom';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import WelcomeBanner from './components/WelcomeBanner';
import RequestHistory from './components/RequestHistory';
import ServicesGrid from './components/ServicesGrid';
import CustomRequestForm from './components/CustomRequestForm';

const MyRoom = () => {
  const { t } = useTranslation();
  // Use room number stored in localStorage to avoid extra requests
  const roomNumber = localStorage.getItem('user_room_number') || '406';
  
  // Memoize requests to avoid unnecessary re-renders
  const { data: room, isLoading } = useRoom(roomNumber);
  const { 
    data: serviceRequests = [], 
    isLoading: isLoadingRequests, 
    refetch: refetchRequests 
  } = useServiceRequests();

  console.log('MyRoom debug:', { 
    roomNumber, 
    room, 
    serviceRequestsCount: serviceRequests.length,
    isLoadingRequests,
    serviceRequests: serviceRequests.slice(0, 2) // Show first 2 for debugging
  });

  // Show loading indicator only if essential data is not available
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <WelcomeBanner room={room} />
        
        <div className="space-y-8">
          <CustomRequestForm 
            room={room} 
            onRequestSuccess={refetchRequests} 
          />

          <ServicesGrid 
            room={room} 
            onRequestSuccess={refetchRequests} 
          />

          <RequestHistory 
            isLoading={isLoadingRequests}
            requests={serviceRequests}
          />
        </div>
      </div>
    </Layout>
  );
};

export default MyRoom;
