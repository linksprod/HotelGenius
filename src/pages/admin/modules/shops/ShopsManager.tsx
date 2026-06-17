
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store } from 'lucide-react';
import { useShops } from '@/hooks/useShops';
import ShopsTab from './shops/ShopsTab';
import ProductsTab from './shops/ProductsTab';
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
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="shops">Hotel Shops</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="shops">
          <ShopsTab />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShopsManager;
