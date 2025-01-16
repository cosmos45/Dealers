import { collection, addDoc, query, getDocs, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit, writeBatch, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { storageService } from './storageService';

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
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SoldPhone {
  id: string;
  model: string;
  brand: string;
  condition: string;
  price: number;
  dealerId: string;
  dealerName: string;
  dealType: string;
  soldAt: string;
}

export const inventoryService = {
  async getSoldDevicesWithDetails(): Promise<SoldPhone[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const q = query(
        collection(db, 'soldPhones'),
        where('dealerId', '==', currentUser.uid),
        orderBy('soldAt', 'desc'),
        orderBy('__name__', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SoldPhone[];
    } catch (error) {
      console.error('Error getting sold devices:', error);
      throw error;
    }
  },

  async searchSoldDevices(searchQuery: string): Promise<SoldPhone[]> {
    try {
      const devices = await this.getSoldDevicesWithDetails();
      
      if (!searchQuery.trim()) return devices;
      
      const searchLower = searchQuery.toLowerCase();
      return devices.filter(device => 
        device.model.toLowerCase().includes(searchLower) ||
        device.brand.toLowerCase().includes(searchLower) ||
        device.dealerName.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching sold devices:', error);
      throw error;
    }
  },

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
  
      const q = query(
        collection(db, 'inventory'),
        where('dealerId', '==', currentUser.uid),
        where('status', '==', 'available'),
        orderBy('model', 'asc'),
        orderBy('__name__', 'asc')
      );
  
      const querySnapshot = await getDocs(q);
  
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
  
      return filteredResults;
    } catch (error) {
      console.error('Error searching inventory:', error);
      throw error;
    }
  },

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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
  
      // Check document existence first
      const docRef = doc(db, 'inventory', deviceId);
      const deviceDoc = await getDoc(docRef);
  
      // Handle non-existent document gracefully
      if (!deviceDoc.exists()) {
        throw new Error('Device not found');
      }
  
      const deviceData = deviceDoc.data();
      
      // Verify ownership
      if (deviceData.dealerId !== currentUser.uid) {
        throw new Error('Permission denied: Device belongs to another dealer');
      }
  
      // Delete associated images if they exist
      if (deviceData.images?.length) {
        await Promise.all(
          deviceData.images.map(async (imageUrl) => {
            try {
              await storageService.deleteMedia(imageUrl);
            } catch (error) {
              console.warn('Error deleting image:', error);
            }
          })
        );
      }
  
      // Delete the document
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    }
  }
  
  ,  

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
