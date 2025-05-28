
import { Canvas as FabricCanvas, FabricImage, Rect } from 'fabric';

export interface LocationZone {
  name: string;
  type: 'radius' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number; // in kilometers
  polygon?: { lat: number; lng: number }[];
  filter: {
    type: 'overlay' | 'sepia' | 'vintage' | 'brightness';
    color?: string;
    intensity?: number;
  };
}

export const PREDEFINED_ZONES: LocationZone[] = [
  {
    name: "Central Park, NYC",
    type: "radius",
    center: { lat: 40.7829, lng: -73.9654 },
    radius: 2,
    filter: {
      type: "overlay",
      color: "rgba(34, 197, 94, 0.3)",
      intensity: 0.3
    }
  },
  {
    name: "Golden Gate Bridge, SF",
    type: "radius", 
    center: { lat: 37.8199, lng: -122.4783 },
    radius: 1.5,
    filter: {
      type: "overlay",
      color: "rgba(239, 68, 68, 0.3)",
      intensity: 0.3
    }
  },
  {
    name: "Times Square, NYC",
    type: "radius",
    center: { lat: 40.7580, lng: -73.9855 },
    radius: 0.5,
    filter: {
      type: "overlay",
      color: "rgba(59, 130, 246, 0.3)",
      intensity: 0.3
    }
  }
];

export const checkLocationInZones = (coordinates: { lat: number; lng: number }): LocationZone | null => {
  for (const zone of PREDEFINED_ZONES) {
    if (zone.type === 'radius' && zone.center && zone.radius) {
      const distance = calculateDistance(coordinates, zone.center);
      console.log(`Distance to ${zone.name}: ${distance}km (threshold: ${zone.radius}km)`);
      
      if (distance <= zone.radius) {
        return zone;
      }
    }
  }
  return null;
};

const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

export const applyFilterToImage = (file: File, zone: LocationZone): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = new FabricCanvas(null, {
          width: img.width,
          height: img.height
        });

        const imageUrl = URL.createObjectURL(file);
        
        FabricImage.fromURL(imageUrl, {
          crossOrigin: 'anonymous'
        }).then((fabricImg) => {
          // Scale image to fit canvas
          fabricImg.scaleToWidth(canvas.width!);
          fabricImg.scaleToHeight(canvas.height!);
          fabricImg.set({
            left: 0,
            top: 0,
            selectable: false
          });

          canvas.add(fabricImg);

          // Apply filter based on zone configuration
          if (zone.filter.type === 'overlay' && zone.filter.color) {
            const overlay = new Rect({
              left: 0,
              top: 0,
              width: canvas.width,
              height: canvas.height,
              fill: zone.filter.color,
              selectable: false,
              evented: false
            });
            
            canvas.add(overlay);
          }

          // Convert to data URL
          const dataURL = canvas.toDataURL('image/jpeg', 0.9);
          canvas.dispose();
          URL.revokeObjectURL(imageUrl);
          resolve(dataURL);
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
