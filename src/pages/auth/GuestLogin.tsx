import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import GuestLoginCard from './components/GuestLoginCard';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useHotel } from '@/features/hotels/context/HotelContext';

const GuestLogin = () => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { hotel } = useHotel();
  const { t } = useTranslation();

  const hasChecked = React.useRef(false);

  useEffect(() => {
    const handleSession = async (session: any) => {
      if (!session?.user) return;
      
      const isSuperAdminEmail = session.user.email === 'projects@hotelgenius.app';
      const { data: isStaff } = await supabase.rpc('is_staff_member', { _user_id: session.user.id });
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_id: session.user.id });
      
      if (isSuperAdmin || isSuperAdminEmail) {
        navigate('/administration/super/dashboard', { replace: true });
      } else if (isStaff) {
        navigate(resolvePath('/admin'), { replace: true });
      } else {
        navigate(resolvePath('/'), { replace: true });
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, resolvePath]);


  return (
    <div className="min-h-screen flex overflow-hidden relative bg-background">
      {/* ── Left panel: Hotel brand hero (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary)/0.85)] to-[hsl(var(--primary)/0.6)] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 pointer-events-none" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo/Hotel Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-white font-qurova font-bold text-2xl tracking-tight">
              {hotel?.name || 'HotelGenius'}
            </span>
          </div>
        </div>

        {/* Center guest-oriented headline */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              {t('auth.guestHeroTitle', 'Live Your Stay to the Fullest.')}
            </h1>
            <p className="text-white/75 text-lg mt-4 leading-relaxed max-w-sm">
              {t('auth.guestHeroDesc', 'Discover unique experiences, request services, and stay connected with our team during your visit.')}
            </p>
          </motion.div>

          {/* Guest feature bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col gap-3"
          >
            {[
              t('auth.guestFeature1', 'Direct communication with the concierge'),
              t('auth.guestFeature2', 'Reserve restaurant tables and spa treatments'),
              t('auth.guestFeature3', 'Check details and requests for your room'),
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} {hotel?.name || 'HotelGenius'} · {t('auth.poweredBy', 'Powered by Hotel Genius')}
        </div>
      </div>

      {/* ── Right panel: Guest login form ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 relative z-0">
        {/* Subtle dot grid background */}
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)/0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <GuestLoginCard />
      </div>
    </div>
  );
};

export default GuestLogin;
