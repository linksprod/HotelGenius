
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { TableReservation } from '@/features/dining/types';

interface StatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: TableReservation | null;
  newStatus: 'pending' | 'confirmed' | 'cancelled';
  setNewStatus: (status: 'pending' | 'confirmed' | 'cancelled') => void;
  onUpdateStatus: () => void;
}

const StatusDialog = ({
  isOpen,
  onOpenChange,
  reservation,
  newStatus,
  setNewStatus,
  onUpdateStatus
}: StatusDialogProps) => {
  // Ensure newStatus always has a valid value
  const statusValue = newStatus || 'pending';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Reservation Status</DialogTitle>
          <DialogDescription>
            Change the reservation status for {reservation?.guestName || 'this guest'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select 
            value={statusValue} 
            onValueChange={(value: 'pending' | 'confirmed' | 'cancelled') => setNewStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button onClick={onUpdateStatus}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusDialog;
