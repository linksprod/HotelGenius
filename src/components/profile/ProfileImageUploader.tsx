
import React, { useState, useRef, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, Crop, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { compressAndConvertToWebP } from '@/lib/imageUtils';
import ImageCropper from './ImageCropper';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProfileImageUploaderProps {
  initialImage?: string;
  firstName: string;
  lastName: string;
  onImageChange: (imageData: string | null) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  initialImage,
  firstName,
  lastName,
  onImageChange
}) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = () => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a valid image."
        });
        return;
      }

      // Check file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "The image must not exceed 5 MB."
        });
        return;
      }

      // Create a temporary URL for the cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while uploading the image."
      });
    } finally {
      setIsUploading(false);
      // Reset the input to allow uploading the same image again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImageData: string) => {
    try {
      setIsUploading(true);

      // Convert the base64 string to a blob
      const response = await fetch(croppedImageData);
      const blob = await response.blob();

      // Create a File object from the Blob
      // We need to convert the Blob to a File because compressAndConvertToWebP expects a File
      const fileName = `profile_${Date.now()}.jpg`;
      const fileFromBlob = new File([blob], fileName, { type: blob.type });

      // Compress the cropped image
      const compressedImage = await compressAndConvertToWebP(fileFromBlob, 100);

      setImage(compressedImage);
      onImageChange(compressedImage);
      setCropperOpen(false);
      setTempImage(null);

      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated."
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while processing the image."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setTempImage(null);
  };

  const handleRemoveImage = () => {
    setImage(null);
    onImageChange(null);
    toast({
      title: "Image deleted",
      description: "Your profile picture has been deleted."
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-white shadow-md">
          {image ? <AvatarImage src={image} alt="Profile picture" /> : null}
          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <Button onClick={triggerFileInput} size="icon" className="h-8 w-8 rounded-full shadow" disabled={isUploading}>
            <Camera className="h-4 w-4" />
          </Button>

          {image && (
            <Button onClick={handleRemoveImage} size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={handleCropCancel}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <h3 className="text-lg font-semibold">Adjust Image</h3>
              <div className="w-[72px]"></div>
            </div>

            {tempImage && (
              <ImageCropper
                image={tempImage}
                onCropComplete={handleCropComplete}
                isUploading={isUploading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center text-sm text-muted-foreground">

      </div>
    </div>
  );
};

export default ProfileImageUploader;
