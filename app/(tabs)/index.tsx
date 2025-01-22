import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { Surface, Text, Card, Button, Avatar, useTheme, Provider as PaperProvider, ActivityIndicator, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import  { auth, db } from '../../firebaseConfig';
import { inventoryService } from '../../services/inventoryService';
import { dealService } from '../../services/dealService';
import { initializeApp } from 'firebase/app';


export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryStats, setInventoryStats] = useState({
    totalStock: 0,
    soldDevices: 0,
    lowStock: 0
  });
  const [recentDeals, setRecentDeals] = useState([]);
  const [dealStats, setDealStats] = useState({
    totalDeals: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });

  const loadData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user found');

      const inventory = await inventoryService.refreshInventory();
      const soldDevices = await inventoryService.getSoldDevices();

      setInventoryStats({
        totalStock: inventory.length,
        soldDevices: soldDevices.length,
        lowStock: inventory.filter(item => item.quantity <= 5).length
      });

      const deals = await dealService.getDealerDeals();
      setDealStats({
        totalDeals: deals.length,
        totalRevenue: deals.reduce((sum, deal) => sum + deal.totalAmount, 0),
        pendingPayments: deals.filter(deal => deal.status === 'Pending').length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const subscribeToRecentDeals = useCallback(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'deals'),
      where('dealerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentDeals(deals);
    }, (error) => {
      console.error('Error subscribing to recent deals:', error);
    });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData();
        const unsubscribeDeals = subscribeToRecentDeals();
        return () => {
          if (unsubscribeDeals) unsubscribeDeals();
        };
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [loadData, subscribeToRecentDeals, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, [loadData]);

  const renderDealItem = ({ item }) => (
    <Card 
      style={styles.dealItem} 
      onPress={() => router.push({
        pathname: '/(home-routes)/deal/[id]',
        params: { id: item.id }
      })}
    >
      <Card.Content>
        <View style={styles.dealHeader}>
          <Text style={styles.dealModel}>{item.customerName}</Text>
          <Text style={[styles.dealStatus, { color: item.status === 'Paid' ? '#28a745' : '#dc3545' }]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.dealAmount}>₹{item.totalAmount}</Text>
        <Text style={styles.dealInfo}>
          {`${item.phones.length} devices • ${new Date(item.createdAt.toDate()).toLocaleDateString()}`}
        </Text>
      </Card.Content>
    </Card>
  );
  
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <Surface style={styles.header}>
          <Text style={styles.logo}>Dealers</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
  <Avatar.Icon 
    size={40} 
    icon="account-circle"
    style={styles.profileIcon}
  />
</TouchableOpacity>

        </Surface>

        <FlatList
          data={recentDeals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Inventory Overview</Text>
                    <Button 
                      mode="text" 
                      onPress={() => router.push('/inventory')}
                      textColor="#007BFF"
                    >
                      View
                    </Button>
                  </View>
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="phone" size={24} color="#007BFF" />
                      <Text style={styles.statNumber}>{inventoryStats.totalStock}</Text>
                      <Text style={styles.statLabel}>Total Stock</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="sale" size={24} color="#28a745" />
                      <Text style={styles.statNumber}>{inventoryStats.soldDevices}</Text>
                      <Text style={styles.statLabel}>Sold Devices</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="alert" size={24} color="#dc3545" />
                      <Text style={styles.statNumber}>{inventoryStats.lowStock}</Text>
                      <Text style={styles.statLabel}>Low Stock</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Sales Summary</Text>
                    <Button 
                      mode="text" 
                      onPress={() => router.push('/deals')}
                      textColor="#007BFF"
                    >
                      View
                    </Button>
                  </View>
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="shopping" size={24} color="#007BFF" />
                      <Text style={styles.statNumber}>{dealStats.totalDeals}</Text>
                      <Text style={styles.statLabel}>Total Deals</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="currency-inr" size={24} color="#28a745" />
                      <Text style={styles.statNumber}>₹{dealStats.totalRevenue}</Text>
                      <Text style={styles.statLabel}>Revenue</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="clock-outline" size={24} color="#dc3545" />
                      <Text style={styles.statNumber}>{dealStats.pendingPayments}</Text>
                      <Text style={styles.statLabel}>Pending</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recent Deals</Text>
                <Button 
                  mode="text" 
                  onPress={() => router.push('/(tabs)/deals')}
                  textColor="#007BFF"
                >
                  View All
                </Button>
              </View>
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        <View style={styles.fabContainer}>
          <FAB
            icon="phone-plus"
            onPress={() => router.push('/screens/AddEditPhoneScreen')}
            style={[styles.fab, { backgroundColor: '#007BFF' }]}
            color="#FFFFFF"
          />
          <FAB
            icon="cash-register"
            onPress={() => router.push('/(tabs)/deals/add')}
            style={[styles.fab, { backgroundColor: '#28a745' }]}
            color="#FFFFFF"
          />
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    backgroundColor: '#007BFF',
  },
  card: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  dealItem: {
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealModel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dealStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealAmount: {
    color: '#28a745',
    fontSize: 14,
    marginVertical: 4,
  },
  dealInfo: {
    color: '#666',
    fontSize: 12,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
  },
  fab: {
    margin: 8,
  },
});
