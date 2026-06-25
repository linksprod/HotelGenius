import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useHotelPath } from '@/hooks/useHotelPath';
import { StaffNotificationBell } from './StaffNotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Search, LogOut, User, Settings, Building2, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminCommandPalette from './AdminCommandPalette';

interface AdminTopBarProps {
  sectionLabel?: string;
  onOpenCommandPalette?: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ sectionLabel, onOpenCommandPalette }) => {
  const { user, userData } = useAuth();
  const { hotel } = useHotel();
  const { isSuperAdmin } = useUserRole();
  const { resolvePath } = useHotelPath();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(resolvePath('/'));
  };

  const displayName = userData?.first_name
    ? `${userData.first_name} ${userData.last_name ?? ''}`.trim()
    : user?.email ?? 'Admin';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="sticky top-0 z-50 flex flex-col shrink-0">
        <div className="admin-topbar w-full flex items-center justify-between px-4 gap-3 shrink-0 border-b-0">
        {/* Left: Logo + Hotel Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={resolvePath('/admin')}
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
          </Link>

          {(hotel?.name || sectionLabel) && (
            <>
              <span className="text-border/80 text-sm hidden sm:block">/</span>
              {hotel?.logo_url ? (
                <img
                  src={hotel.logo_url}
                  alt={hotel?.name || 'Hotel Logo'}
                  className="h-6 w-auto object-contain max-w-[100px] hidden sm:block bg-background/50 rounded p-0.5 border border-border/20"
                />
              ) : (
                <span className="text-sm text-muted-foreground truncate hidden sm:block max-w-[160px]">
                  {hotel?.name ?? sectionLabel}
                </span>
              )}
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <StaffNotificationBell />

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors ml-1 group">
                <Avatar className="w-7 h-7 border-2 border-border group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={userData?.avatar_url ?? ''} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium text-foreground max-w-[100px] truncate">
                  {displayName.split(' ')[0]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate(resolvePath('/admin/settings/hotel-profile'))}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(resolvePath('/admin/settings'))}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
        {/* Sleek Theme Gradient Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-primary via-primary/80 to-accent" />
      </header>

      <AdminCommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
};

export default AdminTopBar;
