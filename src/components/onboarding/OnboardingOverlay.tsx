import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight, Menu, Bell, User, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingOverlayProps {
    isActive: boolean;
    currentStep: OnboardingStep | null;
    currentStepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onSkip: () => void;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
    menu: <Menu className="h-5 w-5" />,
    bell: <Bell className="h-5 w-5" />,
    user: <User className="h-5 w-5" />,
    layout: <LayoutGrid className="h-5 w-5" />,
    check: <CheckCircle2 className="h-5 w-5" />,
};

interface TooltipPosition {
    top: number;
    left: number;
    placement: 'top' | 'bottom';
}

interface SpotlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    onNext,
    onSkip,
}) => {
    const { t } = useTranslation();
    const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'bottom' });
    const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !currentStep) return;

        const computePosition = () => {
            // Last step (done) — centered on screen
            if (!currentStep.targetSelector) {
                setSpotlight(null);
                setTooltipPos({
                    top: window.innerHeight / 2 - 100,
                    left: window.innerWidth / 2 - 150,
                    placement: 'bottom',
                });
                return;
            }

            const el = document.querySelector(currentStep.targetSelector);
            if (!el) {
                // Fallback to center
                setSpotlight(null);
                setTooltipPos({
                    top: window.innerHeight / 2 - 100,
                    left: window.innerWidth / 2 - 150,
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

            // Position tooltip
            const tooltipWidth = 300;
            const tooltipHeight = 180;
            const gap = 16;

            let top: number;
            let placement: 'top' | 'bottom';

            if (currentStep.placement === 'top' || rect.bottom + tooltipHeight + gap > window.innerHeight) {
                // Place above
                top = rect.top - tooltipHeight - gap;
                placement = 'top';
            } else {
                // Place below
                top = rect.bottom + gap;
                placement = 'bottom';
            }

            // Horizontal centering clamped to viewport
            let left = rect.left + rect.width / 2 - tooltipWidth / 2;
            left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

            setTooltipPos({ top, left, placement });
        };

        // Compute immediately + on resize
        computePosition();
        window.addEventListener('resize', computePosition);
        return () => window.removeEventListener('resize', computePosition);
    }, [isActive, currentStep, currentStepIndex]);

    if (!isActive || !currentStep) return null;

    const isLastStep = currentStepIndex === totalSteps - 1;

    return (
        <AnimatePresence>
            <motion.div
                key="onboarding-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9998]"
            >
                {/* Full-screen click blocker — prevents clicking ANYTHING underneath */}
                <div
                    className="absolute inset-0"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Backdrop with spotlight cutout via CSS mask */}
                <div
                    className="absolute inset-0 bg-black/60 transition-all duration-500 ease-out"
                    style={
                        spotlight
                            ? {
                                maskImage: `radial-gradient(ellipse ${spotlight.width * 0.7}px ${spotlight.height * 0.7}px at ${spotlight.left + spotlight.width / 2}px ${spotlight.top + spotlight.height / 2}px, transparent 100%, black 100%)`,
                                WebkitMaskImage: `radial-gradient(ellipse ${spotlight.width * 0.7}px ${spotlight.height * 0.7}px at ${spotlight.left + spotlight.width / 2}px ${spotlight.top + spotlight.height / 2}px, transparent 100%, black 100%)`,
                                pointerEvents: 'none',
                            }
                            : { pointerEvents: 'none' }
                    }
                />

                {/* Spotlight ring glow — also blocks clicks on the spotlighted element */}
                {spotlight && (
                    <motion.div
                        key={`spotlight-${currentStepIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute rounded-2xl border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb,120,180,140),0.3)]"
                        style={{
                            top: spotlight.top,
                            left: spotlight.left,
                            width: spotlight.width,
                            height: spotlight.height,
                            pointerEvents: 'auto',
                            cursor: 'default',
                        }}
                        onClick={(e) => {
                            // Block clicks on the spotlighted element
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    />
                )}

                {/* Tooltip */}
                <motion.div
                    ref={tooltipRef}
                    key={`tooltip-${currentStepIndex}`}
                    initial={{ opacity: 0, y: tooltipPos.placement === 'bottom' ? -12 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: tooltipPos.placement === 'bottom' ? -12 : 12 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
                    className="absolute z-[9999] w-[300px]"
                    style={{
                        top: tooltipPos.top,
                        left: tooltipPos.left,
                        pointerEvents: 'auto',
                    }}
                >
                    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header accent */}
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
                                    {STEP_ICONS[currentStep.icon] || <Menu className="h-5 w-5" />}
                                </div>
                                <h3 className="text-base font-semibold text-card-foreground leading-tight">
                                    {t(currentStep.titleKey)}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed ml-12 mb-4">
                                {t(currentStep.descriptionKey)}
                            </p>

                            {/* Footer: dots + buttons */}
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
                                            {t('onboarding.skip')}
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={onNext}
                                        className="h-8 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-1.5"
                                    >
                                        {isLastStep ? t('onboarding.getStarted') : t('onboarding.next')}
                                        {!isLastStep && <ArrowRight className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Arrow indicator */}
                    {spotlight && (
                        <div
                            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card border-border ${tooltipPos.placement === 'bottom'
                                    ? '-top-1.5 border-l border-t'
                                    : '-bottom-1.5 border-r border-b'
                                }`}
                        />
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingOverlay;
