
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CarRental {
  id: string;
  name: string;
  description: string;
  website?: string;
}

interface PublicTransport {
  id: string;
  name: string;
  description: string;
  website?: string;
}

const TransportationTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('car-rental');
  
  // Car Rental State
  const [isEditingCar, setIsEditingCar] = useState(false);
  const [currentCarRental, setCurrentCarRental] = useState<CarRental | null>(null);
  const [carFormData, setCarFormData] = useState({
    name: '',
    description: '',
    website: ''
  });
  
  // Public Transport State
  const [isEditingTransport, setIsEditingTransport] = useState(false);
  const [currentTransport, setCurrentTransport] = useState<PublicTransport | null>(null);
  const [transportFormData, setTransportFormData] = useState({
    name: '',
    description: '',
    website: ''
  });
  
  // Fetch car rentals
  const { data: carRentals, isLoading: isLoadingCars } = useQuery({
    queryKey: ['carRentals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_rentals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as CarRental[];
    }
  });
  
  // Fetch public transport options
  const { data: publicTransport, isLoading: isLoadingTransport } = useQuery({
    queryKey: ['publicTransport'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_transport')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PublicTransport[];
    }
  });
  
  // Car Rental Mutations
  const addCarMutation = useMutation({
    mutationFn: async (newCar: Omit<CarRental, 'id'>) => {
      const { data, error } = await supabase
        .from('car_rentals')
        .insert(newCar)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carRentals'] });
      resetCarForm();
      toast({
        title: "Car Rental Added",
        description: "The car rental service has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add car rental: ${error.message}`
      });
    }
  });
  
  const updateCarMutation = useMutation({
    mutationFn: async (car: CarRental) => {
      const { data, error } = await supabase
        .from('car_rentals')
        .update({
          name: car.name,
          description: car.description,
          website: car.website
        })
        .eq('id', car.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carRentals'] });
      resetCarForm();
      toast({
        title: "Car Rental Updated",
        description: "The car rental service has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update car rental: ${error.message}`
      });
    }
  });
  
  const deleteCarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('car_rentals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carRentals'] });
      toast({
        title: "Car Rental Deleted",
        description: "The car rental service has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete car rental: ${error.message}`
      });
    }
  });
  
  // Public Transport Mutations
  const addTransportMutation = useMutation({
    mutationFn: async (newTransport: Omit<PublicTransport, 'id'>) => {
      const { data, error } = await supabase
        .from('public_transport')
        .insert(newTransport)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicTransport'] });
      resetTransportForm();
      toast({
        title: "Transport Option Added",
        description: "The public transport option has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add transport option: ${error.message}`
      });
    }
  });
  
  const updateTransportMutation = useMutation({
    mutationFn: async (transport: PublicTransport) => {
      const { data, error } = await supabase
        .from('public_transport')
        .update({
          name: transport.name,
          description: transport.description,
          website: transport.website
        })
        .eq('id', transport.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicTransport'] });
      resetTransportForm();
      toast({
        title: "Transport Option Updated",
        description: "The public transport option has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update transport option: ${error.message}`
      });
    }
  });
  
  const deleteTransportMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('public_transport')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicTransport'] });
      toast({
        title: "Transport Option Deleted",
        description: "The public transport option has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete transport option: ${error.message}`
      });
    }
  });
  
  // Form Handlers - Car Rentals
  const handleCarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!carFormData.name || !carFormData.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    if (isEditingCar && currentCarRental) {
      updateCarMutation.mutate({
        id: currentCarRental.id,
        ...carFormData
      });
    } else {
      addCarMutation.mutate(carFormData);
    }
  };
  
  const handleEditCar = (car: CarRental) => {
    setIsEditingCar(true);
    setCurrentCarRental(car);
    setCarFormData({
      name: car.name,
      description: car.description,
      website: car.website || ''
    });
  };
  
  const handleDeleteCar = (id: string) => {
    if (window.confirm("Are you sure you want to delete this car rental service?")) {
      deleteCarMutation.mutate(id);
    }
  };
  
  const resetCarForm = () => {
    setIsEditingCar(false);
    setCurrentCarRental(null);
    setCarFormData({
      name: '',
      description: '',
      website: ''
    });
  };
  
  // Form Handlers - Public Transport
  const handleTransportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transportFormData.name || !transportFormData.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    if (isEditingTransport && currentTransport) {
      updateTransportMutation.mutate({
        id: currentTransport.id,
        ...transportFormData
      });
    } else {
      addTransportMutation.mutate(transportFormData);
    }
  };
  
  const handleEditTransport = (transport: PublicTransport) => {
    setIsEditingTransport(true);
    setCurrentTransport(transport);
    setTransportFormData({
      name: transport.name,
      description: transport.description,
      website: transport.website || ''
    });
  };
  
  const handleDeleteTransport = (id: string) => {
    if (window.confirm("Are you sure you want to delete this public transport option?")) {
      deleteTransportMutation.mutate(id);
    }
  };
  
  const resetTransportForm = () => {
    setIsEditingTransport(false);
    setCurrentTransport(null);
    setTransportFormData({
      name: '',
      description: '',
      website: ''
    });
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="car-rental">Car Rental</TabsTrigger>
          <TabsTrigger value="public-transport">Public Transportation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="car-rental" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleCarSubmit} className="space-y-4">
                <h3 className="text-lg font-medium">
                  {isEditingCar ? 'Edit Car Rental Service' : 'Add New Car Rental Service'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="car-name">
                      Service Name
                    </label>
                    <Input
                      id="car-name"
                      value={carFormData.name}
                      onChange={(e) => setCarFormData({ ...carFormData, name: e.target.value })}
                      placeholder="e.g., Premium Car Rental"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="car-description">
                      Description
                    </label>
                    <Textarea
                      id="car-description"
                      value={carFormData.description}
                      onChange={(e) => setCarFormData({ ...carFormData, description: e.target.value })}
                      placeholder="Brief description of the car rental service"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="car-website">
                      Website URL (optional)
                    </label>
                    <Input
                      id="car-website"
                      value={carFormData.website}
                      onChange={(e) => setCarFormData({ ...carFormData, website: e.target.value })}
                      placeholder="e.g., https://example.com"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  {isEditingCar && (
                    <Button type="button" variant="outline" onClick={resetCarForm}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    {isEditingCar ? 'Update Service' : 'Add Service'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <h3 className="text-lg font-medium">Car Rental Services</h3>
          
          {isLoadingCars ? (
            <p>Loading car rental services...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carRentals && carRentals.length > 0 ? (
                  carRentals.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>{car.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{car.description}</TableCell>
                      <TableCell>
                        {car.website && (
                          <a 
                            href={car.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCar(car)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCar(car.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No car rental services found. Add your first service.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="public-transport" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleTransportSubmit} className="space-y-4">
                <h3 className="text-lg font-medium">
                  {isEditingTransport ? 'Edit Public Transport Option' : 'Add New Public Transport Option'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="transport-name">
                      Transport Name
                    </label>
                    <Input
                      id="transport-name"
                      value={transportFormData.name}
                      onChange={(e) => setTransportFormData({ ...transportFormData, name: e.target.value })}
                      placeholder="e.g., City Bus"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="transport-description">
                      Description
                    </label>
                    <Textarea
                      id="transport-description"
                      value={transportFormData.description}
                      onChange={(e) => setTransportFormData({ ...transportFormData, description: e.target.value })}
                      placeholder="Brief description of the public transport option"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="transport-website">
                      Website URL (optional)
                    </label>
                    <Input
                      id="transport-website"
                      value={transportFormData.website}
                      onChange={(e) => setTransportFormData({ ...transportFormData, website: e.target.value })}
                      placeholder="e.g., https://example.com"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  {isEditingTransport && (
                    <Button type="button" variant="outline" onClick={resetTransportForm}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    {isEditingTransport ? 'Update Option' : 'Add Option'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <h3 className="text-lg font-medium">Public Transport Options</h3>
          
          {isLoadingTransport ? (
            <p>Loading public transport options...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicTransport && publicTransport.length > 0 ? (
                  publicTransport.map((transport) => (
                    <TableRow key={transport.id}>
                      <TableCell>{transport.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{transport.description}</TableCell>
                      <TableCell>
                        {transport.website && (
                          <a 
                            href={transport.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTransport(transport)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransport(transport.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No public transport options found. Add your first option.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransportationTab;
