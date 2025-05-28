
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PhotoUpload } from '@/components/PhotoUpload';
import { LocationFilter } from '@/components/LocationFilter';
import { FilteredPhotoDisplay } from '@/components/FilteredPhotoDisplay';

interface PhotoData {
  file: File;
  coordinates?: {
    lat: number;
    lng: number;
  };
  matchedZone?: string;
  filteredImageUrl?: string;
}

const Index = () => {
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhotoUpload = useCallback((data: PhotoData) => {
    setPhotoData(data);
  }, []);

  const handleFilterApplied = useCallback((filteredImageUrl: string, zoneName: string) => {
    setPhotoData(prev => prev ? {
      ...prev,
      filteredImageUrl,
      matchedZone: zoneName
    } : null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!photoData?.filteredImageUrl) return;
    
    const link = document.createElement('a');
    link.href = photoData.filteredImageUrl;
    link.download = `filtered_${photoData.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Photo downloaded successfully!');
  }, [photoData]);

  const handleReset = useCallback(() => {
    setPhotoData(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GeoFilter
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo and we'll automatically detect its location. If it was taken in one of our special zones, 
            we'll apply a beautiful filter to commemorate your visit!
          </p>
        </div>

        <div className="space-y-6">
          {!photoData && (
            <PhotoUpload onPhotoUpload={handlePhotoUpload} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
          )}

          {photoData && !photoData.filteredImageUrl && (
            <LocationFilter 
              photoData={photoData} 
              onFilterApplied={handleFilterApplied}
              setIsProcessing={setIsProcessing}
            />
          )}

          {photoData?.filteredImageUrl && (
            <FilteredPhotoDisplay 
              photoData={photoData}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          )}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-6 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Supported Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <MapPin className="w-4 h-4 inline mr-1 text-green-500" />
                Central Park, NYC
              </div>
              <div>
                <MapPin className="w-4 h-4 inline mr-1 text-red-500" />
                Golden Gate Bridge, SF
              </div>
              <div>
                <MapPin className="w-4 h-4 inline mr-1 text-blue-500" />
                Times Square, NYC
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
