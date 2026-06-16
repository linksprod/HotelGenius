import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import RegistrationForm from './RegistrationForm';
import SaaS_RegistrationForm from './SaaS_RegistrationForm';
import LoginForm from './LoginForm';
import { useTranslation } from 'react-i18next';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { Hotel } from 'lucide-react';

const LoginCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { hotel } = useHotel();
  const { t } = useTranslation();
  
  const isSaaSMode = !hotel || hotel?.slug === 'demo';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      {/* ── Header: Logo + Brand ── */}
      <div className="text-center mb-8">

        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {isSaaSMode ? (
            <span className="font-qurova">
              HotelGenius
            </span>
          ) : (
            hotel.name
          )}
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          {activeTab === 'login'
            ? t('auth.adminLoginDesc', 'Welcome back — sign in to your account')
            : isSaaSMode ? t('auth.saasRegisterDesc', 'Create your hotel platform') : t('auth.adminRegisterDesc', 'Create your account to get started')}
        </p>
      </div>

      {/* ── Card ── */}
      <div className="bg-card border border-border/60 rounded-3xl shadow-xl overflow-hidden">
        {/* Accent line */}
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

        <div className="p-7">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-7 h-11 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                {t('auth.signIn', 'Sign In')}
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                {isSaaSMode ? t('auth.getStarted', 'Get Started') : t('auth.createAccount', 'Create Account')}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 12 : -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <TabsContent value="login" forceMount className={activeTab !== 'login' ? 'hidden' : ''}>
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register" forceMount className={activeTab !== 'register' ? 'hidden' : ''}>
                  {isSaaSMode ? <SaaS_RegistrationForm /> : <RegistrationForm />}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-7 pb-5 pt-0 text-center">
          <p className="text-xs text-muted-foreground/60">
            {t('auth.securedBy', 'Secured by Hotel Genius')} · {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Mobile brand note */}
      <p className="text-center text-xs text-muted-foreground/50 mt-5 lg:hidden">
        {t('auth.smartPlatform', 'Hotel Genius — Smart Hotel Management Platform')}
      </p>
    </motion.div>
  );
};

export default LoginCard;
