
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Headphones } from 'lucide-react';
import { useHotelPath } from '@/hooks/useHotelPath';

const AssistanceSection = () => {
  const { t } = useTranslation();
  const { resolvePath } = useHotelPath();

  return (
    <section className="px-6 mb-10">
      <Link to={resolvePath("/contact")}>
        <Card className="bg-primary text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('home.assistance.title')}</h3>
                <p className="text-sm">{t('home.assistance.subtitle')}</p>
              </div>
            </div>
            <div className="bg-white rounded-full p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 5L18 11M12 5L6 11" stroke="#00AFB9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </Card>
      </Link>
    </section>
  );
};

export default AssistanceSection;
