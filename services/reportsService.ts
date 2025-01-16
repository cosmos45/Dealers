// services/reportsService.ts
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

interface Phone {
  model: string;
  price: number;
  brand: string;
  condition: string;
}

interface SoldPhone {
  model: string;
  price: number;
  dealId: string;
  dealType: 'retail' | 'wholesale';
  dealerId: string;
  dealerName: string;
  condition: string;
  soldAt: string;
  brand: string;
}

interface Deal {
  customerName: string;
  dealType: 'retail' | 'wholesale';
  totalAmount: number;
  status: 'Paid' | 'Pending';
  createdAt: Timestamp;
  phones: Phone[];
}

interface BrandAnalytics {
  [key: string]: {
    count: number;
    revenue: number;
    averagePrice: number;
  };
}

interface TimeRangeStats {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  dealCount: number;
}

interface InventoryItem {
  id: string;
  brand: string;
  model: string;
  condition: string;
  quantity: number;
  price: number;
}

interface InventoryAnalytics {
  totalItems: number;
  byBrand: { [key: string]: number };
  byCondition: { [key: string]: number };
  lowStock: InventoryItem[];
}

const groupInventoryByBrand = (inventory: InventoryItem[]) => {
  return inventory.reduce((acc: {[key: string]: number}, item) => {
    acc[item.brand] = (acc[item.brand] || 0) + item.quantity;
    return acc;
  }, {});
};

const groupInventoryByCondition = (inventory: InventoryItem[]) => {
  return inventory.reduce((acc: {[key: string]: number}, item) => {
    acc[item.condition] = (acc[item.condition] || 0) + item.quantity;
    return acc;
  }, {});
};

export const reportsService = {


  async getDealsWithPriceChanges() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const dealsRef = collection(db, 'deals');
      const q = query(dealsRef, where('dealerId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      
      const dealsWithChanges = snapshot.docs.map(doc => {
        const dealData = doc.data();
        return dealData.phones.map((phone: any) => ({
          phoneId: phone.phoneId,
          originalPrice: phone.originalPrice,
          finalPrice: phone.price,
          priceModified: phone.originalPrice !== phone.price
        }));
      }).flat();

      return dealsWithChanges;
    } catch (error) {
      console.error('Error fetching deals with price changes:', error);
      throw error;
    }
  },

  async getAverageMargins(): Promise<{ wholesale: number; retail: number; combined: number }> {
    try {
      const soldPhones = await this.getSalesData();
      const deals = await this.getDealsWithPriceChanges();
      
      let wholesaleMargins: number[] = [];
      let retailMargins: number[] = [];

      for (const phone of soldPhones) {
        const dealInfo = deals.find(d => d.phoneId === phone.phoneId);
        const margin = dealInfo?.priceModified ? 
          (phone.price - (dealInfo.originalPrice || 0)) : 0;

        if (phone.dealType === 'wholesale') {
          wholesaleMargins.push(margin);
        } else {
          retailMargins.push(margin);
        }
      }

      const avgWholesale = wholesaleMargins.length > 0 ? 
        wholesaleMargins.reduce((a, b) => a + b, 0) / wholesaleMargins.length : 0;
      const avgRetail = retailMargins.length > 0 ? 
        retailMargins.reduce((a, b) => a + b, 0) / retailMargins.length : 0;
      const combined = [...wholesaleMargins, ...retailMargins];
      const avgCombined = combined.length > 0 ? 
        combined.reduce((a, b) => a + b, 0) / combined.length : 0;

      return {
        wholesale: avgWholesale,
        retail: avgRetail,
        combined: avgCombined
      };
    } catch (error) {
      console.error('Error calculating average margins:', error);
      throw error;
    }
  }
,
 // Add this at the beginning of the reportsService object
 async getSalesData(timeRange?: string): Promise<SoldPhone[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found');

    const soldPhonesRef = collection(db, 'soldPhones');
    let q = query(
      soldPhonesRef,
      where('dealerId', '==', currentUser.uid)
    );

    if (timeRange) {
      const startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      q = query(q, where('soldAt', '>=', startDate.toISOString()));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as SoldPhone[];
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
},

  async getSalesDataForDateRange(startDate: Date, endDate: Date) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
  
      const soldPhonesRef = collection(db, 'soldPhones');
      const q = query(
        soldPhonesRef,
        where('dealerId', '==', currentUser.uid),
        where('soldAt', '>=', startDate.toISOString()),
        where('soldAt', '<=', endDate.toISOString())
      );
  
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching sales data for date range:', error);
      throw error;
    }
  }
,  

  async getBrandAnalytics(): Promise<BrandAnalytics> {
    try {
      const soldPhones = await this.getSalesData();
      return soldPhones.reduce((acc: BrandAnalytics, phone) => {
        if (!acc[phone.brand]) {
          acc[phone.brand] = {
            count: 0,
            revenue: 0,
            averagePrice: 0
          };
        }
        
        acc[phone.brand].count += 1;
        acc[phone.brand].revenue += phone.price;
        acc[phone.brand].averagePrice = 
          acc[phone.brand].revenue / acc[phone.brand].count;
        
        return acc;
      }, {});
    } catch (error) {
      console.error('Error calculating brand analytics:', error);
      throw error;
    }
  },
  async getTopSellingModels(limit: number = 5): Promise<Array<{model: string; count: number; revenue: number}>> {
    try {
      const soldPhones = await this.getSalesData();
      const modelStats = soldPhones.reduce((acc, phone) => {
        if (!acc[phone.model]) {
          acc[phone.model] = { count: 0, revenue: 0 };
        }
        acc[phone.model].count += 1;
        acc[phone.model].revenue += phone.price;
        return acc;
      }, {} as { [key: string]: { count: number; revenue: number } });
  
      return Object.entries(modelStats)
        .map(([model, stats]) => ({
          model,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top selling models:', error);
      throw error;
    }
  }
,  

  async getTimeRangeStats(startDate: Date, endDate: Date): Promise<TimeRangeStats> {
    try {
      const soldPhones = await this.getSalesData();
      const filteredSales = soldPhones.filter(phone => {
        const soldDate = new Date(phone.soldAt);
        return soldDate >= startDate && soldDate <= endDate;
      });

      const totalRevenue = filteredSales.reduce((sum, phone) => sum + phone.price, 0);
      const dealIds = new Set(filteredSales.map(phone => phone.dealId));

      return {
        totalSales: filteredSales.length,
        totalRevenue,
        averageOrderValue: totalRevenue / dealIds.size || 0,
        dealCount: dealIds.size
      };
    } catch (error) {
      console.error('Error calculating time range stats:', error);
      throw error;
    }
  },

  async getInventoryAnalytics(): Promise<InventoryAnalytics> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
  
      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef, 
        where('dealerId', '==', currentUser.uid),
        where('status', '==', 'available')
      );
      
      const snapshot = await getDocs(q);
      const inventory = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as InventoryItem[];
  
      // Calculate total quantity first
      const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
      // Calculate brand percentages
      const byBrand = inventory.reduce((acc, item) => {
        const brand = item.brand || 'Unknown';
        acc[brand] = {
          count: (acc[brand]?.count || 0) + (item.quantity || 0),
          percentage: 0
        };
        return acc;
      }, {} as { [key: string]: { count: number; percentage: number } });
  
      // Calculate percentages
      Object.keys(byBrand).forEach(brand => {
        byBrand[brand].percentage = totalQuantity > 0 ? 
          (byBrand[brand].count / totalQuantity) * 100 : 0;
      });
  
      return {
        totalItems: totalQuantity,
        byBrand: byBrand,
        byCondition: groupInventoryByCondition(inventory),
        lowStock: inventory.filter(item => (item.quantity || 0) < 5)
      };
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      throw error;
    }
  }
  
  ,

  async getDealTypeDistribution(timeRange?: string): Promise<{ [key: string]: number }> {
    try {
      const soldPhones = await this.getSalesData(timeRange);
      return soldPhones.reduce((acc: { [key: string]: number }, phone) => {
        acc[phone.dealType] = (acc[phone.dealType] || 0) + 1;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error calculating deal type distribution:', error);
      throw error;
    }
  },
  // services/reportsService.ts
async getModelsPerBrand(): Promise<{ [key: string]: number }> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found');

    const inventoryRef = collection(db, 'inventory');
    const snapshot = await getDocs(query(inventoryRef, where('dealerId', '==', currentUser.uid)));
    
    const modelsCount: { [key: string]: number } = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      modelsCount[data.brand] = (modelsCount[data.brand] || 0) + 1;
    });
    
    return modelsCount;
  } catch (error) {
    console.error('Error getting models per brand:', error);
    throw error;
  }
},

async getSalesDistribution(): Promise<{ wholesale: number; retail: number }> {
  try {
    const soldPhones = await this.getSalesData();
    const dealTypes = soldPhones.map(phone => phone.dealType);
    const total = dealTypes.length;
    const wholesale = dealTypes.filter(type => type === 'wholesale').length;
    
    return {
      wholesale: (wholesale / total) * 100,
      retail: ((total - wholesale) / total) * 100
    };
  } catch (error) {
    console.error('Error calculating sales distribution:', error);
    throw error;
  }
},

async getAverageMargins(): Promise<{ wholesale: number; retail: number; combined: number }> {
  try {
    const soldPhones = await this.getSalesData();
    let wholesaleMargins: number[] = [];
    let retailMargins: number[] = [];

    soldPhones.forEach(phone => {
      const margin = phone.price - phone.cost;
      if (phone.dealType === 'wholesale') {
        wholesaleMargins.push(margin);
      } else {
        retailMargins.push(margin);
      }
    });

    const avgWholesale = wholesaleMargins.reduce((a, b) => a + b, 0) / wholesaleMargins.length;
    const avgRetail = retailMargins.reduce((a, b) => a + b, 0) / retailMargins.length;
    const combined = [...wholesaleMargins, ...retailMargins];
    const avgCombined = combined.reduce((a, b) => a + b, 0) / combined.length;

    return {
      wholesale: avgWholesale,
      retail: avgRetail,
      combined: avgCombined
    };
  } catch (error) {
    console.error('Error calculating average margins:', error);
    throw error;
  }
}
,
async getAverageMargins(): Promise<{ wholesale: number; retail: number; combined: number }> {
  try {
    const soldPhones = await this.getSalesData();
    const deals = await this.getDealsWithPriceChanges(); // New function needed
    
    let wholesaleMargins: number[] = [];
    let retailMargins: number[] = [];

    soldPhones.forEach(phone => {
      const dealInfo = deals.find(d => d.phoneId === phone.phoneId);
      const margin = dealInfo?.priceModified ? 
        (phone.price - dealInfo.originalPrice) : 0;

      if (phone.dealType === 'wholesale') {
        wholesaleMargins.push(margin);
      } else {
        retailMargins.push(margin);
      }
    });

    const avgWholesale = wholesaleMargins.length > 0 ? 
      wholesaleMargins.reduce((a, b) => a + b, 0) / wholesaleMargins.length : 0;
    const avgRetail = retailMargins.length > 0 ? 
      retailMargins.reduce((a, b) => a + b, 0) / retailMargins.length : 0;
    const combined = [...wholesaleMargins, ...retailMargins];
    const avgCombined = combined.length > 0 ? 
      combined.reduce((a, b) => a + b, 0) / combined.length : 0;

    return {
      wholesale: avgWholesale,
      retail: avgRetail,
      combined: avgCombined
    };
  } catch (error) {
    console.error('Error calculating average margins:', error);
    throw error;
  }
}
,

  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly'): Promise<Array<{ date: string; revenue: number }>> {
    try {
      const soldPhones = await this.getSalesData();
      const revenueMap = new Map<string, number>();

      soldPhones.forEach(phone => {
        const date = new Date(phone.soldAt);
        let periodKey: string;

        switch (period) {
          case 'daily':
            periodKey = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const week = Math.floor(date.getDate() / 7);
            periodKey = `${date.getFullYear()}-W${week}`;
            break;
          case 'monthly':
            periodKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            break;
        }

        revenueMap.set(periodKey, (revenueMap.get(periodKey) || 0) + phone.price);
      });

      return Array.from(revenueMap.entries()).map(([date, revenue]) => ({
        date,
        revenue
      }));
    } catch (error) {
      console.error('Error calculating revenue by period:', error);
      throw error;
    }
  }
};
