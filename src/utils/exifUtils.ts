
import EXIF from 'exif-js';

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

export const extractGPSFromImage = (file: File): Promise<GPSCoordinates | null> => {
  return new Promise((resolve) => {
    // Create a FileReader to read the file as an ArrayBuffer
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        resolve(null);
        return;
      }

      // Convert ArrayBuffer to a format EXIF.js can work with
      const dataView = new DataView(arrayBuffer);
      
      // Use EXIF.js with the data view
      EXIF.getData({ exifdata: dataView } as any, function() {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lng = EXIF.getTag(this, "GPSLongitude");
        const lngRef = EXIF.getTag(this, "GPSLongitudeRef");

        console.log('EXIF GPS Data:', { lat, latRef, lng, lngRef });

        if (lat && lng && latRef && lngRef) {
          const latDecimal = convertDMSToDD(lat, latRef);
          const lngDecimal = convertDMSToDD(lng, lngRef);
          
          console.log('Converted coordinates:', { lat: latDecimal, lng: lngDecimal });
          
          resolve({
            lat: latDecimal,
            lng: lngDecimal
          });
        } else {
          console.log('No GPS data found in EXIF');
          resolve(null);
        }
      });
    };

    reader.onerror = () => {
      console.error('Error reading file');
      resolve(null);
    };

    reader.readAsArrayBuffer(file);
  });
};

const convertDMSToDD = (dms: number[], ref: string): number => {
  let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
  if (ref === "S" || ref === "W") {
    dd = dd * -1;
  }
  return dd;
};
