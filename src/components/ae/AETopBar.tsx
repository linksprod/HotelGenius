import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
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
import { LogOut, Settings, Building2, User } from 'lucide-react';

interface AETopBarProps {
  sectionLabel?: string;
}

const AETopBar: React.FC<AETopBarProps> = ({ sectionLabel = 'Account Executive' }) => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const displayName = userData?.first_name
    ? `${userData.first_name} ${userData.last_name ?? ''}`.trim()
    : user?.email ?? 'Account Executive';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 flex flex-col shrink-0">
      <div className="w-full h-[56px] flex items-center justify-between px-4 gap-3 bg-background border-b border-border/40">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/ae/dashboard" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
          </Link>
          <span className="text-border/80 text-sm hidden sm:block">/</span>
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {sectionLabel}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />

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
              <DropdownMenuItem onClick={() => navigate('/ae/dashboard')}>
                <User className="w-4 h-4 mr-2" />
                Dashboard
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
  );
};

export default AETopBar;
