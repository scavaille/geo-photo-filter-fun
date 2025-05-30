
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { toast } from 'sonner';

export const saveToGallery = async (dataUrl: string, filename: string): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Convert data URL to base64
      const base64Data = dataUrl.split(',')[1];
      
      // Save to device filesystem
      const result = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      console.log('File saved to:', result.uri);
      toast.success('Photo saved to device!');
      return true;
    } else {
      // Fallback for web - download as file
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Photo downloaded!');
      return true;
    }
  } catch (error) {
    console.error('Error saving photo:', error);
    toast.error('Failed to save photo');
    return false;
  }
};
