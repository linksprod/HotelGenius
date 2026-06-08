import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { syncGuestData } from '@/features/users/services/guestService';
import { toast } from '@/hooks/use-toast';
import { User, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadProfileImage } from '@/features/users/services/profileImageService';
import { cn } from '@/lib/utils';

interface AdminProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminProfileDialog: React.FC<AdminProfileDialogProps> = ({ open, onOpenChange }) => {
  const { user, userData, refreshUserData } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open && userData) {
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
      setProfileImage(userData.profile_image || null);
    }
  }, [open, userData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const publicUrl = await uploadProfileImage(user.id, base64String);
        
        if (publicUrl) {
          setProfileImage(publicUrl);
          toast({
            title: "Image Uploaded",
            description: "Click Save Plans to apply changes.",
          });
        } else {
          throw new Error("Upload failed");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload profile image.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !userData) return;

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...userData,
        first_name: firstName,
        last_name: lastName,
        profile_image: profileImage,
      };

      const success = await syncGuestData(user.id, updatedData);

      if (success) {
        await refreshUserData();
        toast({
          title: "Profile Updated",
          description: "Your name has been updated successfully.",
        });
        onOpenChange(false);
      } else {
        throw new Error("Failed to update profile");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your display name for the admin panel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-1 ring-border">
                <AvatarImage src={profileImage || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {firstName?.[0]}{lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                  isUploading && "opacity-100"
                )}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                  disabled={isUploading || isSubmitting}
                />
              </label>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Change Profile Picture</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                First Name
              </Label>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="col-span-3 h-11 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="col-span-3 h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isUploading} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading || (firstName === userData?.first_name && lastName === userData?.last_name && profileImage === userData?.profile_image)}
              className="rounded-xl flex-1 bg-primary font-bold shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProfileDialog;
