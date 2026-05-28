import React, { useState } from 'react';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { usePricingModel, BillingCycle, PlanTier } from '@/hooks/usePricingModel';
import { motion } from 'framer-motion';
import { Check, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

const FEATURES = {
  essential: [
    'Digital Hotel Directory',
    'Cashless Digital Tipping',
    'Guest Chat (Limited AI Concierge)',
    '130+ Languages Translation',
    'Contactless Feedback',
    'Activities & Animation Program',
    'Essential Staff Dashboard',
  ],
  experience: [
    'Everything in Essential',
    'Unlimited Omnichannel (WhatsApp, Web)',
    'F&B Ordering & Spa Booking',
    'Activities Booking',
    'Guest 360° Profiles',
    'Automated Task Routing',
    'Digital Check-in & Payment',
    'Web App as Hotel Website',
    'Advanced Console',
  ],
  elite: [
    'Everything in Experience',
    'Booking Engine',
    'AI Smart Upselling',
    'Social Paid Booking / Ads',
    'Advanced Guest Profiling',
    'Multi-property Dashboard',
    'Auto Task Escalations',
    'Revenue Analytics & AEO',
  ],
};

const PLAN_LABELS: Record<PlanTier, string> = {
  essential: 'Essential',
  experience: 'Experience',
  elite: 'Elite',
};

const PLAN_DESCRIPTIONS: Record<PlanTier, string> = {
  essential: 'Zero risk. Test the waters.',
  experience: 'Predictable costs, keep revenue.',
  elite: 'Advanced automation & maximum revenue.',
};

const BillingManager: React.FC = () => {
  const { hotel, refreshHotel } = useHotel();
  const { calculatePlans } = usePricingModel();
  const [isUpdating, setIsUpdating] = useState(false);

  const [rooms, setRooms] = useState<number>(50);
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [vpsAddons, setVpsAddons] = useState<Record<PlanTier, boolean>>({
    essential: false,
    experience: false,
    elite: false,
  });

  const plans = calculatePlans(rooms);
  const currentPlan = (hotel?.plan as PlanTier) || 'essential';

  const handlePlanChange = async (tierName: PlanTier) => {
    if (!hotel?.id) return;
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('hotels')
        .update({ plan: tierName })
        .eq('id', hotel.id);
        
      if (error) throw error;
      
      toast({
        title: 'Plan Updated',
        description: `Your plan has been successfully changed to ${PLAN_LABELS[tierName]}.`,
      });
      refreshHotel();
    } catch (err) {
      console.error("Error updating plan:", err);
      toast({
        title: 'Error',
        description: 'Failed to update plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleVps = (tier: PlanTier, checked: boolean) => {
    setVpsAddons(prev => ({ ...prev, [tier]: checked }));
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-12 animate-in fade-in duration-500 pb-16 px-4 md:px-8">
      
      {/* ─── Header ─── */}
      <AdminPageHeader
        title="Billing & Plans"
        description="Your pricing scales automatically based on your property size. Upgrade your plan to unlock strategic wealth creation tools."
        icon={<CreditCard className="h-5 w-5 text-primary" />}
        actions={
          <Button variant="outline" className="shrink-0 gap-2 rounded-xl h-10 px-4 border-border/40 hover:bg-muted/50">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span>Bank Transfer Details</span>
          </Button>
        }
      />

      {/* ─── Configurator (Dark / Minimal) ─── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between mb-8">
        
        {/* Slider Section */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="font-bold tracking-widest text-muted-foreground uppercase text-[10px]">Hotel Size (Rooms)</span>
            <span className="text-base"><span className="text-white text-lg font-bold">{rooms}</span> <span className="text-muted-foreground text-xs">Rooms</span></span>
          </div>
          <Slider
            defaultValue={[50]}
            max={1000}
            min={50}
            step={10}
            value={[rooms]}
            onValueChange={(vals) => setRooms(vals[0])}
            className="py-1"
          />
        </div>

        {/* Currency Section (Mock) */}
        <div className="space-y-3">
          <span className="font-bold tracking-widest text-muted-foreground uppercase text-[10px] block">Currency</span>
          <Button variant="outline" className="bg-[#121212] border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-white text-xs h-9 text-white">
            USD ($) <span className="text-[10px] ml-1">▼</span>
          </Button>
        </div>

        {/* Toggle Section */}
        <div className="space-y-3">
          <span className="font-bold tracking-widest text-muted-foreground uppercase text-[10px] block">Billing Cycle</span>
          <div className="flex p-1 bg-[#121212] border border-[#2a2a2a] rounded-xl relative self-start lg:self-end">
            {(['monthly', 'semi-annual', 'annual'] as BillingCycle[]).map((c) => {
              const isActive = cycle === c;
              return (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    "relative px-4 py-1.5 text-xs font-medium rounded-lg transition-all",
                    isActive ? "bg-[#1f2937] text-white shadow-sm ring-1 ring-[#374151]" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className="capitalize">{c === 'semi-annual' ? 'Semi Annual' : c}</span>
                    {c === 'semi-annual' && <span className="text-[9px] text-muted-foreground font-normal mt-0.5">1 Month Free</span>}
                    {c === 'annual' && <span className="text-[9px] text-amber-500 font-semibold tracking-wide mt-0.5">2 Months Free</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Pricing Cards ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isCurrent = currentPlan === plan.tier;
          const isElite = plan.tier === 'elite';
          const isEssential = plan.tier === 'essential';
          const basePrice = cycle === 'semi-annual' ? plan.semiAnnual : plan[cycle];
          const hasVps = vpsAddons[plan.tier];
          const finalPrice = basePrice + (hasVps ? 54 : 0);

          return (
            <motion.div 
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={cn(
                "relative flex flex-col rounded-2xl p-4 sm:p-5 transition-all duration-300",
                "bg-[#0a0a0a] border border-[#1f1f1f] shadow-lg",
                isCurrent && "ring-1 ring-primary/50"
              )}
            >
              {/* Top Badges (Premium / Current) */}
              {isElite && (
                <div className="absolute -top-3 inset-x-0 flex justify-center">
                  <span className="bg-[#a8b8b0] text-[#1a2e25] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    Premium
                  </span>
                </div>
              )}

              {/* Promo Banner */}
              <div className="bg-[#0f172a] border border-[#1e293b] text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded mb-2 w-fit inline-block leading-tight">
                30% Off All Plans! Ends May 31, 2026.
              </div>

              {/* Free Trial Badge (Essential) */}
              {isEssential && (
                <div className="bg-[#1e293b] text-[#94a3b8] text-[10px] font-semibold px-2 py-0.5 rounded mb-2 w-fit inline-block leading-tight">
                  1 MONTH FREE TRIAL
                </div>
              )}

              {/* Header */}
              <div className="mb-2 space-y-0.5">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {PLAN_LABELS[plan.tier]}
                </h3>
                <p className="text-[12px] text-muted-foreground leading-snug">
                  {PLAN_DESCRIPTIONS[plan.tier]}
                </p>
              </div>

              {/* Price */}
              <div className="mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white tracking-tight">${finalPrice}</span>
                  <span className="text-muted-foreground text-xs font-medium">/mo</span>
                </div>
                <div className="text-[10px] text-amber-500 font-medium mt-0.5">
                  Billed {cycle.replace('-', ' ')}
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 pt-3 border-t border-[#1f1f1f]">
                {isElite && (
                  <div className="p-2 bg-[#121212] border border-[#2a2a2a] rounded mb-3">
                    <p className="text-[10px] text-muted-foreground leading-snug">Advanced automation & maximum revenue.</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {FEATURES[plan.tier].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-muted-foreground shrink-0 mt-[3px]" />
                      <span className="text-[11px] text-[#d1d5db] leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VPS Addon Toggle */}
              <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center justify-between mb-3">
                <div>
                  <p className="text-[12px] font-semibold text-white">Custom Domain & Private VPS <span className="text-muted-foreground ml-1">ⓘ</span></p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">+$54/mo</p>
                </div>
                <Switch 
                  checked={vpsAddons[plan.tier]}
                  onCheckedChange={(checked) => toggleVps(plan.tier, checked)}
                  className="data-[state=checked]:bg-blue-600 scale-75 origin-right"
                />
              </div>

              {/* Action Button - Moved to bottom */}
              <Button
                variant={isCurrent ? "outline" : "secondary"}
                className={cn(
                  "w-full rounded-xl font-medium h-9 text-xs",
                  isCurrent ? "bg-[#121212] border-[#2a2a2a] text-muted-foreground hover:bg-[#1a1a1a]" : 
                  "bg-[#1f2937] text-white hover:bg-[#374151]"
                )}
                disabled={isCurrent || isUpdating}
                onClick={() => !isCurrent && handlePlanChange(plan.tier)}
              >
                {isCurrent ? (
                  'Active Plan'
                ) : isUpdating ? (
                  'Processing...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {`Choose ${PLAN_LABELS[plan.tier]}`}
                  </span>
                )}
              </Button>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
};

export default BillingManager;
