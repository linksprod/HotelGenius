
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useSpaServices } from '@/hooks/useSpaServices';
import { useSpaFacilities } from '@/hooks/useSpaFacilities';
import { SpaService } from '@/features/spa/types';
import SpaServiceDialog from './SpaServiceDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SpaServicesTab() {
  const [selectedService, setSelectedService] = useState<SpaService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { services, isLoading, error, refetch } = useSpaServices();
  const { facilities, isLoading: isLoadingFacilities } = useSpaFacilities();

  // Map to store facility names by id
  const facilityNames = facilities.reduce((acc, facility) => {
    acc[facility.id] = facility.name;
    return acc;
  }, {} as Record<string, string>);

  const handleAddNew = () => {
    setSelectedService(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: SpaService) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const deleteService = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('spa_services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Service deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error deleting service');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleTogglePublish = async (service: SpaService) => {
    try {
      const { error } = await supabase
        .from('spa_services')
        .update({ is_published: !service.is_published })
        .eq('id', service.id);
        
      if (error) throw error;
      toast.success(service.is_published ? 'Moved to Draft' : 'Published Successfully');
      refetch();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteService(deleteId);
    }
  };

  const handleDialogClose = (success: boolean) => {
    setIsDialogOpen(false);
    if (success) {
      refetch();
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'massage': return 'Massage';
      case 'facial': return 'Facial';
      case 'body': return 'Body Treatment';
      case 'wellness': return 'Wellness';
      default: return category;
    }
  };

  const renderServiceCard = (service: SpaService) => (
    <Card key={service.id} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {facilityNames[service.facility_id] || 'Installation inconnue'}
          </div>
        </div>
        <div className="flex space-x-2 items-center">
          <Badge 
            className={`cursor-pointer border-none text-[10px] font-bold ${service.is_published ? 'bg-accent/80 hover:bg-accent text-accent-foreground' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePublish(service);
            }}
          >
            {service.is_published ? 'PUBLISHED' : 'DRAFT'}
          </Badge>
          {service.is_featured && (
            <Badge variant="outline" className="mr-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
              Featured
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleEdit(service)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleDeleteClick(service.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card dark:bg-zinc-900 border-border dark:border-white/5 text-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete the service "{service.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-secondary/80">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-rose-500 hover:bg-rose-600 text-white border-none"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Details</h4>
            <div className="text-sm text-muted-foreground space-y-1 mt-1">
              <p><span className="font-medium">Duration:</span> {service.duration}</p>
              <p><span className="font-medium">Price:</span> {service.price} €</p>
              <p><span className="font-medium">Category:</span> {getCategoryLabel(service.category)}</p>
              <p><span className="font-medium">Status:</span> <span className={service.status === 'available' ? 'text-emerald-500' : 'text-rose-500'}>
                {service.status === 'available' ? 'Available' : 'Unavailable'}
              </span></p>
            </div>
          </div>
        </div>
        {service.image && (
          <div className="mt-4">
            <img 
              src={service.image} 
              alt={service.name} 
              className="h-32 w-auto object-cover rounded-md" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Spa Services</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center bg-card dark:bg-zinc-800 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddNew} className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>
      
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Erreur lors du chargement des services: {error.message}
          </AlertDescription>
        </Alert>
      ) : isLoading || isLoadingFacilities ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="mb-4">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-[2rem] bg-muted/20">
          <p className="text-muted-foreground font-medium mb-4">No services found</p>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add your first service
          </Button>
        </div>
      ) : (
        <div>
          {services.map(renderServiceCard)}
        </div>
      )}

      <SpaServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={selectedService}
        facilities={facilities}
        onClose={handleDialogClose}
      />
    </div>
  );
}
