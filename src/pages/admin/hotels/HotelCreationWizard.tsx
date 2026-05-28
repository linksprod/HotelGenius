import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Palette,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  Check,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import SlugChecker from './SlugChecker';
import AISetupStep from './setup/AISetupStep';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardData {
  // Step 1 — Identity
  hotelName: string;
  slug: string;
  languages: string[];
  // Step 2 — Branding
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  // Step 3 — Admin
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface HotelCreationWizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const STEPS = [
  { id: 1, title: 'Hotel Identity', icon: Building2, description: 'Name, slug & languages' },
  { id: 2, title: 'Branding', icon: Palette, description: 'Colors & logo' },
  { id: 3, title: 'Admin Account', icon: UserCog, description: 'Manager credentials' },
  { id: 4, title: 'AI Content Import', icon: Sparkles, description: 'Auto-fill from documents' },
];

const DEFAULT_DATA: WizardData = {
  hotelName: '',
  slug: '',
  languages: ['en'],
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  logoUrl: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

interface Step1Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  onAvailable: (available: boolean) => void;
}

const Step1: React.FC<Step1Props> = ({ data, onChange, onAvailable }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    onChange({ hotelName: name, slug: toSlug(name) });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ slug: toSlug(e.target.value) });
  };

  const toggleLanguage = (code: string) => {
    const langs = data.languages.includes(code)
      ? data.languages.filter((l) => l !== code)
      : [...data.languages, code];
    onChange({ languages: langs });
  };

  return (
    <div className="space-y-6">
      {/* Hotel Name */}
      <div className="space-y-2">
        <Label htmlFor="hotelName" className="text-sm font-medium">
          Hotel Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="hotelName"
          placeholder="Grand Palace Hotel"
          value={data.hotelName}
          onChange={handleNameChange}
          className="h-11"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm font-medium">
          URL Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          placeholder="grand-palace-hotel"
          value={data.slug}
          onChange={handleSlugChange}
          className="h-11 font-mono text-sm"
        />
        <SlugChecker slug={data.slug} onAvailabilityChange={onAvailable} />

        {/* Live URL preview */}
        {data.slug && (
          <div className="flex items-center gap-2 mt-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="inline-flex items-center gap-0 text-xs rounded-full border bg-muted/60 px-3 py-1 font-mono text-muted-foreground">
              hotelgenius.online/
              <span className="text-foreground font-semibold">{data.slug}</span>
            </span>
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Languages <span className="text-destructive">*</span>
          <span className="ml-2 text-xs text-muted-foreground font-normal">(select at least 1)</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((lang) => {
            const checked = data.languages.includes(lang.code);
            return (
              <label
                key={lang.code}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all select-none ${
                  checked
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
                onClick={() => toggleLanguage(lang.code)}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleLanguage(lang.code)}
                  className="pointer-events-none"
                />
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Step 2 ───────────────────────────────────────────────────────────────────

interface Step2Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

const Step2: React.FC<Step2Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</Label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="color"
                id="primaryColor"
                value={data.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="h-11 w-11 rounded-lg border cursor-pointer p-0.5 bg-transparent"
              />
            </div>
            <Input
              value={data.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              placeholder="#6366f1"
              className="h-11 font-mono text-sm uppercase"
              maxLength={7}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor" className="text-sm font-medium">Secondary Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="secondaryColor"
              value={data.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="h-11 w-11 rounded-lg border cursor-pointer p-0.5 bg-transparent"
            />
            <Input
              value={data.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              placeholder="#8b5cf6"
              className="h-11 font-mono text-sm uppercase"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logoUrl" className="text-sm font-medium">Logo URL <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
        <Input
          id="logoUrl"
          placeholder="https://example.com/logo.png"
          value={data.logoUrl}
          onChange={(e) => onChange({ logoUrl: e.target.value })}
          className="h-11"
        />
        {data.logoUrl && (
          <div className="flex items-center gap-2 mt-1">
            <img
              src={data.logoUrl}
              alt="Logo preview"
              className="h-8 w-8 rounded object-contain border bg-muted"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <span className="text-xs text-muted-foreground">Logo preview</span>
          </div>
        )}
      </div>

      {/* Live Brand Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Brand Preview</Label>
        <div className="rounded-xl border overflow-hidden shadow-sm">
          {/* Gradient header */}
          <div
            className="h-16 flex items-center px-5 gap-3"
            style={{
              background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`,
            }}
          >
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt="logo"
                className="h-9 w-9 rounded-lg object-contain bg-white/20 p-1"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                {(data.hotelName?.[0] || 'H').toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {data.hotelName || 'Your Hotel Name'}
              </p>
              <p className="text-white/70 text-xs">Powered by HotelGenius</p>
            </div>
          </div>

          <div className="bg-background p-4 flex items-center gap-3">
            <div
              className="h-8 px-4 rounded-lg text-white text-xs font-medium flex items-center"
              style={{ backgroundColor: data.primaryColor }}
            >
              Book Now
            </div>
            <div
              className="h-8 px-4 rounded-lg text-xs font-medium flex items-center border-2"
              style={{ borderColor: data.secondaryColor, color: data.secondaryColor }}
            >
              Explore
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 3 ───────────────────────────────────────────────────────────────────

interface Step3Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

const Step3: React.FC<Step3Props> = ({ data, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-xl border overflow-hidden">
        <div
          className="h-2"
          style={{
            background: `linear-gradient(90deg, ${data.primaryColor}, ${data.secondaryColor})`,
          }}
        />
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Hotel Summary
          </p>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0"
              style={{ backgroundColor: data.primaryColor }}
            >
              {(data.hotelName?.[0] || 'H').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{data.hotelName || '—'}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">
                hotelgenius.online/{data.slug || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div
              className="h-4 w-4 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: data.primaryColor }}
            />
            <div
              className="h-4 w-4 rounded-full border-2 border-white shadow -ml-1.5"
              style={{ backgroundColor: data.secondaryColor }}
            />
            <span className="text-xs text-muted-foreground ml-1">
              {data.primaryColor} · {data.secondaryColor}
            </span>
          </div>
        </div>
      </div>

      {/* Admin fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="John"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Admin Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@hotel.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Wizard ───────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const HotelCreationWizard: React.FC<HotelCreationWizardProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);
  const [slugAvailable, setSlugAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdHotelId, setCreatedHotelId] = useState<string | null>(null);

  const update = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Validation per step ─────────────────────────────────────────────────────
  const canProceed = (): boolean => {
    if (step === 1) {
      return (
        data.hotelName.trim().length >= 2 &&
        data.slug.length >= 2 &&
        slugAvailable &&
        data.languages.length > 0
      );
    }
    if (step === 2) {
      return data.primaryColor.length === 7 && data.secondaryColor.length === 7;
    }
    if (step === 3) {
      return (
        data.firstName.trim().length >= 1 &&
        data.lastName.trim().length >= 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
        data.password.length >= 6
      );
    }
    return false;
  };

  const goNext = () => {
    if (!canProceed()) return;
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: response, error } = await supabase.functions.invoke('provision-hotel', {
        body: {
          hotelName: data.hotelName,
          slug: data.slug,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          logoUrl: data.logoUrl,
          languages: data.languages,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to provision hotel');
      }

      if (!response || !response.success) {
        throw new Error(response?.error || 'Failed to provision hotel');
      }

      toast({
        title: 'Hotel Created ✓',
        description: `${data.hotelName} is ready. Now import your content with AI!`,
      });

      // Advance to Step 4 — AI Content Import
      setCreatedHotelId(response.hotelId);
      setDirection(1);
      setStep(4);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create hotel';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  // ── Step 4: AI Content Import — full-panel takeover ─────────────────────
  if (step === 4 && createdHotelId) {
    return (
      <div className="flex flex-col h-full">
        <AISetupStep
          hotelId={createdHotelId}
          onFinish={onSuccess}
          onSkip={onSuccess}
          onBack={() => { setDirection(-1); setStep(3); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Wizard header ── */}
      <div className="px-6 pt-6 pb-4 border-b">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {STEPS.map((s) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    step === s.id
                      ? 'w-6 bg-primary'
                      : step > s.id
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              </div>
              {s.id < STEPS.length && (
                <div
                  className={`h-px w-8 transition-colors duration-300 ${
                    step > s.id ? 'bg-primary' : 'bg-muted-foreground/20'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <StepIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Step {step} — {currentStep.title}
            </h2>
            <p className="text-xs text-muted-foreground">{currentStep.description}</p>
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {step === 1 && (
              <Step1
                data={data}
                onChange={update}
                onAvailable={setSlugAvailable}
              />
            )}
            {step === 2 && <Step2 data={data} onChange={update} />}
            {step === 3 && <Step3 data={data} onChange={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer buttons ── */}
      <div className="px-6 py-4 border-t flex items-center justify-between gap-3 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          onClick={step === 1 ? onCancel : goBack}
          disabled={isSubmitting}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {step} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : step === 3 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="gap-2 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Hotel
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HotelCreationWizard;
