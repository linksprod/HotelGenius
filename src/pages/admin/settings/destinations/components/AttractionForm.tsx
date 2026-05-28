
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { Attraction } from '@/features/types/supabaseTypes';

interface AttractionFormProps {
  formData: Omit<Attraction, 'id' | 'created_at' | 'updated_at'>;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<Attraction>) => void;
  onCancel: () => void;
}

const AttractionForm = ({ formData, isEditing, onSubmit, onChange, onCancel }: AttractionFormProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Edit Attraction' : 'Add New Attraction'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Attraction Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="e.g., Art Museum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="distance">
                  Distance
                </label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => onChange({ distance: e.target.value })}
                  placeholder="e.g., 1.2 km away"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="opening_hours">
                  Opening Hours
                </label>
                <Input
                  id="opening_hours"
                  value={formData.opening_hours}
                  onChange={(e) => onChange({ opening_hours: e.target.value })}
                  placeholder="e.g., Open until 6 PM"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder="Brief description of the attraction"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Image
              </label>
              <ImageUpload
                id="image-upload"
                value={formData.image}
                onChange={(url) => onChange({ image: url })}
                className="mb-4"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            {isEditing && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {isEditing ? 'Update Attraction' : 'Add Attraction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttractionForm;
