import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import AdminRoleGuard from '@/components/admin/AdminRoleGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminRoutes, SuperDashboard } from '@/config/admin/routes';
import { useHotel } from '@/features/hotels/context/HotelContext';
import ErrorBoundary from '@/components/ErrorBoundary';

const AdminRoutes = () => {
  const { hotel } = useHotel();

  return (
    <ErrorBoundary>
      <AuthGuard adminRequired={true}>
        <AdminRoleGuard>
          <AdminLayout>
            <React.Suspense fallback={
              <div className="h-full w-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-sm font-medium text-muted-foreground animate-pulse font-mono uppercase tracking-[0.2em]">Synchronizing Agent Data...</p>
                </div>
              </div>
            }>
              <Routes>
                {adminRoutes.map((route, index) => {
                  const RouteElement = (
                    <AdminRoleGuard allowedRoles={route.requiredRoles} requiredModules={route.requiredModules}>
                      <route.component />
                    </AdminRoleGuard>
                  );

                  return (
                    <Route key={index} path={route.path} element={RouteElement}>
                      {route.children && route.children.map((childRoute, childIndex) => (
                        <Route 
                          key={`child-${childIndex}`}
                          path={childRoute.path} 
                          element={
                            <AdminRoleGuard allowedRoles={childRoute.requiredRoles} requiredModules={childRoute.requiredModules}>
                              <childRoute.component />
                            </AdminRoleGuard>
                          } 
                        />
                      ))}
                    </Route>
                  );
                })}
                
                <Route path="super" element={<AdminRoleGuard allowedRoles={['super_admin']} />}>
                  <Route path="dashboard" element={<SuperDashboard />} />
                </Route>
                
                {/* Fallback for unmapped premium features */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Premium Feature Unlocked</h2>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      This feature is active on your current plan. The module interface is being provisioned for your property and will be available shortly.
                    </p>
                  </div>
                } />
              </Routes>
            </React.Suspense>
          </AdminLayout>
        </AdminRoleGuard>
      </AuthGuard>
    </ErrorBoundary>
  );
};

export default AdminRoutes;
