
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UtensilsCrossed, Utensils, CalendarDays, PlusCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RestaurantEventsDialog from '@/pages/admin/components/restaurants/RestaurantEventsDialog';
import { useEvents } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';

interface RestaurantTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restaurants: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (restaurant: any) => void;
  onDelete: (id: string) => void;
  onViewMenus: (id: string) => void;
  onViewReservations: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddEvent?: (restaurant: any) => void;
}

export const RestaurantTable: React.FC<RestaurantTableProps> = ({
  restaurants,
  onEdit,
  onDelete,
  onViewMenus,
  onViewReservations,
  onAddEvent,
}) => {
  const navigate = useNavigate();
  const { restaurantCounts } = useAdminNotifications();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const { events } = useEvents();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddEvent = (restaurant: any) => {
    if (onAddEvent) {
      onAddEvent(restaurant);
    } else {
      setSelectedRestaurant(restaurant);
      setIsEventDialogOpen(true);
    }
  };

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No restaurants found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {restaurant.name}
                    {restaurantCounts[restaurant.id] > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium px-1">
                        {restaurantCounts[restaurant.id]}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{restaurant.cuisine}</TableCell>
                <TableCell>{restaurant.location}</TableCell>
                <TableCell>
                  <Badge
                    variant={restaurant.status === 'open' ? 'default' : 'destructive'}
                    className={restaurant.status === 'open' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {restaurant.status === 'open' ? (
                      <Utensils className="h-3 w-3 mr-1" />
                    ) : (
                      <UtensilsCrossed className="h-3 w-3 mr-1" />
                    )}
                    {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {restaurant.is_featured ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Featured
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewReservations(restaurant.id)}
                    >
                      <CalendarDays className="h-4 w-4" />
                      <span className="sr-only">Reservations</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewMenus(restaurant.id)}
                    >
                      <Utensils className="h-4 w-4" />
                      <span className="sr-only">Menus</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(restaurant)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(restaurant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddEvent(restaurant)}
                      title="Gérer les événements"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Gérer les événements</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/restaurants/${restaurant.id}/events`)}
                      title="Manage Events"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="sr-only">Manage Events</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedRestaurant && (
        <RestaurantEventsDialog
          isOpen={isEventDialogOpen}
          onOpenChange={setIsEventDialogOpen}
          restaurant={selectedRestaurant}
        />
      )}
    </>
  );
};
