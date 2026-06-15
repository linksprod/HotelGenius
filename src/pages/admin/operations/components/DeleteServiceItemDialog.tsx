import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteServiceItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const DeleteServiceItemDialog: React.FC<DeleteServiceItemDialogProps> = ({
  isOpen,
  onOpenChange,
  itemName,
  onConfirm,
  isDeleting,
}) => {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent closing immediately to allow async execution
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl p-6 gap-6 animate-in fade-in zoom-in duration-200">
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive animate-pulse ring-4 ring-destructive/5">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Delete Service Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-foreground font-semibold">"{itemName}"</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="flex-1 rounded-xl h-10 border-border/60 hover:bg-muted/80 text-muted-foreground font-medium transition-colors"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium transition-colors shadow-sm shadow-destructive/25"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteServiceItemDialog;
