
import React, { useRef, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Upload, ImageIcon } from 'lucide-react';
import { compressAndConvertToWebP } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

interface FacilityImageUploaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const FacilityImageUploader = ({ form, isLoading }: FacilityImageUploaderProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    form.getValues('image_url') || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUploadedImage(form.getValues('image_url') || null);
  }, [form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        console.error("Veuillez sélectionner une image valide.");
        return;
      }

      // Vérifier la taille du fichier (max 5MB avant compression)
      if (file.size > 5 * 1024 * 1024) {
        console.error("L'image ne doit pas dépasser 5 Mo.");
        return;
      }

      // Compresser l'image
      const compressedImage = await compressAndConvertToWebP(file, 100); // max 100KB après compression
      setUploadedImage(compressedImage);
      form.setValue('image_url', compressedImage);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
    } finally {
      // Réinitialiser l'input pour permettre de télécharger la même image à nouveau
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image</FormLabel>
          <div className="space-y-4">
            <FormControl>
              <Input 
                placeholder="URL de l'image" 
                {...field} 
                value={field.value || ''}
              />
            </FormControl>

            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer w-full transition-colors hover:border-primary/50",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                onClick={triggerFileUpload}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center mb-1">
                  Cliquez pour télécharger une image
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Les images seront compressées et converties en WebP
                </p>
              </div>

              {uploadedImage && (
                <div className="mt-4 border rounded-md p-2 w-full">
                  <div className="flex items-center gap-2">
                    {uploadedImage.startsWith('data:') ? (
                      <div className="h-20 w-20 rounded overflow-hidden bg-muted">
                        <img src={uploadedImage} alt="Aperçu" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-6 w-6" />
                        <span className="text-sm truncate">{uploadedImage}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FacilityImageUploader;
