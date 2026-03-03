
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store } from 'lucide-react';
import { useShops } from '@/hooks/useShops';
import ShopsTab from '@/pages/admin/shops/ShopsTab';
import CategoriesTab from '@/pages/admin/shops/CategoriesTab';
import ProductsTab from '@/pages/admin/shops/ProductsTab';
import NearbyShopsTab from '@/pages/admin/shops/NearbyShopsTab';

const ShopsManager = () => {
  const [activeTab, setActiveTab] = useState('shops');

  return (
    <div className="p-6">
      <div id="admin-ob-shops-header" className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shop Management</h1>
          <p className="text-sm text-muted-foreground">Manage hotel shops, categories and products</p>
        </div>
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
