import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth } from '../firebaseConfig';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const storage = getStorage();

export const storageService = {
  async uploadDeviceMedia(deviceId: string, files: { uri: string, type: 'image' | 'video' }[]): Promise<string[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const uploadPromises = files.map(async (file, index) => {
        const timestamp = Date.now();
        const extension = file.type === 'image' ? 'jpg' : 'mp4';
        const fileName = `${file.type}_${timestamp}_${index}.${extension}`;
        const path = `devices/${deviceId}/${file.type}s/${fileName}`;
        
        let processedUri = file.uri;
        if (file.type === 'image') {
          processedUri = await this.compressImage(file.uri);
        }

        const response = await fetch(processedUri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        // Cleanup temporary files
        if (processedUri !== file.uri) {
          await FileSystem.deleteAsync(processedUri, { idempotent: true });
        }

        return downloadURL;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  async compressImage(uri: string): Promise<string> {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 800, height: 800 } }],
        {
          compress: 0.5,
          format: SaveFormat.JPEG
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  },

  async deleteDeviceMedia(deviceId: string): Promise<void> {
    try {
      const folderPath = `devices/${deviceId}`;
      const folderRef = ref(storage, folderPath);
      await deleteObject(folderRef);
    } catch (error) {
      console.error('Error deleting device media:', error);
      throw error;
    }
  }
};
