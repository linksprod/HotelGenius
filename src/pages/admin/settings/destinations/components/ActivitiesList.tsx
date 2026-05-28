
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Edit, Trash } from 'lucide-react';
import { Activity } from '@/features/types/supabaseTypes';

interface ActivitiesListProps {
  activities: Activity[];
  isLoading: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const ActivitiesList = ({ activities, isLoading, onEdit, onDelete }: ActivitiesListProps) => {
  if (isLoading) {
    return <p>Loading activities...</p>;
  }

  return (
    <>
      <h3 className="text-lg font-medium">Things To Do</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  {activity.image && (
                    <img
                      src={activity.image}
                      alt={activity.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>{activity.name}</TableCell>
                <TableCell className="max-w-xs truncate">{activity.description}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(activity)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(activity.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No activities found. Add your first activity.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default ActivitiesList;
