import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, MoreVertical, ExternalLink, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer';
import { toast } from 'sonner';

// iOS Share icon (exact SVG from Apple's UI guidelines)
const IOSShareIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

const PWAInstallBanner: React.FC = () => {
    const { t } = useTranslation();
    const {
        shouldShow,
        canShowNativePrompt,
        isIOS,
        isSafari,
        promptInstall,
        dismiss,
    } = usePWAInstall();

    const isIOSDevice = isIOS || isSafari;

    // Check for force-show URL parameter
    const searchParams = new URLSearchParams(window.location.search);
    const forceShow = searchParams.get('pwa') === 'show' || searchParams.get('show_pwa') === '1';

    // Check if we are in an in-app browser (like WhatsApp, Instagram, FB)
    const isInAppBrowser = isIOSDevice && (
        /FBAV|Instagram|FBAN|Messenger|Line|Signal|WhatsApp|Twitter|DuckDuckGo/i.test(navigator.userAgent) ||
        (isSafari && !/Version\/[\d\.]+.*Safari/i.test(navigator.userAgent))
    );

    const [installing, setInstalling] = useState(false);
    const [isInstructionOpen, setIsInstructionOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!shouldShow && !forceShow) return null;

    const handleInstallClick = async () => {
        if (canShowNativePrompt) {
            setInstalling(true);
            await promptInstall();
            setInstalling(false);
        } else {
            setIsInstructionOpen(true);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success(t('pwa.linkCopied'));
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <AnimatePresence>
                {!isInstructionOpen && (
                    <motion.div
                        key="pwa-pill"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        whileTap={{ scale: 0.95 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9000] w-auto whitespace-nowrap"
                    >
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center gap-2.5 bg-primary/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-lg border border-white/10 font-semibold text-sm transition-all hover:bg-primary active:scale-[0.98]"
                        >
                            <Download className="h-4 w-4" />
                            {isIOSDevice ? t('pwa.tapToInstall') : t('pwa.installButton')}

                            <div className="w-px h-4 bg-white/20 mx-0.5" />

                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dismiss();
                                }}
                                className="p-1 -mr-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Drawer open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
                <DrawerContent className="max-h-[90vh] z-[9001] outline-none">
                    <div className="mx-auto w-full max-w-sm px-4 focus-visible:outline-none">
                        <DrawerHeader className="pb-2">
                            <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center p-3 border border-primary/20">
                                    <img
                                        src="/lovable-uploads/7d122e82-98d4-40e0-a1ab-a49791c14717.png"
                                        alt="Logo"
                                        className="w-full h-full object-contain rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>
                            <DrawerTitle className="text-xl text-center">
                                {isIOSDevice ? t('pwa.addToHomeTitle') : t('pwa.installTitle')}
                            </DrawerTitle>
                            <DrawerDescription className="text-center mt-1">
                                {t('pwa.installSubtitle')}
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="p-4 pt-1 space-y-4 overflow-y-auto max-h-[50vh]">
                            {/* ── iOS but NOT Safari: "Open in Safari" Call to Action ── */}
                            {isIOSDevice && !isSafari && (
                                <div className="space-y-4 py-2">
                                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-500/20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                                                <ExternalLink className="h-4 w-4" />
                                            </div>
                                            <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                                                {t('pwa.openInSafari')}
                                            </p>
                                        </div>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 mb-4 leading-relaxed">
                                            {t('pwa.safariRecommended')}
                                        </p>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={copyToClipboard}
                                                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-medium text-sm py-2.5 rounded-xl transition-all active:scale-[0.98]"
                                            >
                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                {copied ? t('pwa.linkCopied') : t('pwa.copyLink')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 px-1">
                                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                                        <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('pwa.inAppWarning') }} />
                                    </div>
                                </div>
                            )}

                            {/* ── iOS Safari: Visual instructions ── */}
                            {isIOSDevice && isSafari && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {/* Step 1 */}
                                    <div className="flex items-center gap-4 bg-muted/40 rounded-2xl p-3 border border-border/50">
                                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold shadow-sm">1</div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                                            <span>{t('pwa.iosStep1')}</span>
                                            <span className="inline-flex items-center gap-1 bg-blue-500 text-white rounded-lg px-2 py-1 font-medium text-xs shadow-sm">
                                                <IOSShareIcon />
                                                {t('pwa.iosShareLabel')}
                                            </span>
                                            <span className="text-muted-foreground text-xs italic">{t('pwa.iosStep1Detail')}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-2 opacity-30">
                                        <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>↓</motion.div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-center gap-4 bg-muted/40 rounded-2xl p-3 border border-border/50">
                                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold shadow-sm">2</div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                                            <span>{t('pwa.iosStep2')}</span>
                                            <span className="inline-flex items-center gap-1 bg-background border border-border rounded-lg px-2 py-1 font-medium text-xs shadow-sm text-foreground">
                                                {t('pwa.iosAddLabel')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-2 opacity-30">
                                        <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>↓</motion.div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-center gap-4 bg-muted/40 rounded-2xl p-3 border border-border/50">
                                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold shadow-sm">3</div>
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <span>{t('pwa.iosStep3')}</span>
                                            <span className="inline-flex items-center gap-1 bg-blue-500 text-white rounded-lg px-2 py-1 font-medium text-xs shadow-sm">
                                                {t('pwa.iosConfirmLabel')}
                                            </span>
                                            <span className="text-muted-foreground text-xs">{t('pwa.iosStep3Detail')}</span>
                                        </div>
                                    </div>

                                    <motion.div
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.2 }}
                                        className="flex flex-col items-center pt-2"
                                    >
                                        <span className="text-xs text-muted-foreground mb-1">{t('pwa.iosPointingLabel')}</span>
                                        <div className="text-primary text-xl">↓</div>
                                    </motion.div>
                                </div>
                            )}

                            {/* ── Chrome/Edge: already handled by button, but show if drawer accidentally opens ── */}
                            {canShowNativePrompt && (
                                <button
                                    onClick={handleInstallClick}
                                    disabled={installing}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
                                >
                                    <Download className="h-4 w-4" />
                                    {installing ? t('pwa.installing') : t('pwa.installButton')}
                                </button>
                            )}
                        </div>

                        <DrawerFooter className="pt-2 border-t mt-auto mb-4">
                            <DrawerClose asChild>
                                <button className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    {t('common.close')}
                                </button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default PWAInstallBanner;
