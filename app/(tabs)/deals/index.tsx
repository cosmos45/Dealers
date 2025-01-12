import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Surface, FAB, Provider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../../firebaseConfig';
import { dealService } from '../../../services/dealService';
import DealsList from '../../components/DealsList';
import DealFilters from '../../components/DealFilters';
import DealSummaryCard from '../../components/DealSummaryCard';

export default function DealsScreen() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const fetchedDeals = await dealService.getDealerDeals();
      setDeals(fetchedDeals);
      setFilteredDeals(fetchedDeals);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/(auth)/login');
      } else {
        loadDeals();
      }
    });

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      if (user) {
        loadDeals();
      }
      return () => {};
    }, [])
  );

  const handleFilterChange = (filters) => {
    let filtered = [...deals];

    // Filter by search query
    if (filters.search) {
      filtered = filtered.filter(deal => 
        deal.customerName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(deal => deal.status === filters.status);
    }

    // Filter by date
    if (filters.date && filters.date !== 'All Time') {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));
      
      switch (filters.date) {
        case 'Today':
          filtered = filtered.filter(deal => {
            const dealDate = new Date(deal.createdAt.toDate());
            return dealDate >= todayStart && dealDate <= todayEnd;
          });
          break;
        case 'This Week':
          const weekStart = new Date(todayStart);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          filtered = filtered.filter(deal => {
            const dealDate = new Date(deal.createdAt.toDate());
            return dealDate >= weekStart;
          });
          break;
        case 'This Month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter(deal => {
            const dealDate = new Date(deal.createdAt.toDate());
            return dealDate >= monthStart;
          });
          break;
        case 'Last Month':
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          filtered = filtered.filter(deal => {
            const dealDate = new Date(deal.createdAt.toDate());
            return dealDate >= lastMonthStart && dealDate <= lastMonthEnd;
          });
          break;
      }
    }

    setFilteredDeals(filtered);
  };

  return (
    <Provider>
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="Deals" titleStyle={styles.headerTitle} />
          <Appbar.Action 
            icon="refresh" 
            color="#007BFF"
            onPress={loadDeals}
            disabled={loading}
          />
        </Appbar.Header>

        <View style={styles.content}>
          <DealSummaryCard deals={filteredDeals} />
          <DealFilters onFilterChange={handleFilterChange} />
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#007BFF" />
            </View>
          ) : (
            <DealsList deals={filteredDeals} />
          )}
        </View>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/deals/add')}
          color="#FFFFFF"
          disabled={loading}
        />
      </Surface>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007BFF',
  }
});
