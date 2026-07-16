
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, History, Building2, Users, Award, BedDouble, Waves, ShieldCheck, Dumbbell, Coffee, Utensils, Wifi, Car, Sparkles, Briefcase } from 'lucide-react';
import { FeatureItem } from '@/lib/types';
import ImageUploader from '@/components/admin/shops/ImageUploader';

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

  // Sync local state when parent features prop changes (e.g. after initial DB load)
  React.useEffect(() => {
    if (!handleFeatureChange) {
      setEditableFeatures(features || []);
    }
  }, [features, handleFeatureChange]);

  const getIconComponent = (iconName: string) => {
    if (iconName && (iconName.startsWith('http') || iconName.startsWith('data:'))) {
      return <img src={iconName} alt="icon" className="h-6 w-6 object-contain" />;
    }
    if (iconName === 'custom') {
      return <div className="h-6 w-6 border-2 border-dashed rounded border-gray-400 opacity-50" />;
    }
    
    switch (iconName) {
      case 'History': return <History className="h-6 w-6 text-primary" />;
      case 'Building2': return <Building2 className="h-6 w-6 text-primary" />;
      case 'Users': return <Users className="h-6 w-6 text-primary" />;
      case 'Award': return <Award className="h-6 w-6 text-primary" />;
      case 'BedDouble': return <BedDouble className="h-6 w-6 text-primary" />;
      case 'Waves': return <Waves className="h-6 w-6 text-primary" />;
      case 'ShieldCheck': return <ShieldCheck className="h-6 w-6 text-primary" />;
      case 'Dumbbell': return <Dumbbell className="h-6 w-6 text-primary" />;
      case 'Coffee': return <Coffee className="h-6 w-6 text-primary" />;
      case 'Utensils': return <Utensils className="h-6 w-6 text-primary" />;
      case 'Wifi': return <Wifi className="h-6 w-6 text-primary" />;
      case 'Car': return <Car className="h-6 w-6 text-primary" />;
      case 'Sparkles': return <Sparkles className="h-6 w-6 text-primary" />;
      case 'Briefcase': return <Briefcase className="h-6 w-6 text-primary" />;
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
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor={`icon-${index}`}>Icon</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2 text-muted-foreground"
                      onClick={() => {
                        const isCustom = feature.icon === 'custom' || feature.icon?.startsWith('http') || feature.icon?.startsWith('data:');
                        if (isCustom) {
                          handleFeatureChange 
                            ? handleFeatureChange(index, 'icon', 'History')
                            : handleLocalFeatureChange(index, 'icon', 'History');
                        } else {
                          handleFeatureChange 
                            ? handleFeatureChange(index, 'icon', 'custom')
                            : handleLocalFeatureChange(index, 'icon', 'custom');
                        }
                      }}
                    >
                      {feature.icon === 'custom' || feature.icon?.startsWith('http') || feature.icon?.startsWith('data:') 
                        ? 'Use Built-in' 
                        : 'Use Custom Image'}
                    </Button>
                  </div>

                  {feature.icon === 'custom' || feature.icon?.startsWith('http') || feature.icon?.startsWith('data:') ? (
                    <div className="mt-2 bg-muted/50 p-2 rounded-md">
                      <ImageUploader 
                        value={feature.icon === 'custom' ? '' : feature.icon} 
                        onChange={(url) => handleFeatureChange 
                          ? handleFeatureChange(index, 'icon', url || 'custom')
                          : handleLocalFeatureChange(index, 'icon', url || 'custom')
                        } 
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 text-center">
                        Upload a PNG or SVG line-art icon
                      </p>
                    </div>
                  ) : (
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
                      <option value="BedDouble">Rooms & Suites</option>
                      <option value="Briefcase">Business</option>
                      <option value="Dumbbell">Wellness / Gym</option>
                      <option value="Waves">Pool / Water</option>
                      <option value="ShieldCheck">Security</option>
                      <option value="Coffee">Cafe / Lounge</option>
                      <option value="Utensils">Restaurant</option>
                      <option value="Wifi">Internet</option>
                      <option value="Car">Transport</option>
                      <option value="Sparkles">Spa / Relaxation</option>
                    </select>
                  )}
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
