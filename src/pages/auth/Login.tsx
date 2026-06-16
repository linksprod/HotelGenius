import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoginCard from './components/LoginCard';
import { useHotelPath } from '@/hooks/useHotelPath';
import { motion } from 'framer-motion';
import { isCustomDomain } from '@/utils/domain';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { hotel } = useHotel();
  const onCustomDomain = isCustomDomain();
  const { t } = useTranslation();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isSuperAdminEmail = session.user.email === 'projects@hotelgenius.app';
        const { data: isStaff } = await supabase.rpc('is_staff_member', { _user_id: session.user.id });
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_id: session.user.id });
        
        if (isSuperAdmin || isSuperAdminEmail) {
          navigate('/administration/super/dashboard', { replace: true });
        } else if (isStaff) {
          navigate(resolvePath('/admin'), { replace: true });
        } else {
          const { data: guestData } = await supabase
            .from('guests')
            .select('hotel_id, hotels(slug)')
            .eq('user_id', session.user.id)
            .maybeSingle();

          // @ts-ignore
          const hotelSlug = guestData?.hotels?.slug;
          if (hotelSlug) {
            navigate(`/${hotelSlug}`, { replace: true });
          } else {
            const targetPath = resolvePath('/');
            if (targetPath !== '/') {
              navigate(targetPath, { replace: true });
            } else {
              console.warn("Guest user has no associated hotel. Signing out to prevent loop.");
              await supabase.auth.signOut();
              localStorage.clear();
            }
          }
        }
      }
    };
    checkSession();
  }, [navigate, resolvePath]);

  // On custom domains: show a clean centered login page with hotel branding only
  if (onCustomDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background relative z-0">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)/0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <LoginCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative bg-background">
      {/* ── Left panel: Brand hero (hidden on mobile) ── */}
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

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-white font-qurova font-bold text-2xl tracking-tight">
              HotelGenius
            </span>
          </div>
        </div>

        {/* Center headline */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              {t('auth.adminHeroTitle', 'Manage your hotel smarter.')}
            </h1>
            <p className="text-white/75 text-lg mt-4 leading-relaxed max-w-sm">
              {t('auth.adminHeroDesc', 'One platform for every guest experience — from bookings to room service, powered by AI.')}
            </p>
          </motion.div>

          {/* Feature bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col gap-3"
          >
            {[
              t('auth.adminFeature1', 'Real-time guest request management'),
              t('auth.adminFeature2', 'AI-powered chat & assistant'),
              t('auth.adminFeature3', 'Full booking & restaurant control'),
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
          © {new Date().getFullYear()} Hotel Genius · {t('auth.trustedBy', 'Trusted by hotels worldwide')}
        </div>
      </div>

      {/* ── Right panel: Login form ── */}
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

        <LoginCard />
      </div>
    </div>
  );
};

export default Login;
