import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

const moderatorAllowedPaths = [
  '/admin',
  '/admin/chat',
  '/admin/housekeeping',
  '/admin/maintenance',
  '/admin/security',
  '/admin/information-technology',
];

const staffAllowedPaths = [
  '/admin',
  '/admin/restaurants',
];

interface AdminRoleGuardProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

const AdminRoleGuard: React.FC<AdminRoleGuardProps> = ({ children, allowedRoles }) => {
  const { role, hotelId: assignedHotelId, hotelSlug, loading, isSuperAdmin } = useUserRole();
  const { hotelId: contextHotelId } = useCurrentHotelId();
  const location = useLocation();
  const { resolvePath } = useHotelPath();

  if (loading) return null;

  // Check if role is allowed if restrictions are provided
  if (allowedRoles && !isSuperAdmin) {
    if (role && !allowedRoles.includes(role)) {
      console.warn('Unauthorized role access attempt:', { role, allowedRoles });
      
      // Avoid slug-based redirect loop for top-level /administration routes
      if (location.pathname.startsWith('/administration')) {
        return <Navigate to="/demo" replace />; // Fallback to demo or login 
      }
      
      return <Navigate to={resolvePath('/admin')} replace />;
    }
  }

  // If the user attempts to access a hotel dashboard that isn't theirs (and isn't a super admin)
  if (!isSuperAdmin && assignedHotelId && contextHotelId && assignedHotelId !== contextHotelId) {
    console.warn('Unauthorized hotel access attempt:', { assignedHotelId, contextHotelId });
    // Prefer redirecting to the slug if available
    const redirectBase = hotelSlug || assignedHotelId;
    return <Navigate to={`/${redirectBase}/admin`} replace />;
  }

  const path = location.pathname;

  if (role === 'moderator') {
    const allowed = moderatorAllowedPaths.some(p => {
      const resolved = resolvePath(p);
      return path === resolved || path.startsWith(resolved + '/');
    });
    if (!allowed) return <Navigate to={resolvePath('/admin')} replace />;
  }

  if (role === 'staff') {
    const allowed = staffAllowedPaths.some(p => {
      const resolved = resolvePath(p);
      return path === resolved || path.startsWith(resolved + '/');
    });
    if (!allowed) return <Navigate to={resolvePath('/admin')} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default AdminRoleGuard;
