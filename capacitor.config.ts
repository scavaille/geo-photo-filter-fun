
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9a02e68f5b114022a32fd547dcba4cdc',
  appName: 'geo-photo-filter-fun',
  webDir: 'dist',
  server: {
    url: 'https://9a02e68f-5b11-4022-a32f-d547dcba4cdc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Filesystem: {
      iosDangerouslyAllowFileUrl: true
    }
  }
};

export default config;
