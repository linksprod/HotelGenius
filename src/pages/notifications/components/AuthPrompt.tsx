
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';

export const AuthPrompt: React.FC = () => {
  const { resolvePath } = useHotelPath();
  return (
    <div className="text-center py-10 space-y-4">
      <p className="text-lg text-gray-600">Please sign in to view your notifications.</p>
      <Button asChild variant="default">
        <Link to={resolvePath("/auth/login")}>Sign in</Link>
      </Button>
    </div>
  );
};
