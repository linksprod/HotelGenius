import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Smartphone, Share, Plus, MoreVertical, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallBanner: React.FC = () => {
    const {
        shouldShow,
        canShowNativePrompt,
        needsManualInstall,
        isIOS,
        isSafari,
        isFirefox,
        browser,
        promptInstall,
        dismiss,
    } = usePWAInstall();
    const [showInstructions, setShowInstructions] = useState(false);

    if (!shouldShow) return null;

    const handleInstallClick = async () => {
        if (canShowNativePrompt) {
            await promptInstall();
        } else {
            // Show manual instructions for iOS/Safari/Firefox
            setShowInstructions(true);
        }
    };

    return (
        <AnimatePresence>
            {!showInstructions ? (
                /* ── Compact Banner ── */
                <motion.div
                    key="pwa-banner"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 80 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-sm"
                >
                    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                        {/* Accent bar */}
                        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                        <div className="p-4 flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm">Install Hotel Genius</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {isIOS || isSafari
                                        ? 'Add to Home Screen for the full app experience'
                                        : 'Install for faster access & offline mode'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleInstallClick}
                                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all active:scale-95"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Install
                                </button>
                                <button
                                    onClick={dismiss}
                                    className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                                    aria-label="Dismiss"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                /* ── Manual Install Instructions (iOS/Safari/Firefox) ── */
                <motion.div
                    key="pwa-instructions"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 80 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-sm"
                >
                    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                        <div className="p-5">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Smartphone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">Install Hotel Genius</p>
                                        <p className="text-xs text-muted-foreground">Follow these steps</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowInstructions(false); dismiss(); }}
                                    className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-3">
                                {isIOS || isSafari ? (
                                    /* iOS Safari instructions */
                                    <>
                                        <InstructionStep
                                            step={1}
                                            icon={<Share className="h-4 w-4" />}
                                            text={
                                                <>
                                                    Tap the <strong>Share</strong> button
                                                    <span className="inline-flex mx-1 align-middle">
                                                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                                                    </span>
                                                    at the bottom of Safari
                                                </>
                                            }
                                        />
                                        <InstructionStep
                                            step={2}
                                            icon={<Plus className="h-4 w-4" />}
                                            text={
                                                <>
                                                    Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
                                                </>
                                            }
                                        />
                                        <InstructionStep
                                            step={3}
                                            icon={<Download className="h-4 w-4" />}
                                            text={
                                                <>
                                                    Tap <strong>&quot;Add&quot;</strong> to install the app
                                                </>
                                            }
                                        />
                                    </>
                                ) : isFirefox ? (
                                    /* Firefox instructions */
                                    <>
                                        <InstructionStep
                                            step={1}
                                            icon={<MoreVertical className="h-4 w-4" />}
                                            text={
                                                <>
                                                    Tap the <strong>menu</strong> button (⋮) in the toolbar
                                                </>
                                            }
                                        />
                                        <InstructionStep
                                            step={2}
                                            icon={<Plus className="h-4 w-4" />}
                                            text={
                                                <>
                                                    Tap <strong>&quot;Install&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>
                                                </>
                                            }
                                        />
                                    </>
                                ) : (
                                    /* Generic fallback */
                                    <>
                                        <InstructionStep
                                            step={1}
                                            icon={<MoreVertical className="h-4 w-4" />}
                                            text={
                                                <>
                                                    Open the browser <strong>menu</strong>
                                                </>
                                            }
                                        />
                                        <InstructionStep
                                            step={2}
                                            icon={<Download className="h-4 w-4" />}
                                            text={
                                                <>
                                                    Tap <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>
                                                </>
                                            }
                                        />
                                    </>
                                )}
                            </div>

                            {/* Got it button */}
                            <button
                                onClick={() => { setShowInstructions(false); dismiss(); }}
                                className="w-full mt-4 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/* ── Instruction Step Component ── */
const InstructionStep: React.FC<{
    step: number;
    icon: React.ReactNode;
    text: React.ReactNode;
}> = ({ step, icon, text }) => (
    <div className="flex items-start gap-3">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">{step}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground leading-relaxed pt-0.5">
            <span className="text-primary shrink-0">{icon}</span>
            <span>{text}</span>
        </div>
    </div>
);

export default PWAInstallBanner;
