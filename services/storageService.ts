// storageService.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth } from '../firebaseConfig';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const storage = getStorage();

export const storageService = {
  async uploadMedia(uri: string, previousImageUrl?: string): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');
  
      // Improve image compression and format handling
      const compressedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Increased width for better quality
        { 
          compress: 0.5, // Better quality compression
          format: SaveFormat.JPEG,
        }
      );
  
      const response = await fetch(compressedImage.uri);
      const blob = await response.blob();
      
      // Enhanced metadata
      const metadata = {
        contentType: 'image/jpeg',
        cacheControl: 'public,max-age=86400',
        customMetadata: {
          uploadedBy: currentUser.uid,
          timestamp: Date.now().toString()
        }
      };
  
      const fileName = `image_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const path = `users/${currentUser.uid}/images/${fileName}`;
      const storageRef = ref(storage, path);
  
      await uploadBytes(storageRef, blob, metadata);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
,  

  // Keep existing methods
  async replaceImages(newUris: string[], previousUrls: string[]): Promise<string[]> {
    try {
      await this.deleteMultipleMedia(previousUrls);
      const uploadPromises = newUris.map(uri => this.uploadMedia(uri));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error replacing images:', error);
      throw error;
    }
  },

  async deleteMedia(url: string): Promise<void> {
    if (!url) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const urlPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
      const fileRef = ref(storage, urlPath);
      
      await deleteObject(fileRef);
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        console.log('File already deleted or does not exist');
        return;
      }
      throw error;
    }
  },

  async deleteMultipleMedia(urls: string[]): Promise<void> {
    if (!urls || urls.length === 0) return;
    const deletePromises = urls.map(url => this.deleteMedia(url));
    try {
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      throw error;
    }
  }
};
