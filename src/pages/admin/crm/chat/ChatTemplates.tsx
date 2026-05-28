import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, X } from 'lucide-react';
import { useChatTemplates, ChatTemplate } from '@/hooks/useChatTemplates';

interface ChatTemplatesProps {
  onSelectTemplate: (template: ChatTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatTemplates = ({ onSelectTemplate, isOpen, onClose }: ChatTemplatesProps) => {
  const { templates, loading, getTemplatesByCategory, getAllCategories } = useChatTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  if (!isOpen) return null;

  const categories = getAllCategories();
  const defaultCategory = categories[0] || 'general';

  const formatCategoryName = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleTemplateSelect = (template: ChatTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  if (loading) {
    return (
      <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border rounded-lg shadow-lg p-4">
        <div className="text-center text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border rounded-lg shadow-lg max-h-80 z-50">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-medium">Quick Templates</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={selectedCategory || defaultCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
          {categories.slice(0, 4).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {formatCategoryName(category)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <ScrollArea className="h-48">
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0 p-2">
              <div className="space-y-2">
                {getTemplatesByCategory(category).map((template) => (
                  <Button
                    key={template.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-sm">{template.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatCategoryName(template.category)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.message}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default ChatTemplates;