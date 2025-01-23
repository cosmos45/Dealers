import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  limit, 
  writeBatch, 
  getDoc 
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db, auth } from '../firebaseConfig';
import { inventoryService } from './inventoryService';

interface DealPhone {
  model: string;
  quantity: number;
  price: number;
  phoneId?: string;
  condition?: string;
}

export interface Deal {
  id?: string;
  date: string;
  customerName: string;
  contact: string;
  totalAmount: number;
  status: 'Paid' | 'Pending';
  phones: DealPhone[];
  paymentMode: 'cash' | 'online' | 'credit';
  creditTerm?: number;
  dealerId: string;
  dealType: 'retail' | 'wholesale';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleHistory {
  id: string;
  date: string;
  price: number;
  model: string;
  dealType: 'retail' | 'wholesale';
  condition: string;
}

export interface MarketInsights {
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  totalSold: number;
  retailAverage: number;
  wholesaleAverage: number;
}

// Helper function to delete images from Firebase Storage
async function deleteImages(imageUrls: string[]) {
  const storage = getStorage();
  
  const deletePromises = imageUrls.map((url) => {
    const fileRef = ref(storage, url);
    return deleteObject(fileRef).catch((error) => {
      console.warn(`Failed to delete image at ${url}:`, error);
    });
  });

  await Promise.all(deletePromises);
}





export const dealService = {
  
  async addDeal(dealData: Omit<Deal, 'id' | 'date' | 'dealerId' | 'createdAt' | 'updatedAt'>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
  
      const deal = {
        ...dealData,
        date: new Date().toISOString(),
        dealerId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
  
      const cleanDeal = Object.fromEntries(
        Object.entries(deal).filter(([_, value]) => value !== undefined)
      );
  
      // Add deal to Firestore
      const docRef = await addDoc(collection(db, 'deals'), cleanDeal);
  
      // Fetch phone details from inventory and create sold phone records
      const soldPhonePromises = await Promise.all(
        deal.phones.map(async phone => {
          let brand = '';
          if (phone.phoneId) {
            const phoneDoc = await getDoc(doc(db, "inventory", phone.phoneId));
            if (phoneDoc.exists()) {
              brand = phoneDoc.data().brand;
            }
          }
  
          return addDoc(collection(db, 'soldPhones'), {
            model: phone.model,
            condition: phone.condition || 'good',
            price: phone.price,
            dealId: docRef.id,
            dealerId: currentUser.uid,
            dealerName: deal.customerName,
            dealType: deal.dealType,
            brand: brand,
            soldAt: new Date().toISOString()
          });
        })
      );
  
      await Promise.all(soldPhonePromises);
  
      // Update inventory quantities
      const inventoryUpdates = deal.phones.map(async phone => {
        if (phone.phoneId) {
          const phoneRef = doc(db, 'inventory', phone.phoneId);
          const phoneDoc = await getDoc(phoneRef);
          
          if (phoneDoc.exists()) {
            const currentQuantity = phoneDoc.data().quantity;
            const newQuantity = currentQuantity - (phone.quantity || 1);
            
            if (newQuantity < 0) {
              throw new Error(`Insufficient quantity for phone ${phone.model}`);
            }
      
            await updateDoc(phoneRef, {
              quantity: newQuantity,
              status: newQuantity === 0 ? 'sold' : 'available',
              updatedAt: new Date()
            });
          }
        }
      });
      
  
      await Promise.all(inventoryUpdates);
  
      return docRef.id;
  
    } catch (error) {
      console.error('Error adding deal:', error);
      throw error;
    }
  }
,  

  async getPhoneConditions(dealId: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
  
      const soldPhonesRef = collection(db, 'soldPhones');
      const q = query(
        soldPhonesRef, 
        where('dealId', '==', dealId),
        where('dealerId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const conditions: { [key: string]: string } = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conditions[data.model] = data.condition;
      });
      
      return conditions;
    } catch (error) {
      console.error('Error getting phone conditions:', error);
      throw error;
    }
  },

  async getDealerDeals() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
  
      const q = query(
        collection(db, 'deals'),
        where('dealerId', '==', currentUser.uid),
        orderBy('createdAt', 'asc')
      );
  
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
    } catch (error) {
      console.error('Error getting deals:', error);
      throw error;
    }
  },


  async getDealById(dealId: string): Promise<Deal | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const dealRef = doc(db, 'deals', dealId);
      const dealDoc = await getDoc(dealRef);

      if (!dealDoc.exists()) {
        return null;
      }

      return {
        id: dealDoc.id,
        ...dealDoc.data()
      } as Deal;
    } catch (error) {
      console.error('Error getting deal by ID:', error);
      throw error;
    }
  },

 async subscribeToRecentDeals(onUpdate: (deals: Deal[]) => void) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found');

    const q = query(
      collection(db, 'deals'),
      where('dealerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    return onSnapshot(q, (snapshot) => {
      const deals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
      onUpdate(deals);
    });
  } catch (error) {
    console.error('Error subscribing to recent deals:', error);
    throw error;
  }
}
,
  

async getRecentSales(model: string): Promise<SaleHistory[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found');

    const q = query(
      collection(db, 'soldPhones'),
      where('dealerId', '==', currentUser.uid),
      where('model', '==', model),
      where('dealType', '==', 'wholesale'),
      orderBy('soldAt', 'desc'),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      date: doc.data().soldAt,
      price: doc.data().price,
      model: doc.data().model,
      dealType: doc.data().dealType,
      condition: doc.data().condition
    }));
  } catch (error) {
    console.error('Error getting recent sales:', error);
    throw error;
  }
}
,

  async getMarketInsights(model: string): Promise<MarketInsights> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const q = query(
        collection(db, 'soldPhones'),
        where('dealerId', '==', currentUser.uid),
        where('model', '==', model),
        orderBy('soldAt', 'desc'),
        limit(30)
      );

      const querySnapshot = await getDocs(q);
      const sales = querySnapshot.docs.map(doc => ({
        price: doc.data().price,
        dealType: doc.data().dealType
      }));

      const prices = sales.map(s => s.price);
      const retailPrices = sales.filter(s => s.dealType === 'retail').map(s => s.price);
      const wholesalePrices = sales.filter(s => s.dealType === 'wholesale').map(s => s.price);

      return {
        averagePrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        lowestPrice: prices.length ? Math.min(...prices) : 0,
        highestPrice: prices.length ? Math.max(...prices) : 0,
        totalSold: sales.length,
        retailAverage: retailPrices.length ? retailPrices.reduce((a, b) => a + b, 0) / retailPrices.length : 0,
        wholesaleAverage: wholesalePrices.length ? wholesalePrices.reduce((a, b) => a + b, 0) / wholesalePrices.length : 0
      };
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw error;
    }
  },

  async updateDeal(dealId: string, updateData: Partial<Deal>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        ...updateData,
        updatedAt: new Date()
      });

      return dealId;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  },

  async deleteDeal(dealId: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const dealRef = doc(db, 'deals', dealId);
      await deleteDoc(dealRef);
      return dealId;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  },

  async getDealsByDateRange(startDate: Date, endDate: Date) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const q = query(
        collection(db, 'deals'),
        where('dealerId', '==', currentUser.uid),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
    } catch (error) {
      console.error('Error getting deals by date range:', error);
      throw error;
    }
  }
};
