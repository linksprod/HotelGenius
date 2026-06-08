import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, Utensils, Sparkles, Phone, Mail, Star } from 'lucide-react';

interface AIMessageRendererProps {
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuickAction?: (action: string, data?: any) => void;
}

interface ParsedContent {
  type: 'text' | 'restaurant_list' | 'spa_services' | 'booking_confirmation' | 'options_menu';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

const AIMessageRenderer: React.FC<AIMessageRendererProps> = ({ message, onQuickAction }) => {
  const parseMessage = (text: string): ParsedContent[] => {
    const sections = [];
    
    // Check for restaurant listings
    if (text.includes('Available Restaurants:') || text.includes('dining options')) {
      const restaurantSection = extractRestaurantSection(text);
      if (restaurantSection) sections.push(restaurantSection);
    }
    
    // Check for spa services
    if (text.includes('Available Spa Service') || text.includes('spa treatment')) {
      const spaSection = extractSpaSection(text);
      if (spaSection) sections.push(spaSection);
    }
    
    // Check for booking confirmations
    if (text.includes('✅')) {
      const confirmationSection = extractBookingConfirmation(text);
      if (confirmationSection) sections.push(confirmationSection);
    }
    
    // Default text section for remaining content
    const cleanedText = cleanTextFromStructuredContent(text);
    if (cleanedText.trim()) {
      sections.push({ type: 'text', content: cleanedText });
    }
    
    return sections;
  };
  
  const extractRestaurantSection = (text: string): ParsedContent | null => {
    const restaurantMatch = text.match(/Available Restaurants:(.*?)(?=Available Spa|$)/s);
    if (!restaurantMatch) return null;
    
    const restaurantText = restaurantMatch[1];
    const restaurants = restaurantText.split(/\d+\./).filter(r => r.trim()).map(restaurant => {
      const lines = restaurant.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) return null;
      
      const name = lines[0].replace(/\*\*/g, '').split(' (')[0].trim();
      const details = lines[0];
      
      return {
        name,
        details: details.replace(/\*\*/g, ''),
        hours: extractInfo(details, /(\d+:\d+\s*(?:AM|PM).*)/i),
        location: extractInfo(details, /(Floor \d+|Main Lobby|Lobby|Poolside|Outdoor)/i)
      };
    }).filter(Boolean);
    
    return { type: 'restaurant_list', content: restaurants };
  };
  
  const extractSpaSection = (text: string): ParsedContent | null => {
    const spaMatch = text.match(/Available Spa Service[s]?:(.*?)(?=###|$)/s);
    if (!spaMatch) return null;
    
    const spaText = spaMatch[1];
    const services = spaText.split(/\*\*/).filter(s => s.includes('(') && s.includes(')')).map(service => {
      const nameMatch = service.match(/([^(]+)/);
      const durationMatch = service.match(/\(([^)]+)\)/);
      const descMatch = service.match(/-\s*([^$]+)/);
      
      return {
        name: nameMatch?.[1]?.trim(),
        duration: durationMatch?.[1]?.trim(),
        description: descMatch?.[1]?.trim()?.replace(/\$\d+/, ''),
        price: service.match(/\$(\d+)/)?.[0]
      };
    }).filter(s => s.name);
    
    return { type: 'spa_services', content: services };
  };
  
  const extractBookingConfirmation = (text: string): ParsedContent | null => {
    const confirmations = text.split('\n').filter(line => line.includes('✅')).map(line => {
      const cleanLine = line.replace('✅', '').trim();
      
      if (cleanLine.includes('Restaurant reservation')) {
        return {
          type: 'restaurant',
          message: cleanLine,
          icon: Utensils
        };
      } else if (cleanLine.includes('Spa appointment')) {
        return {
          type: 'spa',
          message: cleanLine,
          icon: Sparkles
        };
      } else if (cleanLine.includes('Event registration')) {
        return {
          type: 'event',
          message: cleanLine,
          icon: Calendar
        };
      } else {
        return {
          type: 'service',
          message: cleanLine,
          icon: Star
        };
      }
    });
    
    if (confirmations.length > 0) {
      return { type: 'booking_confirmation', content: confirmations };
    }
    
    return null;
  };
  
  const extractInfo = (text: string, regex: RegExp): string | null => {
    const match = text.match(regex);
    return match ? match[1] : null;
  };
  
  const cleanTextFromStructuredContent = (text: string): string => {
    return text
      .replace(/Available Restaurants:.*?(?=Available Spa|$)/s, '')
      .replace(/Available Spa Service[s]?:.*?(?=###|$)/s, '')
      .replace(/✅[^\n]*/g, '')
      .replace(/###.*$/s, '')
      .trim();
  };
  
  const parsedSections = parseMessage(message);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQuickBook = (type: string, item?: any) => {
    if (onQuickAction) {
      onQuickAction('quick_book', { type, item });
    }
  };
  
  return (
    <div className="space-y-3">
      {parsedSections.map((section, index) => {
        switch (section.type) {
          case 'restaurant_list':
            return (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Available Restaurants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {section.content.map((restaurant: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{restaurant.name}</h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickBook('restaurant', restaurant)}
                        >
                          Book Now
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {restaurant.hours && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {restaurant.hours}
                          </Badge>
                        )}
                        {restaurant.location && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {restaurant.location}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
            
          case 'spa_services':
            return (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Spa Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {section.content.map((service: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-2">
                          {service.price && (
                            <Badge variant="outline">{service.price}</Badge>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleQuickBook('spa', service)}
                          >
                            Book
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {service.duration && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration}
                          </Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
            
          case 'booking_confirmation':
            return (
              <Card key={index} className="border-l-4 border-l-green-500 bg-green-50/50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {section.content.map((confirmation: any, idx: number) => {
                      const IconComponent = confirmation.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-md bg-white/80">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">
                              {confirmation.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
            
          case 'text':
          default:
            return (
              <div key={index} className="space-y-2">
                {section.content.split('\n').map((line: string, lineIdx: number) => {
                  if (!line.trim()) return null;
                  return (
                    <p key={lineIdx} className="text-sm leading-relaxed">
                      {line.trim()}
                    </p>
                  );
                })}
              </div>
            );
        }
      })}
      
    </div>
  );
};

export default AIMessageRenderer;