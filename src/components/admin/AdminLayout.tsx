import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminOnboarding } from '@/hooks/admin/useAdminOnboarding';
import AdminOnboardingOverlay from './AdminOnboardingOverlay';
import AdminTopBar from './AdminTopBar';
import AdminSidebarRail from './AdminSidebarRail';
import PlatformSupportWidget from './support/PlatformSupportWidget';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function getSectionFromPath(pathname: string): string {
  const parts = pathname.split('/');
  const adminIdx = parts.indexOf('admin');
  if (adminIdx === -1 || adminIdx >= parts.length - 1) return 'dashboard';
  return parts[adminIdx + 1] || 'dashboard';
}

function getSectionLabel(sectionId: string): string {
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    chat: 'Inbox',
    guests: 'Guests',
    feedback: 'Feedback',
    housekeeping: 'Housekeeping',
    maintenance: 'Maintenance',
    security: 'Security',
    'information-technology': 'IT Support',
    restaurants: 'Dining',
    spa: 'Wellness',
    events: 'Events',
    shops: 'Shops',
    agent: 'AI Concierge',
    settings: 'Settings',
  };
  return labels[sectionId] ?? sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const sectionId = getSectionFromPath(location.pathname);
  const sectionLabel = getSectionLabel(sectionId);

  // Hide the sidebar rail on settings pages — settings has its own sub-nav
  const isSettingsPage = sectionId === 'settings';

  const { isActive, currentStep, currentStepIndex, totalSteps, nextStep, skipTour } = useAdminOnboarding(sectionId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar Rail — hidden on settings pages */}
      {!isSettingsPage && <AdminSidebarRail />}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <AdminTopBar sectionLabel={sectionLabel} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Platform Support Widget (always visible in admin) */}
      <PlatformSupportWidget />

      {/* Onboarding overlay */}
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
    </div>
  );
};

export default AdminLayout;
