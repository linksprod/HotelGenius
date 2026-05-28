import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { Role } from '@/config/admin/navigation';

interface AdminRoleGuardProps {
  children?: React.ReactNode;
  allowedRoles?: Role[];
  requiredModules?: string[];
}

const AdminRoleGuard: React.FC<AdminRoleGuardProps> = ({ children, allowedRoles, requiredModules }) => {
  const { role, hotelId: assignedHotelId, hotelSlug, loading, isSuperAdmin } = useUserRole();
  const { hotelId: contextHotelId } = useCurrentHotelId();
  const { hotel, loading: hotelLoading } = useHotel();
  const location = useLocation();
  const { resolvePath } = useHotelPath();

  if (loading || hotelLoading) return null;

  // Check role restrictions
  if (allowedRoles && !isSuperAdmin) {
    if (role && !allowedRoles.includes(role as Role)) {
      console.warn('Unauthorized role access attempt:', { role, allowedRoles });
      if (location.pathname.startsWith('/administration')) {
        return <Navigate to="/demo" replace />;
      }
      return <Navigate to={resolvePath('/admin')} replace />;
    }
  }

  // Check module restrictions
  if (requiredModules && requiredModules.length > 0 && !isSuperAdmin) {
    const activeModules = hotel?.active_modules || [];
    const hasRequiredModules = requiredModules.every(mod => activeModules.includes(mod));
    
    if (!hasRequiredModules) {
      console.warn('Unauthorized module access attempt:', { requiredModules, activeModules });
      return <Navigate to={resolvePath('/admin')} replace />;
    }
  }

  // Check tenant isolation
  if (!isSuperAdmin && assignedHotelId && contextHotelId && assignedHotelId !== contextHotelId) {
    console.warn('Unauthorized hotel access attempt:', { assignedHotelId, contextHotelId });
    const redirectBase = hotelSlug || assignedHotelId;
    return <Navigate to={`/${redirectBase}/admin`} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default AdminRoleGuard;
