import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RestaurantGalleryProps {
  images: string[];
  name: string;
  status: string;
}

const RestaurantGallery = ({ images, name, status }: RestaurantGalleryProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img 
          src={images[activeImageIndex]} 
          alt={name}
          className="w-full h-full object-cover transition-all"
        />
        <div className="absolute top-2 right-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          `}>
            {t(`common.${status}`, status)}
          </span>
        </div>
      </div>
      
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={`relative rounded-md overflow-hidden w-16 h-16 flex-shrink-0 border-2 ${
                activeImageIndex === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img 
                src={image} 
                alt={`${name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantGallery;
