import React, { useState, useEffect } from 'react';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Utensils, Sparkles, PartyPopper, Store, Lock, Layers, Coins, Users, MessageSquare, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

export default function ModuleSettings() {
  const { hotel, refreshHotel } = useHotel();
  const [modules, setModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hotel?.active_modules) {
      setModules(hotel.active_modules);
    } else {
      setModules(['restaurants', 'spa', 'events', 'shops']);
    }
  }, [hotel]);

  const toggleModule = async (moduleName: string, enabled: boolean) => {
    if (!hotel?.id) return;
    
    const newModules = enabled 
      ? [...modules, moduleName]
      : modules.filter(m => m !== moduleName);
      
    setModules(newModules);
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('hotels')
        .update({ active_modules: newModules })
        .eq('id', hotel.id);
        
      if (error) throw error;
      
      toast.success('Modules updated successfully');
      refreshHotel();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error('Failed to update modules: ' + err.message);
      setModules(modules);
    } finally {
      setIsLoading(false);
    }
  };

  const hasModule = (name: string) => modules.includes(name);

  const availableModules = [
    { id: 'restaurants', name: 'Restaurants & F&B', icon: Utensils, description: 'Enable food and beverage management, menus, and orders.', requiredPlan: 'experience' },
    { id: 'spa', name: 'Spa & Wellness', icon: Sparkles, description: 'Manage spa treatments, wellness facilities, and bookings.', requiredPlan: 'experience' },
    { id: 'events', name: 'Events & Entertainment', icon: PartyPopper, description: 'Organize hotel events, activities, and entertainment.', requiredPlan: 'essential' },
    { id: 'shops', name: 'Shops & Retail', icon: Store, description: 'Manage hotel shops, boutiques, and retail items.', requiredPlan: 'experience' },
    { id: 'tipping', name: 'Digital Tipping', icon: Coins, description: 'Cashless tipping for departments and specific staff members.', requiredPlan: 'essential' },
    { id: 'directory', name: 'Guest Directory', icon: Users, description: 'Digital hotel compendium and CRM guest profiles.', requiredPlan: 'essential' },
    { id: 'feedback', name: 'Feedback & NPS', icon: MessageSquare, description: 'Automated guest sentiment and survey collection.', requiredPlan: 'essential' },
    { id: 'booking', name: 'Booking Engine', icon: CreditCard, description: 'Direct commission-free room bookings on your app.', requiredPlan: 'elite' },
    { id: 'multiproperty', name: 'Multi-property', icon: Building2, description: 'Manage multiple hotels from a single unified console.', requiredPlan: 'elite' },
  ];

  const currentPlan = hotel?.plan || 'essential';
  const isExperienceOrElite = currentPlan === 'experience' || currentPlan === 'elite';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <AdminPageHeader
        title="Module Settings"
        description="Turn hotel features on or off based on your offerings."
        icon={<Layers className="h-5 w-5 text-primary" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableModules.map(mod => {
          const isEnabled = hasModule(mod.id);
          const requiresExperienceForBooking = mod.requiredPlan === 'experience';
          const isEssential = currentPlan === 'essential';
          const isDisplayOnly = isEssential && requiresExperienceForBooking;

          return (
            <Card key={mod.id} className={`transition-all duration-300 border bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${isEnabled ? 'border-primary/40 shadow-md ring-1 ring-primary/10' : 'border-border/50 opacity-80'}`}>
              <CardHeader className="p-5 flex flex-row items-start justify-between space-y-0 relative">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${isEnabled ? 'bg-primary/10 text-primary shadow-inner' : 'bg-muted text-muted-foreground'}`}>
                    <mod.icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      {mod.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      {isDisplayOnly ? (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold flex items-center gap-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 rounded-md px-2">
                          <Lock className="w-3 h-3" />
                          Display Only
                        </Badge>
                      ) : isEnabled ? (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 rounded-md px-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold rounded-md px-2 text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                      
                      {mod.requiredPlan === 'elite' && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-black bg-gradient-to-r from-slate-800 to-slate-900 text-white border-none rounded-md px-2 shadow-sm">
                          Elite
                        </Badge>
                      )}
                      {mod.requiredPlan === 'experience' && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-600 border-blue-500/20 rounded-md px-2">
                          Experience+
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Switch 
                  checked={isEnabled}
                  onCheckedChange={(checked) => toggleModule(mod.id, checked)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 ml-[4.25rem]">
                <CardDescription className="text-[13px] leading-relaxed text-muted-foreground font-medium">
                  {mod.description}
                  {isDisplayOnly && (
                    <span className="block mt-2 text-xs font-semibold text-amber-600 dark:text-amber-500">
                      Guests can view menus & directories. Upgrade to the Experience plan to enable direct bookings and orders.
                    </span>
                  )}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
