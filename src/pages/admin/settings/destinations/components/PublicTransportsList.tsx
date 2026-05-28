
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { PublicTransport } from '@/features/types/supabaseTypes';

interface PublicTransportsListProps {
  transports: PublicTransport[];
  isLoading: boolean;
  onEdit: (transport: PublicTransport) => void;
  onDelete: (id: string) => void;
}

const PublicTransportsList = ({ transports, isLoading, onEdit, onDelete }: PublicTransportsListProps) => {
  if (isLoading) {
    return <p>Chargement des transports publics...</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Liste des transports publics</h3>
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
          {transports && transports.length > 0 ? (
            transports.map((transport) => (
              <TableRow key={transport.id}>
                <TableCell className="font-medium">{transport.name}</TableCell>
                <TableCell className="max-w-[300px] truncate">{transport.description}</TableCell>
                <TableCell>
                  {transport.website && (
                    <a 
                      href={transport.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {transport.website}
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transport)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transport.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Aucun transport public trouvé. Ajoutez-en un !
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PublicTransportsList;
