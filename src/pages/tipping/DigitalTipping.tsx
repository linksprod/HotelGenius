import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

const DigitalTipping = () => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Coins className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">On request</h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          This service is available on request. Please contact the front desk.
        </p>
        <Button 
          onClick={() => navigate(resolvePath('/'))}
          className="w-full max-w-xs rounded-xl h-12 text-base font-medium"
        >
          Return to Home
        </Button>
      </div>
    </Layout>
  );
};

export default DigitalTipping;
