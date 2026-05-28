import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Heart, Sparkles, BedDouble, UtensilsCrossed, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Department = 'housekeeping' | 'dining' | 'spa' | 'concierge' | 'other';

const DEPARTMENTS = [
  { id: 'housekeeping', label: 'Housekeeping', icon: BedDouble },
  { id: 'dining', label: 'Restaurant & Bar', icon: UtensilsCrossed },
  { id: 'spa', label: 'Spa & Wellness', icon: Sparkles },
  { id: 'concierge', label: 'Concierge', icon: BellRing },
] as const;

const AMOUNTS = [5, 10, 20];

const DigitalTipping = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleSendTip = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!selectedDept || !amount || amount <= 0) {
      toast.error('Please select a department and valid amount.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Tip sent successfully! Thank you for your generosity.');
    }, 1500);
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground max-w-sm mb-8">
            Your generous tip has been securely sent to the selected team. Your appreciation means the world to our staff.
          </p>
          <Button 
            onClick={() => navigate(resolvePath('/'))}
            className="w-full max-w-xs rounded-xl h-12"
          >
            Return Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b border-border/40">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Digital Tipping</h1>
            <p className="text-xs text-muted-foreground">Show appreciation to our staff</p>
          </div>
        </div>

        <div className="p-4 space-y-8 animate-in fade-in duration-300">
          
          {/* Department Selection */}
          <section className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Who would you like to tip?</Label>
            <div className="grid grid-cols-2 gap-3">
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept === dept.id;
                return (
                  <Card 
                    key={dept.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-2 overflow-hidden",
                      isSelected ? "border-primary bg-primary/5" : "border-transparent bg-card hover:border-primary/20"
                    )}
                    onClick={() => setSelectedDept(dept.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                      <div className={cn(
                        "p-3 rounded-full transition-colors",
                        isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <dept.icon className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>{dept.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Amount Selection */}
          <section className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Amount</Label>
            <div className="flex flex-wrap gap-3">
              {AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountClick(amount)}
                  className={cn(
                    "flex-1 min-w-[80px] py-3 px-4 rounded-xl text-lg font-bold transition-all border-2",
                    selectedAmount === amount 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>
            
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input
                type="number"
                placeholder="Custom Amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className={cn(
                  "pl-8 h-12 text-lg rounded-xl border-2 transition-all",
                  customAmount ? "border-primary/50" : "border-transparent bg-muted focus:border-primary"
                )}
              />
            </div>
          </section>

          {/* Note */}
          <section className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Add a Note (Optional)</Label>
            <Textarea 
              placeholder="Thank you for the wonderful service..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none h-24 rounded-xl bg-muted border-transparent focus:border-primary transition-all"
            />
          </section>

          {/* Action */}
          <div className="pt-4">
            <Button 
              onClick={handleSendTip}
              disabled={isSubmitting || !selectedDept || (!selectedAmount && (!customAmount || parseFloat(customAmount) <= 0))}
              className="w-full h-14 rounded-xl text-lg font-bold shadow-lg transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>Send Tip {selectedAmount ? `$${selectedAmount}` : customAmount ? `$${customAmount}` : ''}</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Tip amount will be charged directly to your room bill.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default DigitalTipping;
