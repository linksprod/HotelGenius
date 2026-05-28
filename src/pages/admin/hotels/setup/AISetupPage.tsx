import React from 'react';
import { useNavigate } from 'react-router-dom';
import AISetupStep from './AISetupStep';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useHotelPath } from '@/hooks/useHotelPath';

export default function AISetupPage() {
  const navigate = useNavigate();
  const { hotel } = useHotel();
  const { resolvePath } = useHotelPath();

  if (!hotel?.id) return null;

  return (
    <div className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden">
      <AISetupStep
        hotelId={hotel.id}
        onFinish={() => navigate(resolvePath('/admin'))}
        onSkip={() => navigate(resolvePath('/admin'))}
        onBack={() => navigate(-1)}
      />
    </div>
  );
}
