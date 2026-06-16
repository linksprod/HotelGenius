
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';

interface BookingNotFoundProps {
  bookingId?: string;
  errorMessage?: string;
}

const BookingNotFound: React.FC<BookingNotFoundProps> = ({ bookingId, errorMessage }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">{t('spa.bookingDetails.notFound.title', 'Booking Not Found')}</h3>
        <p className="text-gray-500 mb-4">
          {errorMessage || t('spa.bookingDetails.notFound.description', "The booking you are looking for doesn't exist or has been deleted.")}
          {bookingId && <span className="block text-sm mt-1">ID: {bookingId}</span>}
        </p>
        <Button onClick={() => navigate(resolvePath('/profile'))}>
          {t('spa.bookingDetails.notFound.backToProfile', 'Back to Profile')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookingNotFound;
