
import React, { useState, useEffect } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { MenuItemFormValues } from '../MenuItemFormSchema';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MenuItemPdfFieldProps {
  form: UseFormReturn<MenuItemFormValues>;
}

export const MenuItemPdfField = ({ form }: MenuItemPdfFieldProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Log when component is mounted with current PDF value
  useEffect(() => {
    const currentPdf = form.getValues("menuPdf");
    console.log("État initial du PDF:", currentPdf ? "PDF présent" : "Aucun PDF");
  }, [form]);

  // Log when PDF value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "menuPdf") {
        console.log("Valeur du PDF modifiée:", value.menuPdf ? "PDF présent" : "Aucun PDF");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handlePdfUpload = async (file: File) => {
    if (!file.type.startsWith('application/pdf')) {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier PDF ne doit pas dépasser 5MB");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Traitement du PDF commencé:", file.name, file.size, "bytes");
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          console.log("PDF converti en base64, début:", reader.result.substring(0, 50) + "...");
          form.setValue("menuPdf", reader.result);
          toast.success("PDF ajouté avec succès");
        }
      };
    } catch (error) {
      console.error("Erreur lors du traitement du PDF:", error);
      toast.error("Erreur lors du traitement du PDF");
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

  return (
    <FormField
      control={form.control}
      name="menuPdf"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Menu PDF (optionnel)</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {field.value && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">PDF ajouté</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      form.setValue("menuPdf", "");
                      console.log("PDF supprimé par l'utilisateur");
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
              <div
                className={cn(
                  "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/50",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                  
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    await handlePdfUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => !isProcessing && document.getElementById('pdf-upload')?.click()}
              >
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      await handlePdfUpload(files[0]);
                      e.target.value = '';
                    }
                  }}
                  disabled={isProcessing}
                />
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center mb-1">
                  Déposez un PDF ici ou cliquez pour naviguer
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Taille maximale: 5MB
                </p>
                {isProcessing && (
                  <p className="text-xs text-primary mt-2 animate-pulse">
                    Traitement du PDF...
                  </p>
                )}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
