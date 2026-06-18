
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
  status: string;
  highlighted?: boolean;
  disabled?: boolean;
}

const ServiceCard = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  status,
  highlighted = false,
  disabled = false 
}: ServiceCardProps) => {
  const { t } = useTranslation();
  
  const cardContent = (
    <Card className={`h-full overflow-hidden transition-all duration-300 ${disabled ? '' : 'hover:shadow-lg hover:scale-[1.02]'} ${highlighted ? 'border-2 border-primary rounded-2xl' : 'rounded-2xl'} bg-card border-border`}>
      <div className="p-3 sm:p-4 flex flex-col h-full min-h-[140px] sm:min-h-[160px] bg-card">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="p-2 sm:p-2.5 bg-muted rounded-lg flex-shrink-0">
            <div className="text-primary w-5 h-5 sm:w-6 sm:h-6">
              {icon}
            </div>
          </div>
          <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap ml-2">
            {status}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col">
          <h3 className={`text-base sm:text-xl font-bold text-card-foreground mb-1 ${disabled ? '' : 'group-hover:text-primary'} transition-colors leading-tight`}>
            {title}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 flex-1 leading-relaxed">
            {description}
          </p>
          
          {!disabled && (
            <div className="mt-auto">
              <span 
                className={`text-xs sm:text-sm font-medium flex items-center transition-colors ${highlighted ? 'text-[#e57373]' : 'text-primary'} hover:text-card-foreground`}
              >
                <span className="truncate">{actionText}</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 flex-shrink-0">
                  <path 
                    d="M6 12L10 8L6 4" 
                    stroke="currentColor"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (disabled) {
    return <div className="block h-full">{cardContent}</div>;
  }

  return (
    <Link to={actionLink} className="block h-full">
      {cardContent}
    </Link>
  );
};

export default ServiceCard;
