import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useLocation } from 'react-router-dom';

export interface OnboardingStep {
    id: string;
    targetSelector: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
    titleKey: string;
    descriptionKey: string;
    icon: string;
}

const TOUR_STEPS: OnboardingStep[] = [
    {
        id: 'menu',
        targetSelector: '#onboarding-menu',
        placement: 'bottom',
        titleKey: 'onboarding.steps.menu.title',
        descriptionKey: 'onboarding.steps.menu.description',
        icon: 'menu',
    },
    {
        id: 'notifications',
        targetSelector: '#onboarding-notifications',
        placement: 'bottom',
        titleKey: 'onboarding.steps.notifications.title',
        descriptionKey: 'onboarding.steps.notifications.description',
        icon: 'bell',
    },
    {
        id: 'profile',
        targetSelector: '#onboarding-profile',
        placement: 'bottom',
        titleKey: 'onboarding.steps.profile.title',
        descriptionKey: 'onboarding.steps.profile.description',
        icon: 'user',
    },
    {
        id: 'bottomNav',
        targetSelector: '#onboarding-bottom-nav',
        placement: 'top',
        titleKey: 'onboarding.steps.bottomNav.title',
        descriptionKey: 'onboarding.steps.bottomNav.description',
        icon: 'layout',
    },
    {
        id: 'done',
        targetSelector: '',
        placement: 'bottom',
        titleKey: 'onboarding.steps.done.title',
        descriptionKey: 'onboarding.steps.done.description',
        icon: 'check',
    },
];

function getWelcomeKey(userId: string) {
    return `welcome_shown_${userId}`;
}

export function useOnboarding() {
    const { isAuthenticated, userData, user, loading } = useAuth();
    const { hotel } = useHotel();

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    // Show tour EVERY TIME for non-authenticated users (no localStorage persistence)
    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated) {
            const timer = setTimeout(() => {
                setIsActive(true);
                setCurrentStepIndex(0);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [loading, isAuthenticated]);

    // Check if welcome toast should be shown (authenticated, first time)
    useEffect(() => {
        if (!isAuthenticated || !user?.id || !userData?.first_name) return;

        const welcomeKey = getWelcomeKey(user.id);
        const timer = setTimeout(() => {
            const seen = localStorage.getItem(welcomeKey);
            if (!seen) {
                setShowWelcome(true);
                localStorage.setItem(welcomeKey, 'true');
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [isAuthenticated, user?.id, userData?.first_name]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            // Tour complete
            setIsActive(false);
        }
    }, [currentStepIndex]);

    const skipTour = useCallback(() => {
        setIsActive(false);
    }, []);

    const dismissWelcome = useCallback(() => {
        setShowWelcome(false);
    }, []);

    const currentStep = TOUR_STEPS[currentStepIndex] || null;

    return {
        isActive,
        currentStep,
        currentStepIndex,
        totalSteps: TOUR_STEPS.length,
        nextStep,
        skipTour,
        showWelcome,
        dismissWelcome,
        userName: userData?.first_name || '',
        userLastName: userData?.last_name || '',
    };
}
