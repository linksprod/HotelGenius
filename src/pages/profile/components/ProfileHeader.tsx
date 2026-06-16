
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ProfileImageUploader from '@/components/profile/ProfileImageUploader';
import { UserData } from '@/features/users/types/userTypes';

interface ProfileHeaderProps {
  userData: UserData | null;
  handleProfileImageChange: (imageData: string | null) => Promise<void>;
}

const ProfileHeader = ({ userData, handleProfileImageChange }: ProfileHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-primary/10 p-6">
        <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left">
          {userData && (
            <ProfileImageUploader
              initialImage={userData.profile_image}
              firstName={userData.first_name}
              lastName={userData.last_name}
              onImageChange={handleProfileImageChange}
            />
          )}
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold">
                {userData ? `${userData.first_name} ${userData.last_name}` : t('profilePage.header.guest')}
              </h1>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">{t('profilePage.header.premiumGuest')}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
