import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Smartphone, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// iOS Share icon (exact SVG from Apple's UI guidelines)
const IOSShareIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

const PWAInstallBanner: React.FC = () => {
    const {
        shouldShow,
        canShowNativePrompt,
        isIOS,
        isSafari,
        isFirefox,
        promptInstall,
        dismiss,
    } = usePWAInstall();

    const [installing, setInstalling] = useState(false);

    if (!shouldShow) return null;

    const handleInstallClick = async () => {
        if (canShowNativePrompt) {
            setInstalling(true);
            await promptInstall();
            setInstalling(false);
        }
        // For iOS/manual browsers: the banner itself already shows instructions,
        // so no extra step needed — instructions are inline below.
    };

    const needsManualInstructions = !canShowNativePrompt;
    const isIOSDevice = isIOS || isSafari;

    return (
        <AnimatePresence>
            <motion.div
                key="pwa-banner"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="fixed bottom-20 left-3 right-3 z-[9000] md:left-auto md:right-4 md:bottom-4 md:max-w-sm"
            >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Brand accent */}
                    <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

                    <div className="p-4">
                        {/* Header row */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm">Install Hotel Genius</p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                    {isIOSDevice
                                        ? 'Add to your Home Screen for the best app experience'
                                        : isFirefox
                                            ? 'Add to your Home Screen from the browser menu'
                                            : 'Get instant access — works offline too'}
                                </p>
                            </div>
                            <button
                                onClick={dismiss}
                                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0 -mt-0.5"
                                aria-label="Dismiss"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* ── Chrome/Edge: one-click install button ── */}
                        {canShowNativePrompt && (
                            <button
                                onClick={handleInstallClick}
                                disabled={installing}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                <Download className="h-4 w-4" />
                                {installing ? 'Installing…' : 'Install App'}
                            </button>
                        )}

                        {/* ── iOS Safari: Visual inline instructions ── */}
                        {isIOSDevice && (
                            <div className="mt-1 space-y-2">
                                {/* Step 1 */}
                                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                                    <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
                                        <span>Tap</span>
                                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg px-2 py-0.5 font-medium text-xs">
                                            <IOSShareIcon />
                                            Share
                                        </span>
                                        <span className="text-muted-foreground text-xs">(bottom of Safari)</span>
                                    </div>
                                </div>
                                {/* Arrow */}
                                <div className="flex justify-center">
                                    <motion.div
                                        animate={{ y: [0, 4, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                        className="text-primary"
                                    >
                                        ↓
                                    </motion.div>
                                </div>
                                {/* Step 2 */}
                                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                                    <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
                                        <span>Tap</span>
                                        <span className="inline-flex items-center gap-1 bg-muted border border-border rounded-lg px-2 py-0.5 font-medium text-xs text-foreground">
                                            ＋ Add to Home Screen
                                        </span>
                                    </div>
                                </div>
                                {/* Arrow */}
                                <div className="flex justify-center">
                                    <motion.div
                                        animate={{ y: [0, 4, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
                                        className="text-primary"
                                    >
                                        ↓
                                    </motion.div>
                                </div>
                                {/* Step 3 */}
                                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                                    <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
                                        <span>Tap</span>
                                        <span className="inline-flex items-center gap-1 bg-blue-500 text-white rounded-lg px-2 py-0.5 font-medium text-xs">
                                            Add
                                        </span>
                                        <span className="text-muted-foreground text-xs">— Done! ✓</span>
                                    </div>
                                </div>

                                {/* Pointing arrow at bottom of screen */}
                                <motion.div
                                    animate={{ y: [0, 6, 0] }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                                    className="flex flex-col items-center pt-1 pb-0.5"
                                >
                                    <div className="text-xs text-muted-foreground mb-0.5">Share button is here ↓</div>
                                    <div className="text-primary text-lg">↓</div>
                                </motion.div>
                            </div>
                        )}

                        {/* ── Firefox / Generic: minimal instructions ── */}
                        {isFirefox && (
                            <div className="mt-1 space-y-2">
                                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <span>Tap</span>
                                        <span className="inline-flex items-center gap-1 bg-muted border border-border rounded-lg px-2 py-0.5 text-xs font-medium">
                                            <MoreVertical className="h-3 w-3" /> Menu
                                        </span>
                                        <span className="text-muted-foreground text-xs">in toolbar</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                                    <div className="text-sm text-foreground">
                                        Tap <strong>&quot;Add to Home Screen&quot;</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Other browser without native prompt ── */}
                        {!canShowNativePrompt && !isIOSDevice && !isFirefox && (
                            <div className="mt-1 space-y-2">
                                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <span>Open browser</span>
                                        <span className="inline-flex items-center gap-1 bg-muted border border-border rounded-lg px-2 py-0.5 text-xs font-medium">
                                            <MoreVertical className="h-3 w-3" /> Menu
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-3 py-2.5">
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                                    <div className="text-sm text-foreground">
                                        Tap <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PWAInstallBanner;
