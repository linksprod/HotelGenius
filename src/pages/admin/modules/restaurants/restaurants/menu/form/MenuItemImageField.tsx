
import React, { useState } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { MenuItemFormValues } from '../MenuItemFormSchema';
import { cn } from '@/lib/utils';
import { compressAndConvertToWebP } from '@/lib/imageUtils';
import { toast } from 'sonner';

interface MenuItemImageFieldProps {
  form: UseFormReturn<MenuItemFormValues>;
}

export const MenuItemImageField = ({ form }: MenuItemImageFieldProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are accepted.");
      return;
    }

    try {
      setIsProcessing(true);
      const compressedImageDataUrl = await compressAndConvertToWebP(file);
      form.setValue("image", compressedImageDataUrl);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("There was a problem processing the image.");
    } finally {
      setIsProcessing(false);
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
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image</FormLabel>
          <FormControl>
            <Input 
              placeholder="URL de l'image (optionnel)" 
              {...field} 
              value={field.value || ""}
              disabled={isProcessing}
            />
          </FormControl>
          
          <div 
            className={cn(
              "border-2 border-dashed rounded-md p-6 mt-2 flex flex-col items-center justify-center cursor-pointer transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/50",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isProcessing && document.getElementById('menu-image-upload')?.click()}
          >
            <input
              id="menu-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileUpload(files[0]);
                  e.target.value = '';
                }
              }}
              disabled={isProcessing}
            />
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center mb-1">
              Déposez une image ici ou cliquez pour naviguer
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Les images seront compressées à ~30KB et converties au format WebP
            </p>
            {isProcessing && (
              <p className="text-xs text-primary mt-2 animate-pulse">
                Traitement de l'image...
              </p>
            )}
          </div>
          
          {field.value && !isProcessing && (
            <div className="mt-2 relative">
              <div className="relative aspect-video rounded-md overflow-hidden border">
                <img 
                  src={field.value} 
                  alt="Aperçu du plat" 
                  className="object-cover w-full h-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => form.setValue("image", "")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <FormDescription>
            Téléchargez une image ou fournissez une URL pour le plat.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
