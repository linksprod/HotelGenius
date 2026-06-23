
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, History, Building2, Users, Award } from 'lucide-react';
import { FeatureItem } from '@/lib/types';

interface FeaturesSectionProps {
  features: FeatureItem[];
  addFeature?: () => void;
  removeFeature?: (index: number) => void;
  handleFeatureChange?: (index: number, field: string, value: string) => void;
  isEditing?: boolean;
  onSave?: (features: FeatureItem[]) => void;
}

const FeaturesSection = ({
  features,
  addFeature,
  removeFeature,
  handleFeatureChange,
  isEditing = false,
  onSave
}: FeaturesSectionProps) => {
  const [editableFeatures, setEditableFeatures] = useState<FeatureItem[]>(features || []);
  const { t } = useTranslation();

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'History': return <History className="h-6 w-6 text-primary" />;
      case 'Building2': return <Building2 className="h-6 w-6 text-primary" />;
      case 'Users': return <Users className="h-6 w-6 text-primary" />;
      case 'Award': return <Award className="h-6 w-6 text-primary" />;
      default: return <History className="h-6 w-6 text-primary" />;
    }
  };

  // Local handlers for standalone edit mode
  const handleLocalFeatureChange = (index: number, field: string, value: string) => {
    const updatedFeatures = [...editableFeatures];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setEditableFeatures(updatedFeatures);
  };

  const handleLocalAddFeature = () => {
    setEditableFeatures([
      ...editableFeatures, 
      { 
        icon: 'History', 
        title: 'New Feature', 
        description: 'Description here' 
      }
    ]);
  };

  const handleLocalRemoveFeature = (index: number) => {
    setEditableFeatures(editableFeatures.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editableFeatures);
    }
  };

  if (isEditing) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Features Grid</h2>
          <Button 
            type="button" 
            variant="outline" 
            onClick={addFeature || handleLocalAddFeature}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Feature
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(handleFeatureChange ? features : editableFeatures).map((feature, index) => (
            <Card key={index} className="p-4 relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2"
                onClick={() => removeFeature ? removeFeature(index) : handleLocalRemoveFeature(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>

              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  {getIconComponent(feature.icon)}
                </div>
                
                <Input 
                  placeholder="Title"
                  value={feature.title || ''} 
                  onChange={(e) => handleFeatureChange 
                    ? handleFeatureChange(index, 'title', e.target.value)
                    : handleLocalFeatureChange(index, 'title', e.target.value)
                  }
                  className="text-center"
                />
                
                <Textarea 
                  placeholder="Description"
                  value={feature.description || ''} 
                  onChange={(e) => handleFeatureChange 
                    ? handleFeatureChange(index, 'description', e.target.value)
                    : handleLocalFeatureChange(index, 'description', e.target.value)
                  }
                  className="text-center text-sm"
                  rows={2}
                />
                
                <div className="w-full mt-2">
                  <Label htmlFor={`icon-${index}`}>Icon</Label>
                  <select 
                    id={`icon-${index}`}
                    value={feature.icon || 'History'} 
                    onChange={(e) => handleFeatureChange 
                      ? handleFeatureChange(index, 'icon', e.target.value)
                      : handleLocalFeatureChange(index, 'icon', e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="History">History</option>
                    <option value="Building2">Building</option>
                    <option value="Users">Team</option>
                    <option value="Award">Award</option>
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {onSave && !handleFeatureChange && (
          <Button type="button" onClick={handleSave} className="mt-4">
            Save Changes
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{t('about.title', 'About Our Hotel')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              {getIconComponent(feature.icon)}
            </div>
            <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FeaturesSection;
