
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin } from 'lucide-react';

// Import des composants d'onglets
import DestinationsTab from './destinations/DestinationsTab';
import AttractionsTab from './destinations/AttractionsTab';
import ActivitiesTab from './destinations/ActivitiesTab';
import CarRentalsTab from './destinations/CarRentalsTab';
import PublicTransportsTab from './destinations/PublicTransportsTab';
import NearbyShopsTab from '@/pages/admin/modules/shops/shops/NearbyShopsTab';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

const DestinationAdmin = () => {
  return (
    <div className="p-6">
      <div id="admin-ob-destination-header" className="mb-6">
        <AdminPageHeader
          title="Administration - Destination"
          description="Manage destinations, attractions and activities"
          icon={<MapPin className="h-5 w-5 text-primary" />}
        />
      </div>
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Places</TabsTrigger>
          <TabsTrigger value="carRentals">Locations Voiture</TabsTrigger>
          <TabsTrigger value="transports">Transports</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <DestinationsTab />
        </TabsContent>

        <TabsContent value="attractions">
          <AttractionsTab />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesTab />
        </TabsContent>

        <TabsContent value="nearby">
          <NearbyShopsTab />
        </TabsContent>

        <TabsContent value="carRentals">
          <CarRentalsTab />
        </TabsContent>

        <TabsContent value="transports">
          <PublicTransportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DestinationAdmin;
