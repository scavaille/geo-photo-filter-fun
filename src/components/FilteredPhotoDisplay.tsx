
import React from 'react';
import { Download, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { saveToGallery } from '@/utils/cameraUtils';

interface PhotoData {
  file: File;
  coordinates?: {
    lat: number;
    lng: number;
  };
  matchedZone?: string;
  filteredImageUrl?: string;
}

interface FilteredPhotoDisplayProps {
  photoData: PhotoData;
  onDownload: () => void;
  onReset: () => void;
}

export const FilteredPhotoDisplay: React.FC<FilteredPhotoDisplayProps> = ({ 
  photoData, 
  onDownload, 
  onReset 
}) => {
  const handleSaveToGallery = async () => {
    if (!photoData.filteredImageUrl) return;
    
    const filename = `filtered_${photoData.file.name.replace(/\.[^/.]+$/, '')}_${Date.now()}.jpg`;
    await saveToGallery(photoData.filteredImageUrl, filename);
  };

  return (
    <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 text-gray-800">
          {photoData.matchedZone === 'No Location Data' || photoData.matchedZone === 'Outside Special Zones' 
            ? '📷 Your Photo' 
            : '✨ Filtered Photo'
          }
        </h3>
        
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{photoData.matchedZone}</span>
        </div>

        {photoData.coordinates && (
          <p className="text-sm text-gray-500">
            Coordinates: {photoData.coordinates.lat.toFixed(4)}, {photoData.coordinates.lng.toFixed(4)}
          </p>
        )}
      </div>

      <div className="mb-6">
        <div className="relative overflow-hidden rounded-lg shadow-lg max-w-2xl mx-auto">
          <img 
            src={photoData.filteredImageUrl} 
            alt="Filtered photo"
            className="w-full h-auto object-contain max-h-96"
          />
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button 
          onClick={handleSaveToGallery}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Save to Gallery
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50"
        >
          Upload Another
        </Button>
      </div>

      {photoData.matchedZone !== 'No Location Data' && 
       photoData.matchedZone !== 'Outside Special Zones' && 
       photoData.matchedZone !== 'Processing Error' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <p className="text-center text-green-800">
            🎉 Congratulations! Your photo was taken in one of our special zones and has been enhanced with a commemorative filter!
          </p>
        </div>
      )}
    </Card>
  );
};
