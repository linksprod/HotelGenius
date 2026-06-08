
/**
 * Utilities for image processing, compression and conversion
 */

/**
 * Compresses an image and converts it to WebP format
 * @param file The image file to compress
 * @param maxSizeKB The maximum size in KB (default: 30)
 * @returns A promise that resolves to the data URL of the compressed image
 */
export const compressAndConvertToWebP = async (
  file: File | Blob,
  maxSizeKB: number = 30
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Calculate dimensions while maintaining aspect ratio
        const { width, height } = calculateDimensions(img, maxSizeKB);
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Start with a high quality
        let quality = 0.9;
        let dataUrl = canvas.toDataURL("image/webp", quality);
        let iteration = 0;
        const maxIterations = 10;
        
        // Iteratively reduce quality until the image is below the max size
        const compressStep = () => {
          const sizeInKB = calculateSizeInKB(dataUrl);
          
          if (sizeInKB <= maxSizeKB || iteration >= maxIterations) {
            resolve(dataUrl);
          } else {
            iteration++;
            // Reduce quality proportionally to how much we need to compress
            quality = Math.max(0.1, quality * (maxSizeKB / sizeInKB));
            dataUrl = canvas.toDataURL("image/webp", quality);
            compressStep();
          }
        };
        
        compressStep();
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
};

/**
 * Calculates the size of a data URL in KB
 */
const calculateSizeInKB = (dataUrl: string): number => {
  // Calculate approximate size: remove metadata, count remaining chars,
  // and convert to approximate KB (based on base64 encoding overhead)
  const base64 = dataUrl.split(",")[1];
  const approximateSizeInBytes = (base64.length * 3) / 4;
  return approximateSizeInBytes / 1024;
};

/**
 * Calculates optimal dimensions for the image to help reach the target size
 */
const calculateDimensions = (
  img: HTMLImageElement,
  targetKB: number
): { width: number; height: number } => {
  const aspectRatio = img.width / img.height;
  
  // Start with original dimensions
  let width = img.width;
  let height = img.height;
  
  // Reduce dimensions if the image is very large
  // This is a rough estimate, we'll fine-tune with quality later
  const pixelTarget = targetKB * 10000; // Rough pixels target based on target KB
  const currentPixels = width * height;
  
  if (currentPixels > pixelTarget) {
    const scaleFactor = Math.sqrt(pixelTarget / currentPixels);
    width = Math.floor(width * scaleFactor);
    height = Math.floor(height * scaleFactor);
  }
  
  return { width, height };
};
