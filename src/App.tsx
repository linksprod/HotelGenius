
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/features/auth/hooks/useAuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';

import { Toaster } from 'sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import PublicRoutes from './routes/PublicRoutes';
import AuthenticatedRoutes from './routes/AuthenticatedRoutes';
import AdminRoutes from './routes/AdminRoutes';
import TenantGuard from './components/TenantGuard';
import ThemeCustomizer from './components/ThemeCustomizer';
import PWAInstallBanner from './components/PWAInstallBanner';
import './i18n';

import { HotelProvider } from '@/features/hotels/context/HotelContext';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="hotel-genius-theme" attribute="class" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Redirect root to a default hotel context */}
              <Route path="/" element={<Navigate to="/demo" replace />} />

              {/* HotelProvider is INSIDE this route so useParams() captures :slug correctly */}
              <Route path="/:slug/*" element={
                <HotelProvider>
                  <ThemeCustomizer />
                  <TenantGuard>
                    <Routes>
                      <Route path="profile/*" element={<AuthenticatedRoutes />} />
                      <Route path="dining/reservations/*" element={<AuthenticatedRoutes />} />
                      <Route path="spa/booking/*" element={<AuthenticatedRoutes />} />
                      <Route path="my-room/*" element={<AuthenticatedRoutes />} />
                      <Route path="notifications/*" element={<AuthenticatedRoutes />} />
                      <Route path="admin/*" element={<AdminRoutes />} />
                      <Route path="/*" element={<PublicRoutes />} />
                    </Routes>
                  </TenantGuard>
                </HotelProvider>
              } />

              {/* Fallback for any other path */}
              <Route path="*" element={<Navigate to="/demo" replace />} />
            </Routes>
            <Toaster richColors position="top-right" closeButton />
            <ShadcnToaster />
            <PWAInstallBanner />
          </AuthProvider>
        </BrowserRouter>

      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

