import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';
import { useHotel } from '@/features/hotels/context/HotelContext';

interface WelcomeToastProps {
    show: boolean;
    firstName: string;
    lastName: string;
    onDismiss: () => void;
}

const WelcomeToast: React.FC<WelcomeToastProps> = ({ show, firstName, lastName, onDismiss }) => {
    const { t } = useTranslation();
    const { hotel } = useHotel();
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!show) return;

        // Animate progress bar
        const startTime = Date.now();
        const duration = 5000;
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                onDismiss();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [show, onDismiss]);

    const displayName = lastName
        ? `${firstName} ${lastName.charAt(0)}.`
        : firstName;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.97 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-sm"
                >
                    <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Progress bar */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/30">
                            <motion.div
                                className="h-full bg-primary/60"
                                style={{ width: `${progress}%` }}
                                transition={{ duration: 0.05 }}
                            />
                        </div>

                        <div className="p-4 pr-10">
                            <div className="flex items-center gap-3">
                                {/* Logo or Sparkle */}
                                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    {hotel?.logo_url ? (
                                        <img src={hotel.logo_url} alt="" className="h-6 w-6 object-contain" />
                                    ) : (
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-card-foreground truncate">
                                        {t('onboarding.welcome.title')} 👋
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {t('onboarding.welcome.message', { name: displayName })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dismiss button */}
                        <button
                            onClick={onDismiss}
                            className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-card-foreground hover:bg-muted/50 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeToast;
