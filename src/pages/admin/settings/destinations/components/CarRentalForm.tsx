
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CarRental } from '@/features/types/supabaseTypes';

interface CarRentalFormProps {
  formData: Partial<CarRental>;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<CarRental>) => void;
  onCancel: () => void;
}

const CarRentalForm = ({ formData, isEditing, onSubmit, onChange, onCancel }: CarRentalFormProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Edit Car Rental Service' : 'Add New Car Rental Service'}
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
                placeholder="e.g., Hertz, Avis, Enterprise"
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
                placeholder="Description of the car rental service"
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
                placeholder="e.g., https://www.hertz.com"
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

export default CarRentalForm;
