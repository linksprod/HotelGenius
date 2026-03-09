
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';

interface WelcomeCardProps {
    firstName: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ firstName }) => {
    const { t } = useTranslation();
    const { hotel } = useHotel();
    const navigate = useNavigate();
    const { resolvePath } = useHotelPath();

    return (
        <div className="px-6 my-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Section */}
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-colors duration-300">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner border border-primary/20">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>

                    <div className="flex-1 text-left">
                        <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
                            {t('home.welcome.greeting', { name: firstName })}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed font-medium">
                            {t('home.welcome.message', { hotelName: hotel?.name || 'Verdi Hotel' })}
                        </p>

                        <button
                            onClick={() => navigate(resolvePath('/my-room'))}
                            className="group/btn flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-300 text-sm"
                        >
                            <span>{t('home.welcome.seeReservation')}</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeCard;
