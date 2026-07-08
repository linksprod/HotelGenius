import React, { useState, useEffect } from 'react';
import { useAboutData } from '@/hooks/useAboutData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Award, Plus, Trash2, Check, HelpCircle } from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { LoyaltyTier, LoyaltyBenefit } from '@/lib/types';

const defaultTiers: LoyaltyTier[] = [
  { name: "Bronze", points: "0 - 1000 pts" },
  { name: "Silver", points: "1000 - 3000 pts" },
  { name: "Gold", points: "3000 - 6000 pts" },
  { name: "VIP", points: "6,000+ pts" }
];

const defaultBenefits: LoyaltyBenefit[] = [
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

const LoyaltyEditor = () => {
  const { aboutData, isLoadingAbout, aboutError, updateAboutData } = useAboutData();
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('Loyalty Program');
  const [description, setDescription] = useState('');
  const [tiers, setTiers] = useState<LoyaltyTier[]>(defaultTiers);
  const [benefits, setBenefits] = useState<LoyaltyBenefit[]>(defaultBenefits);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (aboutData) {
      setEnabled(!!aboutData.loyalty_enabled);
      setTitle(aboutData.loyalty_title || 'Loyalty Program');
      setDescription(aboutData.loyalty_description || '');
      
      if (aboutData.loyalty_tiers && aboutData.loyalty_tiers.length > 0) {
        setTiers(aboutData.loyalty_tiers);
      } else {
        setTiers(defaultTiers);
      }

      if (aboutData.loyalty_benefits && aboutData.loyalty_benefits.length > 0) {
        setBenefits(aboutData.loyalty_benefits);
      } else {
        setBenefits(defaultBenefits);
      }
    }
  }, [aboutData]);

  if (isLoadingAbout) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading loyalty settings...</span>
      </div>
    );
  }

  if (aboutError) {
    return (
      <Card className="p-8 m-4 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Error Loading Settings</h2>
        <p>{aboutError.message}</p>
      </Card>
    );
  }

  if (!aboutData) {
    return (
      <Card className="p-8 m-4 text-center">
        <h2 className="text-xl font-bold mb-4">No Data Found</h2>
        <p>Please configure the general About page first.</p>
      </Card>
    );
  }

  const handleAddBenefit = () => {
    const newValues = Array(tiers.length).fill('—');
    setBenefits([...benefits, { name: 'New Benefit', values: newValues }]);
  };

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, idx) => idx !== index);
    setBenefits(newBenefits);
  };

  const handleBenefitNameChange = (index: number, newName: string) => {
    const newBenefits = [...benefits];
    newBenefits[index].name = newName;
    setBenefits(newBenefits);
  };

  const handleCellValueChange = (benefitIdx: number, tierIdx: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[benefitIdx].values[tierIdx] = value;
    setBenefits(newBenefits);
  };

  const handleTierNameChange = (tierIdx: number, name: string) => {
    const newTiers = [...tiers];
    newTiers[tierIdx].name = name;
    setTiers(newTiers);
  };

  const handleTierPointsChange = (tierIdx: number, points: string) => {
    const newTiers = [...tiers];
    newTiers[tierIdx].points = points;
    setTiers(newTiers);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAboutData({
        ...aboutData,
        loyalty_enabled: enabled,
        loyalty_title: title,
        loyalty_description: description,
        loyalty_tiers: tiers,
        loyalty_benefits: benefits
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Loyalty Program Settings"
        description="Configure how the loyalty tiers and benefits table is displayed in the guest About Us section."
        icon={<Award className="h-5 w-5 text-primary" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Program Visibility</CardTitle>
          <CardDescription>
            Toggle display of the loyalty program section on the public facing About Us page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Switch
            id="loyalty-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label htmlFor="loyalty-enabled" className="text-base font-semibold cursor-pointer">
            {enabled ? 'Loyalty program section is ACTIVE on the public website' : 'Loyalty program section is HIDDEN'}
          </Label>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
            <CardDescription>Modify heading text displayed above the tier benefits grid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loyalty-title">Section Title</Label>
              <Input
                id="loyalty-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Loyalty Program, Benefits & Tiers..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loyalty-description">Section Description</Label>
              <Textarea
                id="loyalty-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief introduction explaining how the program works..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Tier Headings</CardTitle>
            <CardDescription>Customize tier names and point requirements (column headers).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tiers.map((tier, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <span className="font-bold text-xs uppercase text-muted-foreground w-16">Tier {idx + 1}</span>
                <div className="flex-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={tier.name}
                    onChange={(e) => handleTierNameChange(idx, e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Requirement</Label>
                  <Input
                    value={tier.points}
                    onChange={(e) => handleTierPointsChange(idx, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Benefits Grid & Matrix</CardTitle>
            <CardDescription>
              Configure benefits (rows) and define values for each tier. Use "✓" for active features or customize status with text (e.g. "5% Off").
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddBenefit} className="flex gap-1.5 items-center">
            <Plus className="h-4 w-4" /> Add Benefit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[300px]">Benefits & Tiers</TableHead>
                  {tiers.map((tier, idx) => (
                    <TableHead key={idx} className="text-center font-bold text-foreground min-w-[120px]">
                      {tier.name}
                      <span className="block text-[10px] text-muted-foreground font-normal normal-case mt-0.5">
                        {tier.points}
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.map((benefit, benefitIdx) => (
                  <TableRow key={benefitIdx} className="hover:bg-muted/10">
                    <TableCell className="font-medium">
                      <Input
                        value={benefit.name}
                        onChange={(e) => handleBenefitNameChange(benefitIdx, e.target.value)}
                        className="font-medium bg-transparent border-none shadow-none focus-visible:ring-1 focus-visible:bg-background h-8"
                      />
                    </TableCell>
                    {tiers.map((_, tierIdx) => (
                      <TableCell key={tierIdx} className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Input
                            value={benefit.values[tierIdx] || '—'}
                            onChange={(e) => handleCellValueChange(benefitIdx, tierIdx, e.target.value)}
                            className="w-24 text-center h-8 bg-transparent border-none shadow-none focus-visible:ring-1 focus-visible:bg-background"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-40 hover:opacity-100"
                            title="Toggle Checkmark"
                            onClick={() => {
                              const curr = benefit.values[tierIdx];
                              const newVal = curr === '✓' ? '—' : '✓';
                              handleCellValueChange(benefitIdx, tierIdx, newVal);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive opacity-40 hover:opacity-100"
                        onClick={() => handleRemoveBenefit(benefitIdx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving changes...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
};

export default LoyaltyEditor;
