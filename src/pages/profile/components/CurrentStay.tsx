import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Key, Calendar, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserData } from '@/features/users/types/userTypes';
import { formatDate } from '../utils/dateUtils';
import BillDialog from './BillDialog';

interface CurrentStayProps {
  userData: UserData | null;
  stayDuration: number | null;
}

const CurrentStay = ({ userData, stayDuration }: CurrentStayProps) => {
  const { t } = useTranslation();
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const formatCheckInDate = userData?.check_in_date ? formatDate(userData.check_in_date) : t('profilePage.currentStay.notDefined');
  const formatCheckOutDate = userData?.check_out_date ? formatDate(userData.check_out_date) : t('profilePage.currentStay.notDefined');

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Building className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('profilePage.currentStay.title')}</h2>
          </div>
        </div>
        <div className="divide-y">
          <div className="p-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-500 shrink-0" />
              <div>
                <p className="font-medium">{t('profilePage.currentStay.room')}</p>
                <p className="text-sm text-muted-foreground">{userData?.room_number || '406'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Key className="h-4 w-4" />
                {t('profilePage.currentStay.mobileKey')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setBillDialogOpen(true)}
              >
                <Receipt className="h-4 w-4" />
                {t('profilePage.currentStay.viewBill')}
              </Button>
            </div>
          </div>

          <div className="p-4 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Calendar className="h-5 w-5 text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">{t('profilePage.currentStay.stayDates')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('profilePage.currentStay.fromTo', { from: formatCheckInDate, to: formatCheckOutDate })}
                </p>
              </div>
            </div>
            {stayDuration && (
              <Badge variant="outline" className="shrink-0">
                {t(stayDuration > 1 ? 'profilePage.currentStay.nights' : 'profilePage.currentStay.night', { count: stayDuration })}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <BillDialog
        open={billDialogOpen}
        onOpenChange={setBillDialogOpen}
        firstName={userData?.first_name || ''}
        lastName={userData?.last_name || ''}
        stayDuration={stayDuration}
      />
    </Card>
  );
};

export default CurrentStay;
