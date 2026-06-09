import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { SpaService, SpaFacility } from '@/features/spa/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { serviceSchema, ServiceFormValues } from '@/components/admin/spa/ServiceFormSchema';
import ServiceBasicFields from '@/components/admin/spa/ServiceBasicFields';
import ServiceDetailsFields from '@/components/admin/spa/ServiceDetailsFields';
import ServiceImageUploader from '@/components/admin/spa/ServiceImageUploader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export interface SpaServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: SpaService | null;
  facilities: SpaFacility[];
  onClose: (success: boolean) => void;
}

export default function SpaServiceDialog({ 
  open, 
  onOpenChange, 
  service, 
  facilities,
  onClose 
}: SpaServiceDialogProps) {
  const { hotelId } = useCurrentHotelId();
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      duration: service?.duration || '',
      price: service?.price || 0,
      category: service?.category || 'massage',
      facility_id: service?.facility_id || '',
      is_featured: service?.is_featured || false,
      image: service?.image || '',
      status: (service?.status as 'available' | 'unavailable') || 'available',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        facility_id: service.facility_id,
        is_featured: service.is_featured || false,
        image: service.image || '',
        status: (service.status as 'available' | 'unavailable') || 'available',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        duration: '',
        price: 0,
        category: 'massage',
        facility_id: facilities.length > 0 ? facilities[0].id : '',
        is_featured: false,
        image: '',
        status: 'available',
      });
    }
  }, [service, form, facilities]);

  const onSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      if (service) {
        // Update existing service
        const { error } = await supabase
          .from('spa_services')
          .update({
            name: values.name,
            description: values.description,
            duration: values.duration,
            price: values.price,
            category: values.category,
            facility_id: values.facility_id,
            is_featured: values.is_featured,
            image: values.image,
            status: values.status,
          })
          .eq('id', service.id);
          
        if (error) throw error;
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const { error } = await supabase
          .from('spa_services')
          .insert({
            name: values.name,
            description: values.description,
            duration: values.duration,
            price: values.price,
            category: values.category,
            facility_id: values.facility_id,
            is_featured: values.is_featured,
            image: values.image,
            status: values.status,
            hotel_id: hotelId,
          });
          
        if (error) throw error;
        toast.success('Service created successfully');
      }
      
      onClose(true);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Error while saving the service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-card dark:bg-zinc-900 border-border dark:border-white/5 text-foreground">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Add Service'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ServiceBasicFields form={form} />
              <ServiceDetailsFields form={form} facilities={facilities} />
              <ServiceImageUploader form={form} isLoading={isSubmitting} />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="bg-card dark:bg-zinc-800 border-border dark:border-white/5 text-foreground hover:bg-secondary rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
                  {isSubmitting ? 'Saving...' : service ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
