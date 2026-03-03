
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin } from 'lucide-react';

// Import des composants d'onglets
import DestinationsTab from './destinations/DestinationsTab';
import AttractionsTab from './destinations/AttractionsTab';
import ActivitiesTab from './destinations/ActivitiesTab';
import CarRentalsTab from './destinations/CarRentalsTab';
import PublicTransportsTab from './destinations/PublicTransportsTab';

const DestinationAdmin = () => {
  return (
    <div className="p-6">
      <div id="admin-ob-destination-header" className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administration - Destination</h1>
          <p className="text-sm text-muted-foreground">Manage destinations, attractions and activities</p>
        </div>
      </div>
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
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
