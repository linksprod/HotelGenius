import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Hotel, User, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '@/features/hotels/context/HotelContext';

const SaaS_RegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    hotelName: ''
  });

  const navigate = useNavigate();
  const { resolvePath } = useHotel();

  const steps = [
    { title: 'Admin', description: 'Personal Info' },
    { title: 'Hotel', description: 'Property Name' }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      setError(null);
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hotelName) {
      setError('Please enter a hotel name');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('saas-signup', {
        body: formData
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      // Sign in the user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) throw new Error(signInError.message);

      // Navigate explicitly to the new hotel's admin dashboard
      if (data?.hotel_slug) {
        navigate(`/${data.hotel_slug}/admin`);
      } else {
        navigate(resolvePath('/admin'));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2 mb-8">
        {steps.map((s, idx) => (
          <div key={idx} className="flex flex-col items-center relative flex-1">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-background",
              currentStep > idx + 1 ? "bg-primary border-primary text-primary-foreground" : 
              currentStep === idx + 1 ? "border-primary text-primary ring-4 ring-primary/10" : 
              "border-muted text-muted-foreground"
            )}>
              {currentStep > idx + 1 ? <Check className="h-5 w-5" /> : idx + 1}
            </div>
            
            <div className="mt-2 text-center">
              <p className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                currentStep === idx + 1 ? "text-primary" : "text-muted-foreground"
              )}>{s.title}</p>
            </div>

            {idx < steps.length - 1 && (
              <div className={cn(
                "absolute top-5 left-[50%] w-full h-[2px] -z-0",
                currentStep > idx + 1 ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                        className="pl-9 h-11 rounded-xl bg-background"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                        className="pl-9 h-11 rounded-xl bg-background"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="pl-9 h-11 rounded-xl bg-background"
                      placeholder="admin@hotel.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      className="pl-9 h-11 rounded-xl bg-background"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <div className="relative">
                    <Hotel className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hotelName"
                      value={formData.hotelName}
                      onChange={(e) => setFormData(prev => ({...prev, hotelName: e.target.value}))}
                      className="pl-9 h-11 rounded-xl bg-background"
                      placeholder="The Grand Budapest Hotel"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    This will be used to create your unique workspace URL.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="flex gap-3 pt-4 border-t border-border/50">
          {currentStep === 2 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack} 
              className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          
          {currentStep === 1 ? (
            <Button 
              type="button" 
              onClick={handleNext} 
              className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              Continue to Hotel <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Hotel'}
              {!loading && <Check className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SaaS_RegistrationForm;
