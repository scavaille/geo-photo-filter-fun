
import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { checkLocationInZones, applyFilterToImage } from '@/utils/locationUtils';

interface PhotoData {
  file: File;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationFilterProps {
  photoData: PhotoData;
  onFilterApplied: (filteredImageUrl: string, zoneName: string) => void;
  setIsProcessing: (processing: boolean) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({ 
  photoData, 
  onFilterApplied,
  setIsProcessing 
}) => {
  const [currentZone, setCurrentZone] = useState<string | null>(null);

  useEffect(() => {
    const processLocation = async () => {
      if (!photoData.coordinates) {
        toast.warning('No GPS coordinates found - photo will be displayed without filter');
        // Create a basic image URL for display
        const imageUrl = URL.createObjectURL(photoData.file);
        onFilterApplied(imageUrl, 'No Location Data');
        return;
      }

      setIsProcessing(true);
      
      try {
        const matchedZone = checkLocationInZones(photoData.coordinates);
        
        if (matchedZone) {
          setCurrentZone(matchedZone.name);
          toast.success(`Photo location matches ${matchedZone.name}! Applying filter...`);
          
          const filteredImageUrl = await applyFilterToImage(photoData.file, matchedZone);
          onFilterApplied(filteredImageUrl, matchedZone.name);
        } else {
          toast.info('Photo location doesn\'t match any special zones');
          const imageUrl = URL.createObjectURL(photoData.file);
          onFilterApplied(imageUrl, 'Outside Special Zones');
        }
      } catch (error) {
        console.error('Error applying filter:', error);
        toast.error('Error processing photo location');
        const imageUrl = URL.createObjectURL(photoData.file);
        onFilterApplied(imageUrl, 'Processing Error');
      } finally {
        setIsProcessing(false);
      }
    };

    processLocation();
  }, [photoData, onFilterApplied, setIsProcessing]);

  return (
    <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Checking Location
        </h3>
        
        <p className="text-gray-600 mb-4">
          Comparing coordinates to our special zones...
        </p>

        {photoData.coordinates && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>
              {photoData.coordinates.lat.toFixed(4)}, {photoData.coordinates.lng.toFixed(4)}
            </span>
          </div>
        )}

        {currentZone && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              📍 Matched Zone: {currentZone}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
