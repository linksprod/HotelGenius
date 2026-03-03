
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import MainServicesSection from '@/components/home/MainServicesSection';
import FeaturedExperienceSection from '@/components/home/FeaturedExperienceSection';
import EventsStories from '@/components/EventsStories';
import TodayHighlightsSection from '@/components/home/TodayHighlightsSection';
import AdditionalServicesSection from '@/components/home/AdditionalServicesSection';
import AssistanceSection from '@/components/home/AssistanceSection';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';
import WelcomeToast from '@/components/onboarding/WelcomeToast';
import { useOnboarding } from '@/hooks/useOnboarding';

// Custom error boundary fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="p-6 border-2 border-red-300 rounded-md bg-red-50 m-4">
      <h2 className="text-xl font-bold text-red-800 mb-2">{t('errors.generic')}:</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        {t('actions.retry')}
      </button>
    </div>
  );
};

// Error boundary component
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; id: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; id: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in section ${this.props.id}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} resetErrorBoundary={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

const SectionWrapper = ({ children, id }: { children: React.ReactNode; id: string }) => {
  return (
    <div id={id} className="section-container">
      <SectionErrorBoundary id={id}>
        {children}
      </SectionErrorBoundary>
    </div>
  );
};

const Index = () => {
  console.log("Index page rendering started");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { resolvePath } = useHotelPath();
  const {
    isActive: isOnboardingActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    skipTour,
    showWelcome,
    dismissWelcome,
    userName,
    userLastName,
  } = useOnboarding();

  return (
    <Layout>
      <div className="pb-20">
        {/* Hero Section */}
        <SectionWrapper id="hero-section">
          <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
            <HeroSection />

            {/* Login button if user is not authenticated */}
            {!isAuthenticated && (
              <div className="text-center my-6">
                <p className="text-lg mb-4">{t('home.hero.loginPrompt')}</p>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => navigate(resolvePath('/auth/login'))}
                  className="mx-auto"
                >
                  {t('home.hero.loginButton')}
                </Button>
              </div>
            )}
          </Suspense>
        </SectionWrapper>

        {/* Main Services Section */}
        <SectionWrapper id="main-services">
          <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
            <MainServicesSection />
          </Suspense>
        </SectionWrapper>

        {/* Featured Experience */}
        <SectionWrapper id="featured-experience">
          <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
            <FeaturedExperienceSection />
          </Suspense>
        </SectionWrapper>

        {/* Instagram-style Stories Section */}
        <SectionWrapper id="events-stories">
          <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
            <section className="px-6 mb-10">
              <EventsStories />
            </section>
          </Suspense>
        </SectionWrapper>

        {/* Today's Highlights Section */}
        <SectionWrapper id="highlights">
          <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
            <TodayHighlightsSection />
          </Suspense>
        </SectionWrapper>

        {/* Additional Services */}
        <SectionWrapper id="additional-services">
          <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
            <AdditionalServicesSection />
          </Suspense>
        </SectionWrapper>

        {/* Need Assistance */}
        <SectionWrapper id="assistance">
          <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
            <AssistanceSection />
          </Suspense>
        </SectionWrapper>
      </div>

      {/* Onboarding Tour Overlay */}
      <OnboardingOverlay
        isActive={isOnboardingActive}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onNext={nextStep}
        onSkip={skipTour}
      />

      {/* Welcome Back Toast */}
      <WelcomeToast
        show={showWelcome}
        firstName={userName}
        lastName={userLastName}
        onDismiss={dismissWelcome}
      />
    </Layout>
  );
};

export default Index;
