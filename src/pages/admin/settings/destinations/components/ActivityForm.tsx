
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { Activity } from '@/features/types/supabaseTypes';

interface ActivityFormProps {
  formData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<Activity>) => void;
  onCancel: () => void;
}

const ActivityForm = ({ formData, isEditing, onSubmit, onChange, onCancel }: ActivityFormProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Edit Activity' : 'Add New Activity'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Activity Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="e.g., City Tour"
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
                  placeholder="Brief description of the activity"
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
              {isEditing ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ActivityForm;
