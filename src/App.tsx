
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/features/auth/hooks/useAuthContext';
import AuthGuard from '@/components/AuthGuard';
import { ThemeProvider } from '@/components/ThemeProvider';

import { Toaster } from 'sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import PublicRoutes from './routes/PublicRoutes';
import AuthenticatedRoutes from './routes/AuthenticatedRoutes';
import AdminRoutes from './routes/AdminRoutes';
import Login from '@/pages/auth/Login';
const SuperDashboard = React.lazy(() => import('@/pages/admin/super/SuperDashboard'));
const AdminLayout = React.lazy(() => import('@/components/admin/AdminLayout'));
const AdminRoleGuard = React.lazy(() => import('@/components/admin/AdminRoleGuard'));
const HotelsManager = React.lazy(() => import('@/pages/admin/HotelsManager'));
const StaffManager = React.lazy(() => import('@/pages/admin/settings/StaffManager'));
const SuperAIInfrastructure = React.lazy(() => import('@/pages/admin/super/SuperAIInfrastructure'));
const NotificationCentre = React.lazy(() => import('@/pages/admin/overview/NotificationCentre'));
const SuperLoyaltyManager = React.lazy(() => import('@/pages/admin/super/SuperLoyaltyManager'));
const PlatformBulletinsManager = React.lazy(() => import('@/pages/admin/super/PlatformBulletinsManager'));
const SuperAEManager = React.lazy(() => import('@/pages/admin/super/SuperAEManager'));
const AEDetailPage = React.lazy(() => import('@/pages/admin/super/AEDetailPage'));
// AE workspace
const AELayout = React.lazy(() => import('@/components/ae/AELayout'));
const AERoleGuard = React.lazy(() => import('@/components/ae/AERoleGuard'));
const AEDashboard = React.lazy(() => import('@/pages/ae/AEDashboard'));
const AEHotelManagement = React.lazy(() => import('@/pages/ae/AEHotelManagement'));
import TenantGuard from './components/TenantGuard';
import ThemeCustomizer from './components/ThemeCustomizer';
import PWAInstallBanner from './components/PWAInstallBanner';
import './i18n';

import { HotelProvider } from '@/features/hotels/context/HotelContext';

import { isCustomDomain } from '@/utils/domain';

const TenantApp = ({ hideAdmin = false }: { hideAdmin?: boolean }) => (
  <HotelProvider>
    <ThemeCustomizer />
    <TenantGuard>
      <Routes>
        <Route path="profile/*" element={<AuthenticatedRoutes />} />
        <Route path="dining/reservations/*" element={<AuthenticatedRoutes />} />
        <Route path="spa/booking/*" element={<AuthenticatedRoutes />} />
        <Route path="my-room/*" element={<AuthenticatedRoutes />} />
        <Route path="notifications/*" element={<AuthenticatedRoutes />} />
        {!hideAdmin && <Route path="admin/*" element={<AdminRoutes />} />}
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
    </TenantGuard>
  </HotelProvider>
);

const queryClient = new QueryClient();

function App() {
  const customDomain = isCustomDomain();

  return (
    <ThemeProvider defaultTheme="light" storageKey="hotel-genius-theme" attribute="class" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {customDomain ? (
                /* Custom Domain Mode: Serve Guest App directly at root, block Admin panel */
                <Route path="/*" element={<TenantApp hideAdmin={true} />} />
              ) : (
                /* Standard Platform Mode: Requires /slug/ prefix */
                <>
                  {/* Redirect root directly to login */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={
                    <HotelProvider>
                      <Login />
                    </HotelProvider>
                  } />
                  <Route path="/auth/login" element={
                    <HotelProvider>
                      <Login />
                    </HotelProvider>
                  } />

                  {/* HotelProvider is INSIDE this route so useParams() captures :slug correctly */}
                  <Route path="/:slug/*" element={<TenantApp />} />
                </>
              )}

              <Route path="/administration/*" element={
                <HotelProvider>
                  <AuthGuard adminRequired={true}>
                    <React.Suspense fallback={
                      <div className="h-screen w-full flex items-center justify-center bg-background">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }>
                      <AdminRoleGuard allowedRoles={['super_admin']}>
                        <AdminLayout>
                          <Routes>
                            <Route path="super/dashboard" element={<SuperDashboard />} />
                            <Route path="super/hotels" element={<HotelsManager />} />
                            <Route path="super/users" element={<StaffManager />} />
                            <Route path="super/ai" element={<SuperAIInfrastructure />} />
                            <Route path="super/notifications" element={<NotificationCentre />} />
                            <Route path="super/loyalty" element={<SuperLoyaltyManager />} />
                            <Route path="super/bulletins" element={<PlatformBulletinsManager />} />
                            <Route path="super/settings" element={<HotelsManager />} />
                            <Route path="super/destinations" element={<HotelsManager />} />
                            <Route path="super/account-executives" element={<SuperAEManager />} />
                            <Route path="super/account-executives/:aeId" element={<AEDetailPage />} />
                            <Route path="*" element={<Navigate to="super/dashboard" replace />} />
                          </Routes>
                        </AdminLayout>
                      </AdminRoleGuard>
                    </React.Suspense>
                  </AuthGuard>
                </HotelProvider>
              } />

              {/* Fallback for any other path */}
              <Route path="*" element={<Navigate to="/demo" replace />} />

              {/* ─── Account Executive Workspace ─────────────────────────────────── */}
              <Route path="/ae/*" element={
                <HotelProvider>
                  <AuthGuard adminRequired={true}>
                    <React.Suspense fallback={
                      <div className="h-screen w-full flex items-center justify-center bg-background">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }>
                      <AERoleGuard>
                        <AELayout>
                          <Routes>
                            <Route path="dashboard" element={<AEDashboard />} />
                            <Route path="hotels" element={<AEHotelManagement />} />
                            <Route path="*" element={<Navigate to="dashboard" replace />} />
                          </Routes>
                        </AELayout>
                      </AERoleGuard>
                    </React.Suspense>
                  </AuthGuard>
                </HotelProvider>
              } />
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

