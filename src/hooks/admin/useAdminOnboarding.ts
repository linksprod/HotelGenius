import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLocation } from 'react-router-dom';

export interface AdminOnboardingStep {
    id: string;
    targetSelector: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
    title: string;
    description: string;
    icon: string;
}

// ─── Dashboard Tour Steps ────────────────────────────────────────
const DASHBOARD_STEPS: AdminOnboardingStep[] = [
    {
        id: 'sidebar-nav',
        targetSelector: '#admin-ob-sidebar',
        placement: 'right',
        title: 'Navigation Sidebar',
        description: 'Access all management sections from here — guests, restaurants, services, and more',
        icon: 'layout',
    },
    {
        id: 'sidebar-notif',
        targetSelector: '#admin-ob-notif-bell',
        placement: 'bottom',
        title: 'Staff Notifications',
        description: 'Real-time alerts for new reservations, messages, and service requests',
        icon: 'bell',
    },
    {
        id: 'dashboard-stats',
        targetSelector: '#admin-ob-stats',
        placement: 'bottom',
        title: 'Key Metrics',
        description: 'Monitor reservations, messages, guest count, and events at a glance',
        icon: 'bar-chart',
    },
    {
        id: 'dashboard-summary',
        targetSelector: '#admin-ob-summary',
        placement: 'top',
        title: 'Detailed Breakdown',
        description: "Reservation breakdown, today's activity, and service status in one view",
        icon: 'clipboard',
    },
    {
        id: 'sidebar-user',
        targetSelector: '#admin-ob-user-profile',
        placement: 'right',
        title: 'Your Profile',
        description: 'Manage your account, change language, toggle theme, or sign out',
        icon: 'user',
    },
];

// ─── Per-Section Tour Steps ──────────────────────────────────────
const SECTION_STEPS: Record<string, AdminOnboardingStep[]> = {
    guests: [
        {
            id: 'guests-header',
            targetSelector: '#admin-ob-guests-header',
            placement: 'bottom',
            title: 'Guest 360°',
            description: 'Full overview of all hotel guests — in-house, arrivals, departures, and past visitors',
            icon: 'users',
        },
        {
            id: 'guests-filters',
            targetSelector: '#admin-ob-guests-filters',
            placement: 'bottom',
            title: 'Quick Filters',
            description: "Filter guests by status — see who's arriving, departing, or currently in-house",
            icon: 'filter',
        },
        {
            id: 'guests-table',
            targetSelector: '#admin-ob-guests-table',
            placement: 'top',
            title: 'Guest Details',
            description: 'Search, sort, and click any guest to see their full profile and stay history',
            icon: 'table',
        },
    ],
    restaurants: [
        {
            id: 'restaurants-header',
            targetSelector: '#admin-ob-restaurants-header',
            placement: 'bottom',
            title: 'Restaurant Management',
            description: 'Manage all restaurants, their bookings, and menus from one place',
            icon: 'utensils',
        },
        {
            id: 'restaurants-tabs',
            targetSelector: '#admin-ob-restaurants-tabs',
            placement: 'bottom',
            title: 'Restaurants · Bookings · Menus',
            description: 'Switch between restaurant listings, table reservations, and menu management',
            icon: 'tabs',
        },
        {
            id: 'restaurants-actions',
            targetSelector: '#admin-ob-restaurants-actions',
            placement: 'bottom',
            title: 'Quick Actions',
            description: 'Add new restaurants, refresh data, or manage individual restaurant settings',
            icon: 'plus',
        },
    ],
    spa: [
        {
            id: 'spa-header',
            targetSelector: '#admin-ob-spa-header',
            placement: 'bottom',
            title: 'Spa Management',
            description: 'Manage wellness treatments, therapists, and spa bookings',
            icon: 'sparkles',
        },
    ],
    events: [
        {
            id: 'events-header',
            targetSelector: '#admin-ob-events-header',
            placement: 'bottom',
            title: 'Events & Promotions',
            description: 'Create and manage hotel events, special offers, and promotions',
            icon: 'party',
        },
    ],
    housekeeping: [
        {
            id: 'housekeeping-header',
            targetSelector: '#admin-ob-housekeeping-header',
            placement: 'bottom',
            title: 'Housekeeping',
            description: 'Track cleaning requests, assign tasks, and monitor room readiness',
            icon: 'trash',
        },
    ],
    maintenance: [
        {
            id: 'maintenance-header',
            targetSelector: '#admin-ob-maintenance-header',
            placement: 'bottom',
            title: 'Maintenance',
            description: 'Manage repair requests, track priorities, and update statuses',
            icon: 'wrench',
        },
    ],
    security: [
        {
            id: 'security-header',
            targetSelector: '#admin-ob-security-header',
            placement: 'bottom',
            title: 'Security',
            description: 'Monitor security incidents and manage patrol reports',
            icon: 'shield',
        },
    ],
    'information-technology': [
        {
            id: 'it-header',
            targetSelector: '#admin-ob-it-header',
            placement: 'bottom',
            title: 'IT Support',
            description: 'Handle IT requests, connectivity issues, and tech support tickets',
            icon: 'wifi',
        },
    ],
    chat: [
        {
            id: 'chat-header',
            targetSelector: '#admin-ob-chat-header',
            placement: 'bottom',
            title: 'Chat Manager',
            description: 'View and respond to guest conversations in real-time',
            icon: 'message',
        },
    ],
    feedback: [
        {
            id: 'feedback-header',
            targetSelector: '#admin-ob-feedback-header',
            placement: 'bottom',
            title: 'Guest Feedback',
            description: 'Review guest ratings, comments, and satisfaction scores',
            icon: 'star',
        },
    ],
    staff: [
        {
            id: 'staff-header',
            targetSelector: '#admin-ob-staff-header',
            placement: 'bottom',
            title: 'Staff Management',
            description: 'Manage team members, assign roles, and configure permissions',
            icon: 'user-cog',
        },
    ],
    hotels: [
        {
            id: 'hotels-header',
            targetSelector: '#admin-ob-hotels-header',
            placement: 'bottom',
            title: 'Hotels',
            description: 'Manage all hotel properties in your portfolio',
            icon: 'building',
        },
    ],
    shops: [
        {
            id: 'shops-header',
            targetSelector: '#admin-ob-shops-header',
            placement: 'bottom',
            title: 'Shops',
            description: 'Manage hotel shops and retail experiences',
            icon: 'store',
        },
    ],
    'destination-admin': [
        {
            id: 'destination-header',
            targetSelector: '#admin-ob-destination-header',
            placement: 'bottom',
            title: 'Destinations',
            description: 'Manage local attractions, activities, and transportation info',
            icon: 'map-pin',
        },
    ],
    about: [
        {
            id: 'about-header',
            targetSelector: '#admin-ob-about-header',
            placement: 'bottom',
            title: 'About Editor',
            description: "Edit the hotel's about page content and history",
            icon: 'file-text',
        },
    ],
    'hotel-profile': [
        {
            id: 'hotel-profile-header',
            targetSelector: '#admin-ob-hotel-profile-header',
            placement: 'bottom',
            title: 'Hotel Profile',
            description: 'Update hotel name, logo, and branding settings',
            icon: 'image',
        },
    ],
};

function getStorageKey(section: string, userId: string) {
    return `admin_tour_${section}_${userId}`;
}

/**
 * Admin onboarding hook. Pass `sectionId` to trigger a section-specific tour,
 * or 'dashboard' for the main dashboard tour.
 */
export function useAdminOnboarding(sectionId: string = 'dashboard') {
    const { user } = useAuth();
    const { role, loading: roleLoading } = useUserRole();

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const userId = user?.id || '';

    // Get steps for the current section
    const steps = useMemo(() => {
        if (sectionId === 'dashboard') {
            return DASHBOARD_STEPS;
        }
        return SECTION_STEPS[sectionId] || [];
    }, [sectionId]);

    const storageKey = useMemo(() => getStorageKey(sectionId, userId), [sectionId, userId]);

    // Trigger tour on first visit to this section
    useEffect(() => {
        if (roleLoading || !userId || steps.length === 0) return;

        const timer = setTimeout(() => {
            const seen = localStorage.getItem(storageKey);
            if (!seen) {
                setIsActive(true);
                setCurrentStepIndex(0);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [roleLoading, userId, storageKey, steps.length]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            setIsActive(false);
            localStorage.setItem(storageKey, 'true');
        }
    }, [currentStepIndex, steps.length, storageKey]);

    const skipTour = useCallback(() => {
        setIsActive(false);
        localStorage.setItem(storageKey, 'true');
    }, [storageKey]);

    const currentStep = steps[currentStepIndex] || null;

    return {
        isActive,
        currentStep,
        currentStepIndex,
        totalSteps: steps.length,
        nextStep,
        skipTour,
        role,
    };
}
