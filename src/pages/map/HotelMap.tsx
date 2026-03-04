
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Building, Utensils, Coffee, LifeBuoy, Dumbbell, Wifi, DoorClosed, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const HotelMap = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleClearSearch = () => {
    setSearchValue('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for locations, rooms, or facilities..."
              className="w-full pl-12 pr-10 py-4 rounded-xl text-base bg-card shadow-lg"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            {searchValue && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Hotel Map</h2>
          <Card className="p-0 rounded-xl overflow-hidden mb-4">
            <div className="relative h-[400px] bg-muted">
              {/* This would be your interactive map component */}
              <img
                src="https://images.unsplash.com/photo-1580846062738-c9558ed4d26b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                alt="Hotel Map"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-card/80 backdrop-blur-sm p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">Interactive Map</h3>
                  <p className="mb-4">Explore our hotel facilities and navigate with ease</p>
                  <Button>View Full Screen</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Floor Selector */}
          <div className="flex overflow-x-auto gap-2 pb-2 mb-4">
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">Ground Floor</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">Floor 1</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">Floor 2</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">Floor 3</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">Floor 4</Button>
            <Button variant="outline" className="whitespace-nowrap min-w-[80px]">Floor 5</Button>
          </div>
        </div>

        {/* Key Facilities */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Key Facilities</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Restaurants</h3>
                  <p className="text-sm text-muted-foreground">Level 1 & Rooftop</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Cafe</h3>
                  <p className="text-sm text-muted-foreground">Lobby & Level 2</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <LifeBuoy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Pool</h3>
                  <p className="text-sm text-muted-foreground">Level 3</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Fitness Center</h3>
                  <p className="text-sm text-muted-foreground">Basement Level</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Emergency Info */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Emergency Information</h2>
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <div className="p-2 bg-red-100 rounded-lg">
                <DoorClosed className="h-5 w-5" />
              </div>
              <h3 className="font-medium">Emergency Exits</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Emergency exits are located at the end of each corridor on all floors. Follow the illuminated signs in case of evacuation.</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Emergency Contact</p>
                <p className="text-sm text-muted-foreground">Dial 9 from your room phone</p>
              </div>
              <Button variant="outline" size="sm">View Emergency Map</Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HotelMap;
