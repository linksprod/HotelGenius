import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ArrowRight, LayoutDashboard, Bell, User, BarChart3,
    ClipboardList, Users, Filter, Table2, Utensils, Sparkles,
    PartyPopper, Trash2, Wrench, Shield, Wifi, MessageCircle,
    Star, UserCog, Building2, Store, MapPin, FileText, ImageIcon,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminOnboardingStep } from '@/hooks/admin/useAdminOnboarding';

interface AdminOnboardingOverlayProps {
    isActive: boolean;
    currentStep: AdminOnboardingStep | null;
    currentStepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onSkip: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'layout': <LayoutDashboard className="h-5 w-5" />,
    'bell': <Bell className="h-5 w-5" />,
    'user': <User className="h-5 w-5" />,
    'bar-chart': <BarChart3 className="h-5 w-5" />,
    'clipboard': <ClipboardList className="h-5 w-5" />,
    'users': <Users className="h-5 w-5" />,
    'filter': <Filter className="h-5 w-5" />,
    'table': <Table2 className="h-5 w-5" />,
    'utensils': <Utensils className="h-5 w-5" />,
    'tabs': <LayoutDashboard className="h-5 w-5" />,
    'plus': <ArrowRight className="h-5 w-5" />,
    'sparkles': <Sparkles className="h-5 w-5" />,
    'party': <PartyPopper className="h-5 w-5" />,
    'trash': <Trash2 className="h-5 w-5" />,
    'wrench': <Wrench className="h-5 w-5" />,
    'shield': <Shield className="h-5 w-5" />,
    'wifi': <Wifi className="h-5 w-5" />,
    'message': <MessageCircle className="h-5 w-5" />,
    'star': <Star className="h-5 w-5" />,
    'user-cog': <UserCog className="h-5 w-5" />,
    'building': <Building2 className="h-5 w-5" />,
    'store': <Store className="h-5 w-5" />,
    'map-pin': <MapPin className="h-5 w-5" />,
    'file-text': <FileText className="h-5 w-5" />,
    'image': <ImageIcon className="h-5 w-5" />,
    'check': <CheckCircle2 className="h-5 w-5" />,
};

interface TooltipPosition {
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
}

interface SpotlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const AdminOnboardingOverlay: React.FC<AdminOnboardingOverlayProps> = ({
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    onNext,
    onSkip,
}) => {
    const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'bottom' });
    const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);

    useEffect(() => {
        if (!isActive || !currentStep) return;

        const computePosition = () => {
            if (!currentStep.targetSelector) {
                setSpotlight(null);
                setTooltipPos({
                    top: window.innerHeight / 2 - 100,
                    left: window.innerWidth / 2 - 175,
                    placement: 'bottom',
                });
                return;
            }

            const el = document.querySelector(currentStep.targetSelector);
            if (!el) {
                setSpotlight(null);
                setTooltipPos({
                    top: window.innerHeight / 2 - 100,
                    left: window.innerWidth / 2 - 175,
                    placement: 'bottom',
                });
                return;
            }

            const rect = el.getBoundingClientRect();
            const padding = 8;
            const spotlightRect: SpotlightRect = {
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
            };
            setSpotlight(spotlightRect);

            const tooltipWidth = 340;
            const tooltipHeight = 190;
            const gap = 16;

            let top: number;
            let left: number;
            let placement = currentStep.placement;

            if (placement === 'right') {
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + gap;
                if (left + tooltipWidth > window.innerWidth - 16) placement = 'bottom';
            }
            if (placement === 'left') {
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - tooltipWidth - gap;
                if (left < 16) placement = 'bottom';
            }

            if (placement === 'bottom') {
                top = rect.bottom + gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
            } else if (placement === 'top') {
                top = rect.top - tooltipHeight - gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
            } else {
                top = top!;
                left = left!;
            }

            top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
            left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

            setTooltipPos({ top, left, placement });
        };

        computePosition();
        window.addEventListener('resize', computePosition);
        return () => window.removeEventListener('resize', computePosition);
    }, [isActive, currentStep, currentStepIndex]);

    if (!isActive || !currentStep) return null;

    const isLastStep = currentStepIndex === totalSteps - 1;

    return (
        <AnimatePresence>
            <motion.div
                key="admin-onboarding-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9998]"
            >
                {/* Full-screen click blocker */}
                <div
                    className="absolute inset-0"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Dark overlay — only shown when there is no spotlight target (centered tooltip) */}
                <div
                    className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                    style={{
                        pointerEvents: 'none',
                        opacity: spotlight ? 0 : 1,
                    }}
                />

                {/* Spotlight: transparent box with box-shadow that darkens everything around it */}
                {spotlight && (
                    <motion.div
                        key={`spotlight-${currentStepIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            top: spotlight.top,
                            left: spotlight.left,
                            width: spotlight.width,
                            height: spotlight.height,
                        }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="absolute"
                        style={{
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                            borderRadius: '10px',
                            outline: '2px solid rgba(var(--primary-rgb, 120, 180, 140), 0.7)',
                            outlineOffset: '1px',
                            background: 'transparent',
                            pointerEvents: 'auto',
                            cursor: 'default',
                            zIndex: 1,
                        }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    />
                )}

                {/* Tooltip card */}
                <motion.div
                    key={`tooltip-${currentStepIndex}`}
                    initial={{ opacity: 0, y: tooltipPos.placement === 'bottom' ? -10 : 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: tooltipPos.placement === 'bottom' ? -10 : 10 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
                    className="absolute w-[340px]"
                    style={{
                        top: tooltipPos.top,
                        left: tooltipPos.left,
                        pointerEvents: 'auto',
                        zIndex: 2,
                    }}
                >
                    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                        {/* Accent bar */}
                        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

                        <div className="p-5">
                            {/* Close button */}
                            <button
                                onClick={onSkip}
                                className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-card-foreground hover:bg-muted/50 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>

                            {/* Icon + Title */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/15 text-primary">
                                    {ICON_MAP[currentStep.icon] || <LayoutDashboard className="h-5 w-5" />}
                                </div>
                                <h3 className="text-base font-semibold text-card-foreground leading-tight pr-6">
                                    {currentStep.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed ml-12 mb-4">
                                {currentStep.description}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                {/* Step dots */}
                                <div className="flex gap-1.5">
                                    {Array.from({ length: totalSteps }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStepIndex
                                                ? 'w-5 bg-primary'
                                                : i < currentStepIndex
                                                    ? 'w-1.5 bg-primary/40'
                                                    : 'w-1.5 bg-muted-foreground/20'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-2">
                                    {!isLastStep && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onSkip}
                                            className="text-xs text-muted-foreground hover:text-card-foreground h-8 px-3"
                                        >
                                            Skip
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={onNext}
                                        className="h-8 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-1.5"
                                    >
                                        {isLastStep ? 'Got it!' : 'Next'}
                                        {!isLastStep && <ArrowRight className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminOnboardingOverlay;
