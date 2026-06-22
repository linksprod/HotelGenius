
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Chat } from '@/components/admin/chat/types';

interface DeleteChatDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatToDelete: Chat | null;
  onConfirmDelete: () => void;
}

const DeleteChatDialog = ({
  isOpen,
  setIsOpen,
  chatToDelete,
  onConfirmDelete,
}: DeleteChatDialogProps) => {
  if (!chatToDelete) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete conversation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this conversation with {chatToDelete.userInfo?.firstName || chatToDelete.userName}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteChatDialog;
