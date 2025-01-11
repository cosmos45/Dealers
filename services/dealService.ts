import { collection, addDoc, query, getDocs, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

interface DealPhone {
  model: string;
  quantity: number;
  price: number;
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

export const dealService = {
  async addDeal(dealData: Omit<Deal, 'id' | 'date' | 'dealerId' | 'createdAt' | 'updatedAt'>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Add timestamps and dealer ID
      const deal = {
        ...dealData,
        date: new Date().toISOString(),
        dealerId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Remove undefined values
      Object.keys(deal).forEach(key => 
        deal[key] === undefined && delete deal[key]
      );

      const docRef = await addDoc(collection(db, 'deals'), deal);
      console.log('Deal saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding deal:', error);
      throw error;
    }
  },

  async getDealerDeals() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
  
      const q = query(
        collection(db, 'deals'),
        where('dealerId', '==', currentUser.uid),
        orderBy('createdAt', 'asc') // Changed to ascending to match index
      );
  
      const querySnapshot = await getDocs(q);
      const deals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
  
      // If you still want descending order, sort after fetching
      return deals.reverse();
    } catch (error) {
      console.error('Error getting deals:', error);
      throw error;
    }
  }
  ,

  async updateDeal(dealId: string, updateData: Partial<Deal>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

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
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

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
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const q = query(
        collection(db, 'deals'),
        where('dealerId', '==', currentUser.uid),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
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
