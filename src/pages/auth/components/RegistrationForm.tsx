import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import CompanionsList from './CompanionsList';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import BasicInfoFields from './form/BasicInfoFields';
import DateFields from './form/DateFields';
import AdditionalFields from './form/AdditionalFields';
import PasswordField from './form/PasswordField';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const RegistrationForm: React.FC = () => {
  const { 
    loading, 
    companions, 
    setCompanions, 
    registerForm, 
    handleRegister,
    currentStep,
    nextStep,
    prevStep
  } = useRegistrationForm();
  const { t } = useTranslation();

  const steps = [
    { title: t('auth.personalInfo', 'Personal'), description: t('auth.tellUsMore', 'Who are you?') },
    { title: t('auth.stayDetails', 'Stay'), description: t('auth.checkInInfo', 'Where & When?') },
    { title: t('auth.security', 'Security'), description: t('auth.protectAccount', 'Final details') }
  ];

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

      <Form {...registerForm}>
        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
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
                  <BasicInfoFields form={registerForm} />
                  <AdditionalFields form={registerForm} step={1} />
                  <DateFields form={registerForm} step={1} />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <DateFields form={registerForm} step={2} />
                  <AdditionalFields form={registerForm} step={2} />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <AdditionalFields form={registerForm} step={3} />
                  <PasswordField form={registerForm} />
                  <CompanionsList
                    companions={companions}
                    setCompanions={setCompanions}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex gap-3 pt-4 border-t border-border/50">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.back', 'Back')}
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                className={cn("h-12 rounded-xl font-black uppercase tracking-widest text-[10px]", currentStep === 1 ? "w-full" : "flex-1")}
              >
                {t('common.next', 'Next Step')} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20" 
                disabled={loading}
              >
                {loading ? t('auth.registering', 'Registering...') : t('auth.accessApp', 'Complete Registration')}
                {!loading && <Check className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegistrationForm;
