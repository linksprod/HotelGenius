import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallBanner: React.FC = () => {
    const { isInstallable, promptInstall } = usePWAInstall();
    const [dismissed, setDismissed] = useState(false);

    if (!isInstallable || dismissed) return null;

    return (
        <div className="fixed bottom-20 left-3 right-3 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">Install Hotel Genius</p>
                    <p className="text-xs text-muted-foreground">Add to your home screen for the best experience</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={promptInstall}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Install
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallBanner;
