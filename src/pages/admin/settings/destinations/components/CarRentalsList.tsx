
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { CarRental } from '@/features/types/supabaseTypes';

interface CarRentalsListProps {
  carRentals: CarRental[];
  isLoading: boolean;
  onEdit: (carRental: CarRental) => void;
  onDelete: (id: string) => void;
}

const CarRentalsList = ({ carRentals, isLoading, onEdit, onDelete }: CarRentalsListProps) => {
  if (isLoading) {
    return <p>Chargement des services de location de voiture...</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Liste des services de location de voiture</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Site Web</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carRentals && carRentals.length > 0 ? (
            carRentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell className="font-medium">{rental.name}</TableCell>
                <TableCell className="max-w-[300px] truncate">{rental.description}</TableCell>
                <TableCell>
                  {rental.website && (
                    <a 
                      href={rental.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {rental.website}
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(rental)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(rental.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Aucun service de location de voiture trouvé. Ajoutez-en un !
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CarRentalsList;
