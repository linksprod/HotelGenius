import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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

const AdminRoleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, hotelId: assignedHotelId, hotelSlug, loading, isSuperAdmin } = useUserRole();
  const { hotelId: contextHotelId } = useCurrentHotelId();
  const location = useLocation();
  const { resolvePath } = useHotelPath();

  if (loading) return null;

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

  return <>{children}</>;
};

export default AdminRoleGuard;
