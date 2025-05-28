
import React, { useCallback } from 'react';
import { Upload, Image } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { extractGPSFromImage } from '@/utils/exifUtils';

interface PhotoData {
  file: File;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface PhotoUploadProps {
  onPhotoUpload: (data: PhotoData) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onPhotoUpload, 
  isProcessing, 
  setIsProcessing 
}) => {
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsProcessing(true);
    toast.info('Extracting location data from photo...');

    try {
      const coordinates = await extractGPSFromImage(file);
      
      if (coordinates) {
        toast.success(`Location found: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`);
        onPhotoUpload({ file, coordinates });
      } else {
        toast.warning('No GPS data found in this photo');
        onPhotoUpload({ file });
      }
    } catch (error) {
      console.error('Error processing photo:', error);
      toast.error('Error processing photo');
      onPhotoUpload({ file });
    } finally {
      setIsProcessing(false);
    }
  }, [onPhotoUpload, setIsProcessing]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  return (
    <Card 
      className="p-8 border-2 border-dashed border-indigo-200 bg-white/50 backdrop-blur-sm hover:border-indigo-300 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {isProcessing ? (
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          ) : (
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          {isProcessing ? 'Processing Photo...' : 'Upload Your Photo'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {isProcessing 
            ? 'Extracting GPS coordinates from EXIF data...'
            : 'Drag and drop your photo here or click to browse'
          }
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="photo-upload"
          disabled={isProcessing}
        />
        
        <Button 
          asChild 
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={isProcessing}
        >
          <label htmlFor="photo-upload" className="cursor-pointer">
            <Image className="w-4 h-4 mr-2" />
            Choose Photo
          </label>
        </Button>
      </div>
    </Card>
  );
};
