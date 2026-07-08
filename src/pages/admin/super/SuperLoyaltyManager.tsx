import React, { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Award, Plus, Trash2, Check, Building2, Save, ChevronRight, Share2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { toast } from '@/hooks/use-toast';
import { LoyaltyTier, LoyaltyBenefit } from '@/lib/types';
import { transformAboutData, prepareDataForUpdate } from '@/utils/hotelAbout/transformUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Hotel {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  primary_color?: string | null;
}

const DEFAULT_TIERS: LoyaltyTier[] = [
  { name: "Bronze", points: "0 - 1000 pts" },
  { name: "Silver", points: "1000 - 3000 pts" },
  { name: "Gold", points: "3000 - 6000 pts" },
  { name: "VIP", points: "6,000+ pts" }
];

const DEFAULT_BENEFITS: LoyaltyBenefit[] = [
  { name: "Points Required", values: ["0 - 1000 pts", "1000 - 3000 pts", "3000 - 6000 pts", "6,000+ pts"] },
  { name: "In-App Service Discount", values: ["—", "5% Off", "10% Off", "15% Off"] },
  { name: "24/7 AI Concierge Access", values: ["✓", "✓", "✓", "✓"] },
  { name: "Premium High-Speed Wi-Fi", values: ["✓", "✓", "✓", "✓"] },
  { name: "Complimentary Welcome Drink", values: ["—", "✓", "✓", "✓"] },
  { name: "Early Check-in (Subject to availability)", values: ["—", "—", "✓", "✓"] },
  { name: "Guaranteed Late Check-out (Until 1:00 PM)", values: ["—", "—", "—", "✓"] },
  { name: "VIP Welcome In-Room Gift", values: ["—", "—", "—", "✓"] },
  { name: "Priority Support Canal", values: ["—", "—", "—", "✓"] }
];

const SuperLoyaltyManager: React.FC = () => {
  // Hotel selection
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // About data & loyalty fields
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [loadingAbout, setLoadingAbout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Loyalty fields
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('Loyalty Program');
  const [description, setDescription] = useState('');
  const [tiers, setTiers] = useState<LoyaltyTier[]>(DEFAULT_TIERS);
  const [benefits, setBenefits] = useState<LoyaltyBenefit[]>(DEFAULT_BENEFITS);

  // Load all hotels
  useEffect(() => {
    const fetchHotels = async () => {
      setLoadingHotels(true);
      const { data, error } = await supabaseAdmin
        .from('hotels')
        .select('id, name, slug, logo_url, primary_color')
        .order('name', { ascending: true });
      if (!error && data) setHotels(data);
      setLoadingHotels(false);
    };
    fetchHotels();
  }, []);

  // Load hotel's about data when hotel changes
  const loadAboutData = useCallback(async (hotelId: string) => {
    setLoadingAbout(true);
    setAboutId(null);
    setEnabled(false);
    setTitle('Loyalty Program');
    setDescription('');
    setTiers(DEFAULT_TIERS);
    setBenefits(DEFAULT_BENEFITS);

    const { data, error } = await supabase
      .from('hotel_about')
      .select('*')
      .eq('hotel_id', hotelId)
      .maybeSingle();

    if (!error && data) {
      const transformed = transformAboutData(data);
      setAboutId(data.id);
      setEnabled(!!transformed.loyalty_enabled);
      setTitle(transformed.loyalty_title || 'Loyalty Program');
      setDescription(transformed.loyalty_description || '');
      if (transformed.loyalty_tiers && transformed.loyalty_tiers.length > 0) {
        setTiers(transformed.loyalty_tiers);
      }
      if (transformed.loyalty_benefits && transformed.loyalty_benefits.length > 0) {
        setBenefits(transformed.loyalty_benefits);
      }
    }
    setLoadingAbout(false);
  }, []);

  const handleHotelSelect = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    const hotel = hotels.find(h => h.id === hotelId) || null;
    setSelectedHotel(hotel);
    loadAboutData(hotelId);
  };

  const handleSave = async () => {
    if (!aboutId) {
      toast({ title: 'Error', description: 'No About page data found for this hotel. Please visit the hotel admin first to initialize the About page.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload = prepareDataForUpdate({
        id: aboutId,
        loyalty_enabled: enabled,
        loyalty_title: title,
        loyalty_description: description,
        loyalty_tiers: tiers,
        loyalty_benefits: benefits,
      });

      const { error } = await supabase
        .from('hotel_about')
        .update(updatePayload)
        .eq('id', aboutId);

      if (error) throw error;

      toast({
        title: '✅ Saved successfully!',
        description: `Loyalty program for ${selectedHotel?.name} has been updated.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyToAll = async () => {
    setIsSaving(true);
    try {
      let updatedCount = 0;
      let insertedCount = 0;

      // 1. Fetch all existing hotel_about rows to identify existing profiles
      const { data: existingAbouts, error: fetchErr } = await supabaseAdmin
        .from('hotel_about')
        .select('id, hotel_id');

      if (fetchErr) throw fetchErr;

      const aboutMap = new Map(existingAbouts?.map(a => [a.hotel_id, a.id]) || []);

      // 2. Process all hotels
      for (const hotel of hotels) {
        const aboutRowId = aboutMap.get(hotel.id);

        if (aboutRowId) {
          // Update existing hotel about profile
          const updatePayload = prepareDataForUpdate({
            id: aboutRowId,
            loyalty_enabled: enabled,
            loyalty_title: title,
            loyalty_description: description,
            loyalty_tiers: tiers,
            loyalty_benefits: benefits,
          });

          const { error: updErr } = await supabaseAdmin
            .from('hotel_about')
            .update(updatePayload)
            .eq('id', aboutRowId);

          if (updErr) throw updErr;
          updatedCount++;
        } else {
          // Create new hotel about profile with default settings + these loyalty settings
          const insertPayload = {
            hotel_id: hotel.id,
            welcome_title: `Welcome to ${hotel.name}`,
            welcome_description: 'A luxury hotel experience in the heart of the city.',
            welcome_description_extended: 'Since our establishment, we have been committed to creating a home away from home for our guests.',
            mission: 'To provide exceptional hospitality experiences by creating memorable moments for guests.',
            hero_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80',
            hero_title: `Welcome to ${hotel.name}`,
            hero_subtitle: 'Discover luxury and comfort',
            directory_title: 'Hotel Directory & Information',
            important_numbers: [
              { label: 'Reception', value: 'Dial 0' },
              { label: 'Room Service', value: 'Dial 1' },
              { label: 'Concierge', value: 'Dial 2' }
            ],
            facilities: [
              { label: 'Swimming Pool', value: 'Level 5' },
              { label: 'Fitness Center', value: 'Level 3' },
              { label: 'Spa & Wellness', value: 'Level 4' }
            ],
            hotel_policies: [
              { label: 'Check-in', value: '3:00 PM' },
              { label: 'Check-out', value: '12:00 PM' },
              { label: 'Breakfast', value: '6:30 AM - 10:30 AM' }
            ],
            additional_info: [
              { label: 'Wi-Fi', value: `Network "${hotel.name}" - Password provided at check-in` },
              { label: 'Parking', value: 'Valet service available' }
            ],
            features: [
              { icon: 'History', title: 'Our History', description: 'Established with a rich heritage' },
              { icon: 'Building2', title: 'Our Property', description: 'Luxury rooms and premium facilities' },
              { icon: 'Users', title: 'Our Team', description: 'Dedicated staff committed to excellence' },
              { icon: 'Award', title: 'Our Awards', description: 'Recognized for outstanding service' }
            ],
            has_seminars: false,
            seminar_description: '',
            seminar_image: '',
            seminar_services: [],
            seminar_rooms: [],
            loyalty_enabled: enabled,
            loyalty_title: title,
            loyalty_description: description,
            loyalty_tiers: tiers,
            loyalty_benefits: benefits,
          };

          const { error: insErr } = await supabaseAdmin
            .from('hotel_about')
            .insert(insertPayload);

          if (insErr) throw insErr;
          insertedCount++;
        }
      }

      toast({
        title: '✅ Applied to all hotels!',
        description: `Successfully configured loyalty program for all ${hotels.length} hotels (Updated: ${updatedCount}, Created: ${insertedCount}).`,
      });

      // Refresh current hotel's state
      if (selectedHotelId) {
        loadAboutData(selectedHotelId);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Application failed', description: message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Matrix helpers
  const handleAddBenefit = () => {
    setBenefits([...benefits, { name: 'New Benefit', values: Array(tiers.length).fill('—') }]);
  };
  const handleRemoveBenefit = (idx: number) => setBenefits(benefits.filter((_, i) => i !== idx));
  const handleBenefitName = (idx: number, name: string) => {
    const next = [...benefits]; next[idx].name = name; setBenefits(next);
  };
  const handleCell = (bIdx: number, tIdx: number, val: string) => {
    const next = [...benefits]; next[bIdx].values[tIdx] = val; setBenefits(next);
  };
  const handleTierName = (idx: number, name: string) => {
    const next = [...tiers]; next[idx].name = name; setTiers(next);
  };
  const handleTierPoints = (idx: number, points: string) => {
    const next = [...tiers]; next[idx].points = points; setTiers(next);
  };
  const toggleCheck = (bIdx: number, tIdx: number) => {
    const curr = benefits[bIdx].values[tIdx];
    handleCell(bIdx, tIdx, curr === '✓' ? '—' : '✓');
  };

  // Tier color palette (visual only)
  const tierColors = ['from-amber-600 to-yellow-500', 'from-slate-400 to-gray-300', 'from-yellow-500 to-amber-400', 'from-purple-500 to-violet-400'];

  return (
    <div className="flex-1 space-y-6 p-6">
      <AdminPageHeader
        title="Loyalty Program Manager"
        description="Select a hotel and configure its loyalty tier program. Changes will be reflected on the hotel's public About Us page."
        icon={<Award className="h-5 w-5 text-primary" />}
      />

      {/* Step 1 – Hotel Selector */}
      <Card className="border-2 border-primary/20 bg-primary/2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <CardTitle className="text-base">Select a Hotel</CardTitle>
          </div>
          <CardDescription>Choose which hotel's loyalty program you want to configure.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHotels ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading hotels...</div>
          ) : (
            <Select value={selectedHotelId} onValueChange={handleHotelSelect}>
              <SelectTrigger className="max-w-sm h-11 text-base" id="hotel-select">
                <SelectValue placeholder="— Choose a hotel —" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map(hotel => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full shrink-0"
                        style={{ backgroundColor: hotel.primary_color || '#6366f1' }}
                      />
                      <span className="font-medium">{hotel.name}</span>
                      <span className="text-muted-foreground text-xs font-mono">/{hotel.slug}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Step 2 – Editor (only shown when a hotel is selected) */}
      {selectedHotel && (
        <>
          {loadingAbout ? (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span>Loading {selectedHotel.name}'s loyalty settings...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Hotel context banner */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border text-sm">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0"
                  style={{ backgroundColor: selectedHotel.primary_color || '#6366f1' }}
                >
                  {selectedHotel.name[0].toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-foreground">{selectedHotel.name}</span>
                  <span className="text-muted-foreground ml-2 font-mono text-xs">/{selectedHotel.slug}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                <span className="text-muted-foreground">Loyalty Program Configuration</span>
                {!aboutId && (
                  <span className="ml-auto px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium">
                    ⚠️ No About page initialized yet
                  </span>
                )}
              </div>

              {/* Step 2 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">2</div>
                    <CardTitle className="text-base">Enable & Configure</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Toggle */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                    <Switch id="loyalty-toggle" checked={enabled} onCheckedChange={setEnabled} />
                    <div>
                      <Label htmlFor="loyalty-toggle" className="text-base font-semibold cursor-pointer">
                        {enabled ? '✅ Visible on the About Us page' : '⛔ Hidden from the About Us page'}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Toggle to show or hide the loyalty section for {selectedHotel.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="loyalty-title">Section Title</Label>
                      <Input id="loyalty-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Loyalty Program" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loyalty-desc">Introduction Text</Label>
                      <Textarea id="loyalty-desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the program briefly..." />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 – Tiers */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">3</div>
                    <CardTitle className="text-base">Loyalty Tiers (Column Headers)</CardTitle>
                  </div>
                  <CardDescription>Define the tier names and point thresholds.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tiers.map((tier, idx) => (
                      <div key={idx} className={`relative rounded-xl overflow-hidden border-2 border-transparent bg-gradient-to-br ${tierColors[idx % tierColors.length]} p-0.5`}>
                        <div className="bg-card rounded-[10px] p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Tier {idx + 1}</span>
                          </div>
                          <div className="space-y-2">
                            <Input value={tier.name} onChange={e => handleTierName(idx, e.target.value)} placeholder="Tier name" className="font-bold" />
                            <Input value={tier.points} onChange={e => handleTierPoints(idx, e.target.value)} placeholder="e.g. 0 – 1000 pts" className="text-sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 – Benefits Matrix */}
              <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">4</div>
                      <CardTitle className="text-base">Benefits & Advantages Matrix</CardTitle>
                    </div>
                    <CardDescription className="ml-9">
                      Each row = one benefit. Each column = one tier. Use <code className="bg-muted px-1 rounded text-xs">✓</code> for included, <code className="bg-muted px-1 rounded text-xs">—</code> for excluded, or custom text like <code className="bg-muted px-1 rounded text-xs">5% Off</code>.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddBenefit} className="gap-1.5 shrink-0">
                    <Plus className="h-4 w-4" /> Add Row
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="min-w-[220px] font-semibold">Benefit Name</TableHead>
                          {tiers.map((tier, i) => (
                            <TableHead key={i} className="text-center font-bold min-w-[130px]">
                              <span className="block text-foreground">{tier.name}</span>
                              <span className="block text-[10px] text-muted-foreground font-normal">{tier.points}</span>
                            </TableHead>
                          ))}
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {benefits.map((benefit, bIdx) => (
                          <TableRow key={bIdx} className="hover:bg-muted/10">
                            <TableCell>
                              <Input
                                value={benefit.name}
                                onChange={e => handleBenefitName(bIdx, e.target.value)}
                                className="h-8 border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background font-medium"
                              />
                            </TableCell>
                            {tiers.map((_, tIdx) => (
                              <TableCell key={tIdx} className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    value={benefit.values[tIdx] ?? '—'}
                                    onChange={e => handleCell(bIdx, tIdx, e.target.value)}
                                    className="w-20 h-8 text-center border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-30 hover:opacity-100 shrink-0"
                                    title="Toggle ✓/—"
                                    onClick={() => toggleCheck(bIdx, tIdx)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            ))}
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-40 hover:opacity-100" onClick={() => handleRemoveBenefit(bIdx)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Save & Apply to All buttons */}
              <div className="flex justify-end gap-4 pb-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2 px-6" disabled={isSaving}>
                      <Share2 className="h-4 w-4" /> Apply to All Hotels
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apply to all hotels?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will copy the loyalty program settings (Tiers, Benefits, and visibility toggle) from **{selectedHotel.name}** to **all other hotels** on the platform. Existing loyalty configurations for other hotels will be overwritten.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApplyToAll}>
                        Yes, apply to all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button onClick={handleSave} disabled={isSaving || !aboutId} size="lg" className="gap-2 px-8">
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save for {selectedHotel.name}</>}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {/* Empty state when no hotel selected */}
      {!selectedHotel && !loadingHotels && (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <p className="font-semibold text-foreground text-lg">Select a hotel to get started</p>
          <p className="text-sm mt-1">Choose a hotel from the dropdown above to configure its loyalty program.</p>
        </div>
      )}
    </div>
  );
};

export default SuperLoyaltyManager;
