import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Surface, Text, Card, Appbar, ActivityIndicator, TextInput, Menu, Button, Chip, Provider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { inventoryService } from '../../../services/inventoryService';

interface SoldPhone {
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

export default function SoldPhonesScreen() {
  const [soldPhones, setSoldPhones] = useState<SoldPhone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<SoldPhone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSoldPhones();
  }, []);

  const fetchSoldPhones = async () => {
    try {
      const phones = await inventoryService.getSoldDevicesWithDetails();
      setSoldPhones(phones);
      setFilteredPhones(phones);
    } catch (error) {
      console.error('Error fetching sold phones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPhones(soldPhones);
      return;
    }
    
    const searchLower = query.toLowerCase();
    const filtered = soldPhones.filter(phone => {
      const modelMatch = phone.model?.toLowerCase().includes(searchLower) || false;
      const brandMatch = phone.brand?.toLowerCase().includes(searchLower) || false;
      const dealerMatch = phone.dealerName?.toLowerCase().includes(searchLower) || false;
      return modelMatch || brandMatch || dealerMatch;
    });
    setFilteredPhones(filtered);
  };

  const handleSort = (sortType: string) => {
    setSortMenuVisible(false);
    if (!filteredPhones.length) return;

    const sorted = [...filteredPhones].sort((a, b) => {
      try {
        switch (sortType) {
          case 'dateDesc':
            return new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime();
          case 'dateAsc':
            return new Date(a.soldAt).getTime() - new Date(b.soldAt).getTime();
          case 'priceDesc':
            return (b.price || 0) - (a.price || 0);
          case 'priceAsc':
            return (a.price || 0) - (b.price || 0);
          default:
            return 0;
        }
      } catch {
        return 0;
      }
    });
    
    setFilteredPhones(sorted);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSoldPhones();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <Provider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      </Provider>
    );
  }

  return (
    <Provider>
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
          <Appbar.Content title="Sold Phones History" titleStyle={styles.headerTitle} />
          <Appbar.Action icon="refresh" onPress={onRefresh} color="#007BFF" />
        </Appbar.Header>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by Model, Brand, or Dealer"
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" color="#007BFF" />}
            mode="outlined"
            outlineColor="#007BFF"
            activeOutlineColor="#007BFF"
          />
        </View>

        <View style={styles.filterContainer}>
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                style={[styles.filterButton, { borderColor: '#007BFF' }]}
                labelStyle={{ color: '#007BFF' }}
              >
                Sort
              </Button>
            }
          >
            <Menu.Item onPress={() => handleSort('dateDesc')} title="Latest First" />
            <Menu.Item onPress={() => handleSort('dateAsc')} title="Oldest First" />
            <Menu.Item onPress={() => handleSort('priceDesc')} title="Price: High to Low" />
            <Menu.Item onPress={() => handleSort('priceAsc')} title="Price: Low to High" />
          </Menu>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007BFF']}
              tintColor="#007BFF"
            />
          }
        >
          {filteredPhones.map((phone) => (
            <Card key={phone.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.brandModelContainer}>
                    <Text style={styles.brandText}>{phone.brand}</Text>
                    <Text style={styles.modelText}>{phone.model}</Text>
                  </View>
                  <Chip 
                    style={styles.dealTypeChip} 
                    textStyle={styles.dealTypeText}
                  >
                    {phone.dealType}
                  </Chip>
                </View>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.labelText}>Condition:</Text>
                    <Text style={styles.valueText}>{phone.condition}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.labelText}>Price:</Text>
                    <Text style={styles.priceText}>${phone.price}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.labelText}>Sold to:</Text>
                    <Text style={styles.valueText}>{phone.dealerName}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.labelText}>Date:</Text>
                    <Text style={styles.valueText}>
                      {new Date(phone.soldAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredPhones.length === 0 && (
            <Surface style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No sold phones found</Text>
            </Surface>
          )}
        </ScrollView>
      </Surface>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  searchContainer: {
    padding: 16
  },
  searchInput: {
    backgroundColor: '#FFFFFF'
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  filterButton: {
    borderColor: '#007BFF'
  },
  content: {
    flex: 1,
    padding: 16
  },
  card: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  brandModelContainer: {
    flex: 1
  },
  brandText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2
  },
  modelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  dealTypeChip: {
    backgroundColor: '#007BFF',
    borderRadius: 16
  },
  dealTypeText: {
    color: '#FFFFFF',
    fontSize: 12
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  labelText: {
    fontSize: 14,
    color: '#666666'
  },
  valueText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500'
  },
  priceText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6C757D'
  }
});
