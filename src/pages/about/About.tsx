
import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { useAboutData } from '@/hooks/useAboutData';
import HeroSection from '@/components/admin/about/HeroSection';
import WelcomeSection from '@/components/admin/about/WelcomeSection';
import MissionSection from '@/components/admin/about/MissionSection';
import DirectorySection from '@/components/admin/about/DirectorySection';
import FeaturesSection from '@/components/admin/about/FeaturesSection';
import { Skeleton } from '@/components/ui/skeleton';

// Safe i18n helper: only build a dynamic key if the segment is a real non-empty string
const safeT = (
  t: (key: string, fallback: string) => string,
  keySegment: string | undefined | null,
  prefix: string,
  fallback: string
): string => {
  if (!keySegment || keySegment === 'undefined' || keySegment === 'null') {
    return fallback || '';
  }
  return t(`${prefix}.${keySegment}`, fallback || '');
};

const About = () => {
  const { t } = useTranslation();
  const { aboutData, isLoadingAbout } = useAboutData();

  if (isLoadingAbout) {
    return (
      <Layout>
        <div className="container mx-auto py-8 pt-6 md:pt-8">
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!aboutData) {
    return (
      <Layout>
        <div className="container mx-auto py-8 pt-6 md:pt-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Hotel information not available.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-6 md:pt-8">
        <HeroSection
          heroImage={aboutData.hero_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80'}
          heroTitle={safeT(t, aboutData.id, 'about.content.heroTitle', aboutData.hero_title || 'Welcome to Our Hotel')}
          heroSubtitle={safeT(t, aboutData.id, 'about.content.heroSubtitle', aboutData.hero_subtitle || 'Discover luxury and comfort')}
        />
      </div>

      <div className="container mx-auto py-8">
        <WelcomeSection
          welcomeTitle={safeT(t, aboutData.id, 'about.content.welcomeTitle', aboutData.welcome_title || '')}
          welcomeDescription={safeT(t, aboutData.id, 'about.content.welcomeDescription', aboutData.welcome_description || '')}
          welcomeDescriptionExtended={safeT(t, aboutData.id, 'about.content.welcomeDescriptionExtended', aboutData.welcome_description_extended || '')}
        />

        {aboutData.mission && (
          <MissionSection mission={safeT(t, aboutData.id, 'about.content.mission', aboutData.mission)} />
        )}

        <FeaturesSection features={(aboutData.features || []).map(feature => ({
            ...feature,
            title: (feature.icon && feature.icon !== 'undefined' && feature.icon !== 'null')
              ? t(`about.content.features.${feature.icon}.title`, feature.title || '')
              : (feature.title || ''),
            description: (feature.icon && feature.icon !== 'undefined' && feature.icon !== 'null')
              ? t(`about.content.features.${feature.icon}.description`, feature.description || '')
              : (feature.description || '')
          }))} />

        <DirectorySection
          directoryTitle={
            !aboutData.directory_title || aboutData.directory_title === 'Hotel Directory & Information'
              ? t('about.directory.title', 'Hotel Directory & Information')
              : safeT(t, aboutData.directory_title, 'about.directory.title', aboutData.directory_title)
          }
          importantNumbers={aboutData.important_numbers || []}
          facilities={aboutData.facilities || []}
          hotelPolicies={aboutData.hotel_policies || []}
          additionalInfo={aboutData.additional_info || []}
        />
      </div>
    </Layout>
  );
};

export default About;
