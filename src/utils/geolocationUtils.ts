
export interface GPSCoordinates {
  lat: number;
  lng: number;
}

export const getCurrentLocation = (): Promise<GPSCoordinates | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Device location:', coordinates);
        resolve(coordinates);
      },
      (error) => {
        console.error('Error getting location:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};
