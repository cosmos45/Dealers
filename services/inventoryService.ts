import { collection, addDoc, query, getDocs, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export interface InventoryItem {
  id?: string;
  brand: string;
  model: string;
  storageGB: number;
  ramGB?: number;
  condition: string;
  quantity: number;
  basePrice: number;
  dealerId: string;
  isIphone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const inventoryService = {
  async addDevice(deviceData: Omit<InventoryItem, 'id' | 'dealerId' | 'createdAt' | 'updatedAt'>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const device = {
        ...deviceData,
        dealerId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'inventory'), device);
      return docRef.id;
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  },

  subscribeToInventory(onUpdate: (items: InventoryItem[]) => void) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found');

    const q = query(
        collection(db, 'inventory'),
        where('dealerId', '==', currentUser.uid),
        orderBy('createdAt', 'asc'),
        orderBy('__name__', 'asc') // Include __name__
      );
      
      

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      onUpdate(items);
    });
  },

  async updateDevice(deviceId: string, updateData: Partial<InventoryItem>) {
    try {
      const docRef = doc(db, 'inventory', deviceId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  },

  async deleteDevice(deviceId: string) {
    try {
      const docRef = doc(db, 'inventory', deviceId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    }
  }
};
