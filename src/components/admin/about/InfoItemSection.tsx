
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { InfoItem } from '@/lib/types';

interface InfoItemSectionProps {
  title: string;
  items: InfoItem[];
  type?: string;
  addInfoItem?: (type: string) => void;
  removeInfoItem?: (type: string, index: number) => void;
  handleInfoItemChange?: (type: string, index: number, field: string, value: string) => void;
  isEditing?: boolean;
  onSave?: (items: InfoItem[]) => void;
  singleItem?: boolean;
}

const InfoItemSection = ({
  title,
  items,
  type = '',
  addInfoItem,
  removeInfoItem,
  handleInfoItemChange,
  isEditing = false,
  onSave,
  singleItem = false
}: InfoItemSectionProps) => {
  const [editableItems, setEditableItems] = useState<InfoItem[]>(items || []);

  // Local handlers for standalone edit mode
  const handleLocalItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...editableItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditableItems(updatedItems);
  };

  const handleLocalAddItem = () => {
    setEditableItems([...editableItems, { label: '', value: '' }]);
  };

  const handleLocalRemoveItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editableItems);
    }
  };

  if (isEditing) {
    return (
      <div className="border-t pt-4 border-border">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-foreground">{title}</h3>
          {!singleItem && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => addInfoItem ? addInfoItem(type) : handleLocalAddItem()}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
        
        {(handleInfoItemChange ? items : editableItems).map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input 
              placeholder="Label"
              value={item.label || ''} 
              onChange={(e) => handleInfoItemChange 
                ? handleInfoItemChange(type, index, 'label', e.target.value)
                : handleLocalItemChange(index, 'label', e.target.value)
              }
              className="flex-1"
            />
            <Input 
              placeholder="Value"
              value={String(item.value || '')} 
              onChange={(e) => handleInfoItemChange 
                ? handleInfoItemChange(type, index, 'value', e.target.value)
                : handleLocalItemChange(index, 'value', e.target.value)
              }
              className="flex-1"
            />
            {!singleItem && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeInfoItem 
                  ? removeInfoItem(type, index) 
                  : handleLocalRemoveItem(index)
                }
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
        
        {onSave && !handleInfoItemChange && (
          <Button type="button" onClick={handleSave} className="mt-2">
            Save Changes
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="font-semibold mb-3 text-base text-foreground border-l-2 border-primary pl-2">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
        {items.filter(item => item.label || item.value).map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-2.5 border-b border-border/50 gap-1 sm:gap-4">
            <dt className="text-foreground text-xs sm:text-sm font-bold">{item.label}</dt>
            <dd className="font-medium text-muted-foreground text-sm sm:text-right">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default InfoItemSection;
