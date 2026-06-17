
import React, { useState, useRef } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Image, X, Crop as CropIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploadProps {
  id: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
  aspect?: number;
}

export const ImageUpload = ({ id, value, onChange, className, aspect }: ImageUploadProps) => {
  const [preview, setPreview] = useState(value);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImage, setTempImage] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with value if value changes externally
  React.useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTempImage(result);
        // Reset crop state
        setCrop(undefined);
        setCompletedCrop(undefined);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createCroppedImage = () => {
    if (
      !imgRef.current ||
      !completedCrop ||
      completedCrop.width === 0 ||
      completedCrop.height === 0
    ) {
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const img = imgRef.current;
    
    let cropX = completedCrop.x;
    let cropY = completedCrop.y;
    let cropW = completedCrop.width;
    let cropH = completedCrop.height;
    
    if (completedCrop.unit === '%') {
      cropX = (completedCrop.x / 100) * img.width;
      cropY = (completedCrop.y / 100) * img.height;
      cropW = (completedCrop.width / 100) * img.width;
      cropH = (completedCrop.height / 100) * img.height;
    }

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = cropW * scaleX;
    canvas.height = cropH * scaleY;

    ctx.drawImage(
      img,
      cropX * scaleX,
      cropY * scaleY,
      cropW * scaleX,
      cropH * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(croppedImage);
    onChange(croppedImage);
    setCropperOpen(false);
  };

  const handleCancel = () => {
    setCropperOpen(false);
    setTempImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label 
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Image className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
            </p>
          </div>
          <Input
            id={id}
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      )}

      <Dialog open={cropperOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>Recadrer l'image</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto min-h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border p-4">
            {tempImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[50vh]"
              >
                <img
                  ref={imgRef}
                  src={tempImage}
                  alt="A recadrer"
                  style={{ maxHeight: '50vh', maxWidth: '100%' }}
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget;
                    const initialCrop: Crop = {
                      unit: '%',
                      x: 10,
                      y: 10,
                      width: 80,
                      height: 80,
                    };
                    if (aspect) {
                      const imageAspect = width / height;
                      if (imageAspect > aspect) {
                        initialCrop.height = 80;
                        initialCrop.width = (80 / imageAspect) * aspect;
                        initialCrop.x = (100 - initialCrop.width) / 2;
                      } else {
                        initialCrop.width = 80;
                        initialCrop.height = (80 * imageAspect) / aspect;
                        initialCrop.y = (100 - initialCrop.height) / 2;
                      }
                    }
                    setCrop(initialCrop);
                  }}
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={createCroppedImage}
              disabled={!completedCrop?.width || !completedCrop?.height}
            >
              <CropIcon className="mr-2 h-4 w-4" />
              Recadrer et appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
