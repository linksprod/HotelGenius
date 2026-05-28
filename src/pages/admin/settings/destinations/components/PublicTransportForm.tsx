
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PublicTransport } from '@/features/types/supabaseTypes';

interface PublicTransportFormProps {
  formData: Partial<PublicTransport>;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<PublicTransport>) => void;
  onCancel: () => void;
}

const PublicTransportForm = ({ formData, isEditing, onSubmit, onChange, onCancel }: PublicTransportFormProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Edit Public Transport' : 'Add New Public Transport'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name *
              </label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="e.g., Metro, City Bus, Train"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description *
              </label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Description of the public transport"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="website">
                Website
              </label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => onChange({ website: e.target.value })}
                placeholder="e.g., https://www.citytransport.com"
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
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PublicTransportForm;
