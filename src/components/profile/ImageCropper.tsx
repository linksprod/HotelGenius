
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Crop as CropIcon } from 'lucide-react';
import { RotateCw, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  isUploading: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, isUploading }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const aspect = 1; // Square aspect ratio for profile picture
    setCrop(centerAspectCrop(width, height, aspect));
  }, []);

  const rotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const createCroppedImage = useCallback(() => {
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

    // Calculate the dimensions of the image after rotation
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Set the canvas size to match the crop size
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Canvas size will be the maximum of width or height to allow for rotation
    const maxSize = Math.max(cropWidth, cropHeight);
    canvas.width = maxSize;
    canvas.height = maxSize;

    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate around the center
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw the image centered on the canvas
    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      -cropWidth / 2,
      -cropHeight / 2,
      cropWidth,
      cropHeight
    );

    // Convert canvas to jpeg format
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImage);
  }, [completedCrop, onCropComplete, rotation]);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-md">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1}
          className="max-h-[50vh] mx-auto"
        >
          <img
            ref={imgRef}
            src={image}
            alt="Profile image to crop"
            style={{
              transform: `rotate(${rotation}deg)`,
              maxHeight: '50vh',
              maxWidth: '100%'
            }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={rotateLeft}
          disabled={isUploading}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={rotateRight}
          disabled={isUploading}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <Button
        onClick={createCroppedImage}
        disabled={isUploading || !completedCrop?.width || !completedCrop?.height}
        className="w-full"
      >
        <CropIcon className="mr-2 h-4 w-4" />
        Apply
      </Button>
    </div>
  );
};

export default ImageCropper;
