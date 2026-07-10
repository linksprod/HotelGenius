import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

interface AERoleGuardProps {
  children?: React.ReactNode;
}

const AERoleGuard: React.FC<AERoleGuardProps> = ({ children }) => {
  const { role, loading, isSuperAdmin } = useUserRole();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAE = role === 'account_executive';

  // Allow AE or Super Admin to view the AE dashboard
  if (!isAE && !isSuperAdmin) {
    console.warn('Unauthorized role access attempt to AE dashboard:', { role });
    return <Navigate to="/login" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default AERoleGuard;
