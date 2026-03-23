import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { Hotel } from 'lucide-react';

const LoginCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { hotel } = useHotel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      {/* ── Header: Logo + Brand ── */}
      <div className="text-center mb-8">
        {/* Hotel logo or HG initials fallback */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              {hotel?.logo_url ? (
                <img
                  src={hotel.logo_url}
                  alt={hotel.name || 'Hotel Genius'}
                  className="h-10 w-10 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <Hotel className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            {/* Green dot badge */}
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {hotel?.name || 'Hotel Genius'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          {activeTab === 'login'
            ? 'Welcome back — sign in to your account'
            : 'Create your account to get started'}
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
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                Create Account
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
                  <RegistrationForm />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-7 pb-5 pt-0 text-center">
          <p className="text-xs text-muted-foreground/60">
            Secured by Hotel Genius · {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Mobile brand note */}
      <p className="text-center text-xs text-muted-foreground/50 mt-5 lg:hidden">
        Hotel Genius — Smart Hotel Management Platform
      </p>
    </motion.div>
  );
};

export default LoginCard;
