
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  onAction: () => void;
}

const ServiceCard = ({ title, description, icon: Icon, actionText, onAction }: ServiceCardProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className="p-4 sm:p-6 h-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 h-full">
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-2 leading-tight">{title}</h3>
          <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
          <Button 
            variant="outline" 
            onClick={onAction}
            className="w-full sm:w-auto text-sm"
            size="sm"
          >
            {actionText}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
