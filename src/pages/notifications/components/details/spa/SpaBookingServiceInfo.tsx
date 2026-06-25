
import React from 'react';
import { Clock } from 'lucide-react';

interface SpaBookingServiceInfoProps {
  service: {
    name: string;
    description: string;
    duration: string;
    price: number;
  };
}

export const SpaBookingServiceInfo: React.FC<SpaBookingServiceInfoProps> = ({ service }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-lg">{service.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {service.duration}
        </div>
        <span className="font-semibold">{service.price} DT</span>
      </div>
    </div>
  );
};
