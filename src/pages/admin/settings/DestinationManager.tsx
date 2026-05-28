
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DestinationsTab from './destinations/DestinationsTab';
import AttractionsTab from './destinations/AttractionsTab';
import ActivitiesTab from './destinations/ActivitiesTab';
import TransportationTab from './destinations/TransportationTab';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { MapPin } from 'lucide-react';

const DestinationManager = () => {
  const [activeTab, setActiveTab] = useState('destinations');
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <AdminPageHeader
          title="Destination Management"
          description="Manage destination information and guides"
          icon={<MapPin className="h-5 w-5 text-primary" />}
        />
      </div>
      
      <Tabs defaultValue="destinations" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="destinations">Discover Categories</TabsTrigger>
          <TabsTrigger value="attractions">Popular Attractions</TabsTrigger>
          <TabsTrigger value="activities">Things To Do</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="destinations">
          <DestinationsTab />
        </TabsContent>
        
        <TabsContent value="attractions">
          <AttractionsTab />
        </TabsContent>
        
        <TabsContent value="activities">
          <ActivitiesTab />
        </TabsContent>
        
        <TabsContent value="transportation">
          <TransportationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DestinationManager;
