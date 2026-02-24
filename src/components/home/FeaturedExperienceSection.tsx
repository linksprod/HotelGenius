
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import SwipeIndicator from '@/components/ui/swipe-indicator';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

const FeaturedExperienceSection = () => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const featuredExperiences = [
    {
      id: '1',
      title: t('home.featuredExperience.luxurySpa'),
      description: t('home.featuredExperience.luxurySpaDescription'),
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      category: t('home.featuredExperience.spaCategory'),
      path: '/spa'
    },
    {
      id: '2',
      title: t('home.featuredExperience.wineTasting'),
      description: t('home.featuredExperience.wineTastingDescription'),
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: t('home.featuredExperience.diningCategory'),
      path: '/dining'
    }
  ];

  return (
    <section className="px-6 mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-4">{t('home.featuredExperience.title')}</h2>
      <Carousel className="w-full">
        <CarouselContent ref={emblaRef}>
          {featuredExperiences.map((experience, index) => (
            <CarouselItem key={experience.id}>
              <motion.div
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{
                  opacity: selectedIndex === index ? 1 : 0.8,
                  scale: selectedIndex === index ? 1 : 0.95
                }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative h-64">
                    <img
                      src={experience.image}
                      alt={experience.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <span className="text-sm font-medium bg-primary/50 backdrop-blur-sm px-3 py-1 rounded-full mb-2 inline-block">
                        {experience.category}
                      </span>
                      <h3 className="text-2xl font-bold">{experience.title}</h3>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                      {index + 1} / {featuredExperiences.length}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground mb-4">{experience.description}</p>
                    <Button
                      className="w-full"
                      onClick={() => window.location.href = experience.path}
                    >
                      {t('common.exploreNow')}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <SwipeIndicator
        selectedIndex={selectedIndex}
        totalSlides={featuredExperiences.length}
        className="mt-4"
      />
    </section>
  );
};

export default FeaturedExperienceSection;
