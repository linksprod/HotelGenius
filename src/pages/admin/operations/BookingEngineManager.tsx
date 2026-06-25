import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

const BookingEngineManager = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 px-8 pt-8">
      {/* Header */}
      <AdminPageHeader
        title="Booking Engine"
        description="Manage direct, commission-free room bookings for your hotel."
        icon={<CreditCard className="h-5 w-5 text-primary" />}
      />

      {/* On Request Placeholder Card */}
      <Card className="border-border/60 shadow-md bg-card overflow-hidden relative">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        
        <CardContent className="flex flex-col items-center justify-center py-24 text-center relative z-10">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-primary/5 transition-all duration-300 hover:scale-105">
            <CreditCard className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground tracking-tight">On request</h2>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            This module is currently configured as "On request". Direct booking engine services and integration setup are not active at this time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingEngineManager;
