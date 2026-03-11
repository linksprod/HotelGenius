
import React from 'react';
import Layout from '@/components/Layout';
import ProfileHeader from './components/ProfileHeader';
import PersonalInformation from './components/PersonalInformation';
import CurrentStay from './components/CurrentStay';
import PreferencesSection from './components/PreferencesSection';
import CompanionsList from './components/CompanionsList';
import NotificationsList from './components/NotificationsList';
import QuickActions from './components/QuickActions';
import { useProfileData } from './hooks/useProfileData';

const Profile = () => {
  const {
    userData,
    companions,
    notifications,
    stayDuration,
    dismissNotification,
    handleProfileImageChange,
    addCompanion
  } = useProfileData();

  return (
    <Layout>
      <div className="container max-w-4xl py-8 pt-6 md:pt-8 px-4 md:px-6 bg-background text-foreground">
        <ProfileHeader
          userData={userData}
          handleProfileImageChange={handleProfileImageChange}
        />

        <PersonalInformation userData={userData} />

        <CurrentStay
          userData={userData}
          stayDuration={stayDuration}
        />

        <PreferencesSection />

        <CompanionsList
          companions={companions}
          onAddCompanion={addCompanion}
        />

        <NotificationsList
          notifications={notifications}
          dismissNotification={dismissNotification}
        />

        <QuickActions />
      </div>
    </Layout>
  );
};

export default Profile;
