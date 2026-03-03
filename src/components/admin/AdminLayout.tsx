import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAdminOnboarding } from '@/hooks/admin/useAdminOnboarding';
import AdminOnboardingOverlay from './AdminOnboardingOverlay';
import { useLocation } from 'react-router-dom';

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
      <SidebarInset>
        <div className="flex h-14 shrink-0 items-center px-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>

      {/* Onboarding overlay — works for any section */}
      <AdminOnboardingOverlay
        isActive={isActive}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onNext={nextStep}
        onSkip={skipTour}
      />
    </SidebarProvider>
  );
};

export default AdminLayout;
