
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Calendar, Flag, Users } from "lucide-react";
import { UserData } from '@/features/users/types/userTypes';
import { formatDate } from '../utils/dateUtils';

interface PersonalInformationProps {
  userData: UserData | null;
}

const PersonalInformation = ({ userData }: PersonalInformationProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
        </div>
        <div className="divide-y">
          {userData?.email && (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
            </div>
          )}

          {userData?.birth_date && (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">{formatDate(userData.birth_date)}</p>
                </div>
              </div>
            </div>
          )}

          {userData?.nationality && (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Flag className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Nationality</p>
                  <p className="text-sm text-muted-foreground">{userData.nationality}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInformation;
