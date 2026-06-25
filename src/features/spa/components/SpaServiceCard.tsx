
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { SpaService } from '../types';

interface SpaServiceCardProps {
  service: SpaService;
  onBook: () => void;
}

const SpaServiceCard = ({
  service,
  onBook
}: SpaServiceCardProps) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Parse comma-separated images or fallback. If it is a base64 Data URL, treat as a single image.
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80";
  const images = service.image 
    ? (service.image.startsWith('data:') 
        ? [service.image] 
        : service.image.split(',').map(s => s.trim()).filter(Boolean)) 
    : [FALLBACK_IMAGE];

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-muted relative overflow-hidden group/img">
        <img 
          src={images[currentImageIndex]} 
          alt={service.name} 
          className="w-full h-full object-cover transition-all duration-300"
          onError={handleImgError}
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover/img:opacity-100 font-bold z-10 text-xs"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover/img:opacity-100 font-bold z-10 text-xs"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-1.5 py-0.5 rounded-full z-10">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{service.name}</h3>
          <span className="text-primary font-semibold">{service.price} DT</span>
        </div>
        {service.duration && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Clock className="h-3 w-3" />
            <span>{service.duration}</span>
          </div>
        )}
        <Button 
          onClick={onBook}
          size="sm" 
          className="w-full mt-2"
        >
          {t('spa.book_now', 'Book Now')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SpaServiceCard;
