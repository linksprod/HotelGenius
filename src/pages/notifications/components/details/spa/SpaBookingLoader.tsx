
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';

export const SpaBookingLoader: React.FC = () => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(resolvePath('/notifications'))}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour aux notifications
        </Button>

        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <Skeleton className="h-28 w-full rounded-md" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          <Skeleton className="h-1 w-full" />

          <div>
            <Skeleton className="h-5 w-40 mb-3" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>

          <Skeleton className="h-1 w-full" />

          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
