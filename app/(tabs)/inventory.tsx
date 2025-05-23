import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, Image } from 'react-native';
import {
  Appbar,
  Surface,
  FAB,
  Provider,
  TextInput,
  ActivityIndicator,
  Menu,
  Button,
  Chip,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { inventoryService } from '../../services/inventoryService';
import InventoryCard from '../components/InventoryCard';

export default function InventoryScreen() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [storageMenuVisible, setStorageMenuVisible] = useState(false);
  const [brandMenuVisible, setBrandMenuVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    sort: '',
    storage: '',
    brand: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = inventoryService.subscribeToInventory((items) => {
      setInventory(items);
      setFilteredInventory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true); // Show loading indicator during search
  
    try {
      if (query.length >= 2) {
        console.log('Searching inventory for:', query);
        const results = await inventoryService.searchInventoryPhones(query);
        console.log('Search results:', results);
        setFilteredInventory(results);
      } else {
        setFilteredInventory(inventory); // Reset to full inventory if query is too short
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setLoading(false); // Hide loading indicator after search completes
    }
  };
  

  const handleDelete = async (deviceId) => {
    Alert.alert('Delete Device', 'Are you sure you want to delete this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await inventoryService.deleteDevice(deviceId);
            alert('Device deleted successfully!');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete device');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleSortChange = (sort) => {
    let sorted = [...filteredInventory];
    switch (sort) {
      case 'priceDesc':
        sorted.sort((a, b) => b.basePrice - a.basePrice);
        setActiveFilters((prev) => ({ ...prev, sort: 'Price: High to Low' }));
        break;
      case 'priceAsc':
        sorted.sort((a, b) => a.basePrice - b.basePrice);
        setActiveFilters((prev) => ({ ...prev, sort: 'Price: Low to High' }));
        break;
      case 'latest':
        sorted.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
        setActiveFilters((prev) => ({ ...prev, sort: 'Latest First' }));
        break;
      default:
        break;
    }
    setFilteredInventory(sorted);
    setSortMenuVisible(false);
  };

  const handleStorageFilter = (storage) => {
    if (storage === 0) {
      setFilteredInventory(inventory);
      setActiveFilters((prev) => ({ ...prev, storage: '' }));
    } else {
      const filtered = inventory.filter((item) => item.storageGB === storage);
      setFilteredInventory(filtered);
      setActiveFilters((prev) => ({ ...prev, storage: `${storage}GB` }));
    }
    setStorageMenuVisible(false);
  };

  const handleBrandFilter = (brand) => {
    if (brand === 'All') {
      setFilteredInventory(inventory);
      setActiveFilters((prev) => ({ ...prev, brand: '' }));
    } else {
      const filtered = inventory.filter((item) => item.brand === brand);
      setFilteredInventory(filtered);
      setActiveFilters((prev) => ({ ...prev, brand }));
    }
    setBrandMenuVisible(false);
  };

  const clearFilter = (filterType) => {
    setActiveFilters((prev) => ({ ...prev, [filterType]: '' }));
    setFilteredInventory(inventory);
  };

  const getUniqueBrands = () => {
    const brands = new Set(inventory.map((item) => item.brand));
    return ['All', ...Array.from(brands)];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshedInventory = await inventoryService.refreshInventory();
      setInventory(refreshedInventory);
      setFilteredInventory(refreshedInventory);
    } catch (error) {
      console.error('Error refreshing inventory:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Provider>
      <Surface style={styles.container}>
      <Appbar.Header style={styles.header}>
  <Appbar.Content title="Inventory" titleStyle={styles.headerTitle} />
  <Appbar.Action 
    icon="history" 
    onPress={() => router.push('/screens/soldPhones')} 
    color="#007BFF" 
  />
  <Appbar.Action icon="refresh" onPress={onRefresh} color="#007BFF" />
</Appbar.Header>


        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by Model, Brand, Storage, RAM"
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
            {[
              { label: 'Latest First', value: 'latest' },
              { label: 'Price: High to Low', value: 'priceDesc' },
              { label: 'Price: Low to High', value: 'priceAsc' },
            ].map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => handleSortChange(option.value)}
                title={option.label}
              />
            ))}
          </Menu>

          <Menu
            visible={storageMenuVisible}
            onDismiss={() => setStorageMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setStorageMenuVisible(true)}
                icon="memory"
                style={[styles.filterButton, { borderColor: '#007BFF' }]}
                labelStyle={{ color: '#007BFF' }}
              >
                Storage
              </Button>
            }
          >
            {[
              { label: 'All Storage', value: 0 },
              { label: '32GB', value: 32 },
              { label: '64GB', value: 64 },
              { label: '128GB', value: 128 },
              { label: '256GB', value: 256 },
              { label: '512GB', value: 512 },
            ].map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => handleStorageFilter(option.value)}
                title={option.label}
              />
            ))}
          </Menu>

          <Menu
            visible={brandMenuVisible}
            onDismiss={() => setBrandMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setBrandMenuVisible(true)}
                icon="cellphone"
                style={[styles.filterButton, { borderColor: '#007BFF' }]}
                labelStyle={{ color: '#007BFF' }}
              >
                Brand
              </Button>
            }
          >
            {getUniqueBrands().map((brand) => (
              <Menu.Item key={brand} onPress={() => handleBrandFilter(brand)} title={brand} />
            ))}
          </Menu>
        </View>

        {Object.entries(activeFilters).some(([_, value]) => value !== '') && (
          <View style={styles.activeFilters}>
            {Object.entries(activeFilters).map(([key, value]) =>
              value ? (
                <Chip
                  key={key}
                  onClose={() => clearFilter(key)}
                  style={[styles.filterChip, { backgroundColor: '#007BFF' }]}
                  textStyle={styles.chipText}
                >
                  {value}
                </Chip>
              ) : null
            )}
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
        ) : (
          <ScrollView
            style={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007BFF']}
                tintColor="#007BFF"
              />
            }
          >
            {filteredInventory.map((phone) => (
             <InventoryCard
             key={phone.id}
             item={phone}
             onEdit={() => {
               const phoneDataString = JSON.stringify(phone);
               router.push({
                 pathname: '/screens/AddEditPhoneScreen',
                 params: { 
                   isEdit: true, 
                   phoneData: phoneDataString
                 }
               });
             }}
             onDelete={() => handleDelete(phone.id)}
           />
           
            ))}
          </ScrollView>
        )}

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: '#007BFF' }]}
          onPress={() => router.push('/screens/AddEditPhoneScreen')}
          color="#FFFFFF"
        />
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
    paddingHorizontal: 16, 
    paddingTop: 16 
  },
  searchInput: { 
    backgroundColor: '#FFFFFF', 
    marginBottom: 16 
  },
  filterContainer: { 
    flexDirection: 'row', 
    gap: 8, 
    paddingHorizontal: 16, 
    marginBottom: 16 
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    height: 28,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  listContainer: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
