import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type PWAPlatform = 'ios' | 'android' | 'desktop' | 'unknown';

function detectPlatform(): PWAPlatform {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return 'ios';
    }
    if (/Android/.test(ua)) return 'android';
    if (/Windows|Macintosh|Linux/.test(ua) && navigator.maxTouchPoints <= 1) return 'desktop';
    return 'unknown';
}

function isStandalone(): boolean {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
    if ((window.navigator as any).standalone === true) return true;
    if (document.referrer.includes('android-app://')) return true;
    return false;
}

function getBrowser(): 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'other' {
    const ua = navigator.userAgent;
    if (/Edg\//i.test(ua)) return 'edge';
    if (/SamsungBrowser/i.test(ua)) return 'samsung';
    if (/CriOS|Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'chrome';
    if (/FxiOS|Firefox/i.test(ua)) return 'firefox';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'safari';
    return 'other';
}

const DISMISS_KEY = 'pwa_install_dismissed_at';
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // Re-show after 24h
const AUTO_PROMPT_KEY = 'pwa_auto_prompted';

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [platform] = useState<PWAPlatform>(detectPlatform);
    const [browser] = useState(getBrowser);
    const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
    const autoPromptedRef = useRef(false);

    // Keep ref in sync
    useEffect(() => {
        promptRef.current = deferredPrompt;
    }, [deferredPrompt]);

    // Check if already installed
    useEffect(() => {
        if (isStandalone()) {
            setIsInstalled(true);
            return;
        }

        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
            const elapsed = Date.now() - parseInt(dismissedAt, 10);
            if (elapsed < DISMISS_COOLDOWN_MS) {
                setIsDismissed(true);
                const timer = setTimeout(() => setIsDismissed(false), DISMISS_COOLDOWN_MS - elapsed);
                return () => clearTimeout(timer);
            } else {
                localStorage.removeItem(DISMISS_KEY);
            }
        }
    }, []);

    // Listen for beforeinstallprompt + AUTO-TRIGGER on first user interaction
    useEffect(() => {
        if (isInstalled) return;

        const handler = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            promptRef.current = promptEvent;

            // Auto-trigger the native prompt on the FIRST user click/tap
            // Browsers require a user gesture, so we attach to the first interaction
            const alreadyPrompted = sessionStorage.getItem(AUTO_PROMPT_KEY);
            if (!alreadyPrompted && !autoPromptedRef.current) {
                autoPromptedRef.current = true;

                const autoTrigger = async () => {
                    // Remove the listener immediately so it only fires once
                    document.removeEventListener('click', autoTrigger, true);
                    document.removeEventListener('touchend', autoTrigger, true);

                    const prompt = promptRef.current;
                    if (!prompt) return;

                    try {
                        await prompt.prompt();
                        const { outcome } = await prompt.userChoice;
                        sessionStorage.setItem(AUTO_PROMPT_KEY, 'true');
                        if (outcome === 'accepted') {
                            setIsInstalled(true);
                        }
                        setDeferredPrompt(null);
                        promptRef.current = null;
                    } catch (err) {
                        console.warn('Auto PWA prompt failed:', err);
                    }
                };

                // Attach to document — fires on ANY click/tap (the user gesture)
                document.addEventListener('click', autoTrigger, { capture: true, once: true });
                document.addEventListener('touchend', autoTrigger, { capture: true, once: true });
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            promptRef.current = null;
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, [isInstalled]);

    // Manual trigger (fallback from banner button)
    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return false;
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
            promptRef.current = null;
            return outcome === 'accepted';
        } catch {
            return false;
        }
    }, [deferredPrompt]);

    // Dismiss with 24h cooldown
    const dismiss = useCallback(() => {
        setIsDismissed(true);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }, []);

    const canShowNativePrompt = !!deferredPrompt;
    const isIOS = platform === 'ios';
    const isSafari = browser === 'safari';
    const isFirefox = browser === 'firefox';
    const needsManualInstall = !canShowNativePrompt;
    const shouldShow = !isInstalled && !isDismissed;

    return {
        shouldShow,
        isInstalled,
        canShowNativePrompt,
        needsManualInstall,
        isIOS,
        isSafari,
        isFirefox,
        platform,
        browser,
        promptInstall,
        dismiss,
    };
}
