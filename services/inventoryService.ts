import { collection, addDoc, query, getDocs, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit, writeBatch } from 'firebase/firestore';
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
  status: 'available' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

export const inventoryService = {
  async addDevice(deviceData: Omit<InventoryItem, 'id' | 'dealerId' | 'createdAt' | 'updatedAt' | 'status'>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const device = {
        ...deviceData,
        status: 'available',
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
      where('status', '==', 'available'),
      orderBy('createdAt', 'asc'),
      orderBy('__name__', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      onUpdate(items);
    });
  },

  async searchInventoryPhones(searchQuery: string): Promise<InventoryItem[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
  
      // Match the existing index structure
      const q = query(
        collection(db, 'inventory'),
        where('dealerId', '==', currentUser.uid),
        where('status', '==', 'available'),
        orderBy('model', 'asc'),
        orderBy('__name__', 'asc') // Matches your index
      );
  
      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
  
      console.log('Firestore returned:', querySnapshot.docs.length, 'documents');
  
      // Filter results based on the search query
      const filteredResults = querySnapshot.docs
        .filter((doc) => {
          const data = doc.data();
          const searchLower = searchQuery.toLowerCase();
          return (
            data.model.toLowerCase().includes(searchLower) ||
            data.brand.toLowerCase().includes(searchLower)
          );
        })
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InventoryItem[];
  
      console.log('Filtered results:', filteredResults);
      return filteredResults;
    } catch (error) {
      console.error('Error searching inventory:', error);
      throw error;
    }
  }
  
,  
  
  
  
  
  

  async updateDeviceStatus(deviceIds: string[], status: 'available' | 'sold') {
    try {
      const batch = writeBatch(db);
      
      deviceIds.forEach(id => {
        const deviceRef = doc(db, 'inventory', id);
        batch.update(deviceRef, { 
          status,
          updatedAt: new Date()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
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
  },

  async refreshInventory() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const inventoryQuery = query(
        collection(db, 'inventory'),
        where('dealerId', '==', currentUser.uid),
        where('status', '==', 'available'),
        orderBy('createdAt', 'asc'),
        orderBy('__name__', 'asc')
      );

      const snapshot = await getDocs(inventoryQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
    } catch (error) {
      console.error('Error refreshing inventory:', error);
      throw error;
    }
  },

  async getSoldDevices() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const q = query(
        collection(db, 'inventory'),
        where('dealerId', '==', currentUser.uid),
        where('status', '==', 'sold'),
        orderBy('updatedAt', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
    } catch (error) {
      console.error('Error getting sold devices:', error);
      throw error;
    }
  }
};
