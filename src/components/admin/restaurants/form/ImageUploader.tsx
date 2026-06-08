
import React, { useState } from 'react';
import { Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import ImageListItem from './ImageListItem';
import { compressAndConvertToWebP } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const ImageUploader = ({ form }: ImageUploaderProps) => {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleAddImage = () => {
    if (newImageUrl) {
      const currentImages = form.getValues("images") || [];
      form.setValue("images", [...currentImages, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.error("Seulement les images sont acceptées");
      return;
    }

    try {
      setIsProcessing(true);
      const compressedImageDataUrl = await compressAndConvertToWebP(file);
      
      const currentImages = form.getValues("images") || [];
      form.setValue("images", [...currentImages, compressedImageDataUrl]);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <FormField
      control={form.control}
      name="images"
      render={() => (
        <FormItem>
          <FormLabel>Images</FormLabel>
          <div className="space-y-4">
            {/* URL Input */}
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Image URL" 
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                disabled={isProcessing}
              />
              <Button 
                type="button"
                variant="outline"
                onClick={handleAddImage}
                disabled={!newImageUrl || isProcessing}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* File upload area */}
            <div 
              className={cn(
                "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/50",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isProcessing && document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputFileChange}
                disabled={isProcessing}
              />
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center mb-1">
                Déposez une image ici ou cliquez pour parcourir
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Les images seront compressées à ~30ko et converties en WebP
              </p>
              {isProcessing && (
                <p className="text-xs text-primary mt-2 animate-pulse">
                  Traitement de l'image en cours...
                </p>
              )}
            </div>

            {/* Image list */}
            <div className="grid grid-cols-1 gap-2 mt-2">
              {form.watch("images")?.map((url: string, index: number) => (
                <ImageListItem 
                  key={index} 
                  url={url} 
                  index={index} 
                  onRemove={handleRemoveImage} 
                />
              ))}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageUploader;
