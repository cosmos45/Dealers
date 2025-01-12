import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const mediaService = {
  async uploadMedia(file: Blob, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  },

  async uploadMultipleMedia(files: Blob[], folder: string): Promise<string[]> {
    const urls = await Promise.all(
      files.map(async (file, index) => {
        const path = `${folder}/${Date.now()}_${index}`;
        return this.uploadMedia(file, path);
      })
    );
    return urls;
  }
};
