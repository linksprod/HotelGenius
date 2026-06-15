import React from 'react';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, MessageSquare, MonitorSmartphone } from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

export default function LiveApp() {
  const { hotel } = useHotel();
  const appUrl = `${window.location.origin}/${hotel?.slug}`;

  return (
    <div className="p-6 space-y-6 w-full">
      <AdminPageHeader
        title="Live App"
        description="View and manage your hotel's public application."
        icon={<MonitorSmartphone className="h-5 w-5 text-primary" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle>Your App Link</CardTitle>
            <CardDescription>Share this link or QR code with your guests</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex flex-col items-center">
            <a href={appUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-primary hover:underline truncate w-full text-center">
              {appUrl}
            </a>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appUrl)}`} 
                alt="App QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">Guests can scan this QR code to access your hotel's services directly.</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Guests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-4xl font-bold">24</div>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <span className="text-emerald-500 font-medium mr-1">+3</span> since yesterday
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-4xl font-bold">2</div>
                  <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
