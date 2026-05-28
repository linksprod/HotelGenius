
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store } from 'lucide-react';
import { useShops } from '@/hooks/useShops';
import ShopsTab from './shops/ShopsTab';
import CategoriesTab from './shops/CategoriesTab';
import ProductsTab from './shops/ProductsTab';
import NearbyShopsTab from './shops/NearbyShopsTab';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

const ShopsManager = () => {
  const [activeTab, setActiveTab] = useState('shops');

  return (
    <div className="p-6">
      <div id="admin-ob-shops-header" className="mb-6">
        <AdminPageHeader
          title="Shop Management"
          description="Manage hotel shops, categories and products"
          icon={<Store className="h-5 w-5 text-primary" />}
        />
      </div>

      <Tabs defaultValue="shops" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="shops">Hotel Shops</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Centers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="shops">
          <ShopsTab />
        </TabsContent>

        <TabsContent value="nearby">
          <NearbyShopsTab />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShopsManager;
