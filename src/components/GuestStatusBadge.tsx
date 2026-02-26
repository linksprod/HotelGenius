
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface GuestStatusBadgeProps {
  role?: string;
  className?: string;
}

const GuestStatusBadge: React.FC<GuestStatusBadgeProps> = ({
  role = 'user',
  className
}) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' };
      case 'admin':
      case 'hotel_admin':
        return { label: 'Hotel Admin', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' };
      case 'moderator':
        return { label: 'Moderator', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' };
      case 'staff':
        return { label: 'Hotel Staff', color: 'bg-green-100 text-green-800 hover:bg-green-200' };
      default:
        return { label: 'Premium Guest', color: 'bg-amber-100 text-amber-800 hover:bg-amber-200' };
    }
  };

  const { label, color } = getRoleConfig();

  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1 ${color} ${className}`}
    >
      <Crown size={14} className="opacity-70" />
      {label}
    </Badge>
  );
};

export default GuestStatusBadge;
