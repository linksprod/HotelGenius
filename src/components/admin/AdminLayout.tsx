import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAdminOnboarding } from '@/hooks/admin/useAdminOnboarding';
import AdminOnboardingOverlay from './AdminOnboardingOverlay';
import { useLocation } from 'react-router-dom';
import { StaffNotificationBell } from './StaffNotificationBell';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Derive which section the user is currently on from the URL path.
 * Returns 'dashboard' for the main admin page, otherwise the section slug.
 */
function getSectionFromPath(pathname: string): string {
  // e.g. /demo/admin/guests -> guests, /demo/admin -> dashboard
  const parts = pathname.split('/');
  const adminIdx = parts.indexOf('admin');
  if (adminIdx === -1 || adminIdx >= parts.length - 1) return 'dashboard';
  return parts[adminIdx + 1] || 'dashboard';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const sectionId = getSectionFromPath(location.pathname);

  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    skipTour,
  } = useAdminOnboarding(sectionId);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-h-svh flex flex-col bg-background">
        {/* Mobile Header - Elevated z-index to stay above the landing animation if active */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between px-4 lg:hidden bg-background border-b border-border shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-foreground hover:bg-muted" />
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-sm font-semibold tracking-tight">
              {sectionId === 'dashboard' ? 'Dashboard' : sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <StaffNotificationBell />
          </div>
        </header>

        <main className="flex-1 w-full relative">
          {children}
        </main>
      </SidebarInset>

      {/* Onboarding overlay — works for any section except dashboard */}
      {sectionId !== 'dashboard' && (
        <AdminOnboardingOverlay
          isActive={isActive}
          currentStep={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={nextStep}
          onSkip={skipTour}
        />
      )}
    </SidebarProvider>
  );
};

export default AdminLayout;
