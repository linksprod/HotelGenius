
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAboutData } from '@/hooks/useAboutData';
import WelcomeSection from '@/components/admin/about/WelcomeSection';
import MissionSection from '@/components/admin/about/MissionSection';
import FeaturesSection from '@/components/admin/about/FeaturesSection';
import InfoItemSection from '@/components/admin/about/InfoItemSection';
import DirectorySection from '@/components/admin/about/DirectorySection';
import HeroSection from '@/components/admin/about/HeroSection';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useHotel } from '@/features/hotels/context/HotelContext';

const AboutEditor = () => {
  const { aboutData, isLoadingAbout, aboutError, updateAboutData, createInitialAboutData } = useAboutData();
  const { hotel } = useHotel();
  const [activeTab, setActiveTab] = useState('hero');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (isLoadingAbout) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading information...</span>
      </div>
    );
  }

  if (aboutError) {
    return (
      <Card className="p-8 m-4 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Loading Error</h2>
        <p>{aboutError.message}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Card>
    );
  }

  const hotelName = hotel?.name || 'Our Hotel';

  const handleCreateAboutData = async () => {
    setIsCreating(true);
    setCreateError(null);
    const defaultAboutData = {
      welcome_title: `Welcome to ${hotelName}`,
      welcome_description: 'A luxury hotel experience in the heart of the city.',
      welcome_description_extended: 'Since our establishment, we have been committed to creating a home away from home for our guests.',
      mission: 'To provide exceptional hospitality experiences by creating memorable moments for our guests.',
      features: [
        { icon: 'History', title: 'Our History', description: 'Established with a rich heritage' },
        { icon: 'Building2', title: 'Our Property', description: 'Luxury rooms and premium facilities' },
        { icon: 'Users', title: 'Our Team', description: 'Dedicated staff committed to excellence' },
        { icon: 'Award', title: 'Our Awards', description: 'Recognized for outstanding service' }
      ],
      important_numbers: [
        { label: 'Reception', value: 'Dial 0' },
        { label: 'Room Service', value: 'Dial 1' },
        { label: 'Concierge', value: 'Dial 2' }
      ],
      facilities: [
        { label: 'Swimming Pool', value: 'Level 5' },
        { label: 'Fitness Center', value: 'Level 3' },
        { label: 'Spa & Wellness', value: 'Level 4' }
      ],
      hotel_policies: [
        { label: 'Check-in', value: '3:00 PM' },
        { label: 'Check-out', value: '12:00 PM' },
        { label: 'Breakfast', value: '6:30 AM - 10:30 AM' }
      ],
      additional_info: [
        { label: 'Wi-Fi', value: `Network "${hotelName}" - Password provided at check-in` },
        { label: 'Parking', value: 'Valet service available' }
      ],
      directory_title: 'Hotel Directory & Information',
      hero_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80',
      hero_title: `Welcome to ${hotelName}`,
      hero_subtitle: 'Discover luxury and comfort'
    };

    try {
      await createInitialAboutData(defaultAboutData);
    } catch (error: any) {
      console.error('Error creating about data:', error);
      setCreateError(error?.message || 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  if (!aboutData) {
    return (
      <div className="p-8 text-center">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">No information found</h2>
          <p className="mb-6">The "About" page for <strong>{hotelName}</strong> has not been configured yet.</p>
          {createError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-left">
              <strong>Error:</strong> {createError}
            </div>
          )}
          <Button
            onClick={handleCreateAboutData}
            disabled={isCreating}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating content...
              </>
            ) : (
              'Create default content'
            )}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">About Page Editor</h1>
          <p className="text-sm text-muted-foreground">Edit hotel information and directory</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <HeroSection
            heroImage={aboutData?.hero_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80'}
            heroTitle={aboutData?.hero_title || 'Welcome to Our Hotel'}
            heroSubtitle={aboutData?.hero_subtitle || 'Discover luxury and comfort'}
            isEditing={true}
            onSave={(heroData) => updateAboutData({ ...aboutData, ...heroData })}
          />
        </TabsContent>

        <TabsContent value="welcome">
          <WelcomeSection
            welcomeTitle={aboutData?.welcome_title || ''}
            welcomeDescription={aboutData?.welcome_description || ''}
            welcomeDescriptionExtended={aboutData?.welcome_description_extended || ''}
            isEditing={true}
            onSave={(data) => updateAboutData({ ...aboutData, ...data })}
          />
        </TabsContent>

        <TabsContent value="mission">
          <MissionSection
            mission={aboutData.mission}
            isEditing={true}
            onSave={(mission) => updateAboutData({ ...aboutData, mission })}
          />
        </TabsContent>

        <TabsContent value="features">
          <FeaturesSection
            features={aboutData.features}
            isEditing={true}
            onSave={(features) => updateAboutData({ ...aboutData, features })}
          />
        </TabsContent>

        <TabsContent value="directory">
          <h2 className="text-xl font-semibold mb-4">Directory and Information</h2>
          <InfoItemSection
            title="Directory Title"
            items={[{ label: 'Title', value: aboutData.directory_title }]}
            isEditing={true}
            onSave={(items) => updateAboutData({ ...aboutData, directory_title: String(items[0].value) })}
            singleItem={true}
          />

          <DirectorySection
            directoryTitle={aboutData.directory_title}
            importantNumbers={aboutData.important_numbers}
            facilities={aboutData.facilities}
            hotelPolicies={aboutData.hotel_policies}
            additionalInfo={aboutData.additional_info}
            isEditing={true}
            onSaveImportantNumbers={(items) => updateAboutData({ ...aboutData, important_numbers: items })}
            onSaveFacilities={(items) => updateAboutData({ ...aboutData, facilities: items })}
            onSaveHotelPolicies={(items) => updateAboutData({ ...aboutData, hotel_policies: items })}
            onSaveAdditionalInfo={(items) => updateAboutData({ ...aboutData, additional_info: items })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AboutEditor;
