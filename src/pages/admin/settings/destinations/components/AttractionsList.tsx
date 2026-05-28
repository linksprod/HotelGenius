
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Edit, Trash } from 'lucide-react';
import { Attraction } from '@/features/types/supabaseTypes';

interface AttractionsListProps {
  attractions: Attraction[];
  isLoading: boolean;
  onEdit: (attraction: Attraction) => void;
  onDelete: (id: string) => void;
}

const AttractionsList = ({ attractions, isLoading, onEdit, onDelete }: AttractionsListProps) => {
  if (isLoading) {
    return <p>Loading attractions...</p>;
  }

  return (
    <>
      <h3 className="text-lg font-medium">Popular Attractions</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Opening Hours</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attractions && attractions.length > 0 ? (
            attractions.map((attraction) => (
              <TableRow key={attraction.id}>
                <TableCell>
                  {attraction.image && (
                    <img
                      src={attraction.image}
                      alt={attraction.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>{attraction.name}</TableCell>
                <TableCell>{attraction.distance}</TableCell>
                <TableCell>{attraction.opening_hours}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(attraction)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(attraction.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No attractions found. Add your first attraction.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default AttractionsList;
