import React, { useState } from 'react';
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
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const formatCheckInDate = userData?.check_in_date ? formatDate(userData.check_in_date) : 'Not defined';
  const formatCheckOutDate = userData?.check_out_date ? formatDate(userData.check_out_date) : 'Not defined';

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Building className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Current Stay</h2>
          </div>
        </div>
        <div className="divide-y">
          <div className="p-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-500 shrink-0" />
              <div>
                <p className="font-medium">Room</p>
                <p className="text-sm text-muted-foreground">{userData?.room_number || '406'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Key className="h-4 w-4" />
                Mobile Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setBillDialogOpen(true)}
              >
                <Receipt className="h-4 w-4" />
                View Bill
              </Button>
            </div>
          </div>

          <div className="p-4 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Calendar className="h-5 w-5 text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">Stay Dates</p>
                <p className="text-sm text-muted-foreground">
                  From {formatCheckInDate} to {formatCheckOutDate}
                </p>
              </div>
            </div>
            {stayDuration && (
              <Badge variant="outline" className="shrink-0">
                {stayDuration} {stayDuration > 1 ? 'nights' : 'night'}
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
