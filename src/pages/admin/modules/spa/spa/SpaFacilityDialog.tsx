
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { SpaFacility } from '@/features/spa/types';
import { useSpaFacilities } from '@/hooks/useSpaFacilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { facilitySchema, FacilityFormValues } from '@/components/admin/spa/FacilityFormSchema';
import FacilityBasicFields from '@/components/admin/spa/FacilityBasicFields';
import FacilityDetailsFields from '@/components/admin/spa/FacilityDetailsFields';
import FacilityImageUploader from '@/components/admin/spa/FacilityImageUploader';

export interface SpaFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility: SpaFacility | null;
  onClose: (success: boolean) => void;
}

export default function SpaFacilityDialog({ open, onOpenChange, facility, onClose }: SpaFacilityDialogProps) {
  const { createFacility, updateFacility, isCreating, isUpdating } = useSpaFacilities();
  const isLoading = isCreating || isUpdating;

  const form = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: facility?.name || '',
      description: facility?.description || '',
      location: facility?.location || '',
      capacity: facility?.capacity || 0,
      image_url: facility?.image_url || '',
      opening_hours: facility?.opening_hours || '',
      status: (facility?.status as 'open' | 'closed') || 'open',
    },
  });

  React.useEffect(() => {
    if (facility) {
      form.reset({
        name: facility.name,
        description: facility.description || '',
        location: facility.location || '',
        capacity: facility.capacity || 0,
        image_url: facility.image_url || '',
        opening_hours: facility.opening_hours || '',
        status: (facility.status as 'open' | 'closed') || 'open',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        location: '',
        capacity: 0,
        image_url: '',
        opening_hours: '',
        status: 'open',
      });
    }
  }, [facility, form]);

  const onSubmit = (values: FacilityFormValues) => {
    if (facility) {
      updateFacility({
        ...values,
        id: facility.id,
      } as SpaFacility, {
        onSuccess: () => {
          onClose(true);
        },
      });
    } else {
      createFacility({
        ...values,
        name: values.name
      } as Omit<SpaFacility, 'id' | 'created_at' | 'updated_at'>, {
        onSuccess: () => {
          onClose(true);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-card dark:bg-zinc-900 border-border dark:border-white/5 text-foreground">
        <DialogHeader>
          <DialogTitle>{facility ? 'Edit Facility' : 'Add Facility'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FacilityBasicFields form={form} />
              <FacilityDetailsFields form={form} />
              <FacilityImageUploader form={form} isLoading={isLoading} />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="bg-card dark:bg-zinc-800 border-border dark:border-white/5 text-foreground hover:bg-secondary rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
                  {isLoading ? 'Saving...' : facility ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
