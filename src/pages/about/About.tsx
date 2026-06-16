
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
          heroTitle={t(`about.content.heroTitle.${aboutData.id}`, aboutData.hero_title || 'Welcome to Our Hotel')} 
          heroSubtitle={t(`about.content.heroSubtitle.${aboutData.id}`, aboutData.hero_subtitle || 'Discover luxury and comfort')} 
        />
      </div>
      
      <div className="container mx-auto py-8">
        <WelcomeSection 
          welcomeTitle={t(`about.content.welcomeTitle.${aboutData.id}`, aboutData.welcome_title || '')} 
          welcomeDescription={t(`about.content.welcomeDescription.${aboutData.id}`, aboutData.welcome_description || '')} 
          welcomeDescriptionExtended={t(`about.content.welcomeDescriptionExtended.${aboutData.id}`, aboutData.welcome_description_extended || '')}
        />
        
        {aboutData.mission && (
          <MissionSection mission={t(`about.content.mission.${aboutData.id}`, aboutData.mission)} />
        )}
        
        <FeaturesSection features={aboutData.features?.map(feature => ({
          ...feature,
          title: t(`about.content.features.${feature.icon}.title`, feature.title),
          description: t(`about.content.features.${feature.icon}.description`, feature.description)
        })) || []} />
        
        <DirectorySection 
          directoryTitle={t(`about.content.directoryTitle.${aboutData.id}`, 
            aboutData.directory_title === 'Hotel Directory & Information' || !aboutData.directory_title
              ? t('about.directory.title', 'Hotel Directory & Information')
              : t(`about.directory.title.${aboutData.directory_title}`, aboutData.directory_title)
          )}
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
