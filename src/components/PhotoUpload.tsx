
import React, { useCallback, useRef } from 'react';
import { Upload, Image, Camera, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCurrentLocation } from '@/utils/geolocationUtils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsProcessing(true);
    toast.info('Getting your current location...');

    try {
      const coordinates = await getCurrentLocation();
      
      if (coordinates) {
        toast.success(`Location found: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`);
        onPhotoUpload({ file, coordinates });
      } else {
        toast.warning('Could not get your location - photo will be displayed without filter');
        onPhotoUpload({ file });
      }
    } catch (error) {
      console.error('Error processing photo:', error);
      toast.error('Error getting location');
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

  const handleGalleryInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleCameraInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

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
          {isProcessing ? 'Getting Location...' : 'Take or Upload Photo'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {isProcessing 
            ? 'Using device GPS to determine your current location...'
            : 'We\'ll use your device location to apply location-based filters'
          }
        </p>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryInput}
          className="hidden"
          disabled={isProcessing}
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraInput}
          className="hidden"
          disabled={isProcessing}
        />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={openCamera}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isProcessing}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          
          <Button 
            onClick={openGallery}
            variant="outline"
            className="border-indigo-300 hover:bg-indigo-50"
            disabled={isProcessing}
          >
            <Image className="w-4 h-4 mr-2" />
            Choose from Gallery
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
          <MapPin className="w-3 h-3" />
          <span>Location permission required for filters</span>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Or drag and drop an image here
        </p>
      </div>
    </Card>
  );
};
