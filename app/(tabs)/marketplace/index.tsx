// app/(tabs)/marketplace/index.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ActivityIndicator, Searchbar, SegmentedButtons, Chip, Portal, Modal, Text, Button, useTheme } from 'react-native-paper';
import MarketplaceCard from '../../components/MarketplaceCard';
import { inventoryService, InventoryItem } from '../../../services/inventoryService';
import { auth } from '../../../firebaseConfig';

// Define a single MarketplaceItem interface that extends InventoryItem
interface MarketplaceItem extends Omit<InventoryItem, 'id'> {
  id: string;
  dealerName?: string;
}

interface MarketplaceDealer {
  id: string;
  name: string;
  location: string;
  inventoryCount: number;
}

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, options, selected, onSelect }) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterTitle}>{title}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.filterOptions}>
        {options.map((option) => (
          <Chip
            key={option}
            selected={selected === option}
            onPress={() => onSelect(option)}
            style={styles.filterOption}
            selectedColor="#007BFF"
          >
            {option}
          </Chip>
        ))}
      </View>
    </ScrollView>
  </View>
);

export default function MarketplaceScreen() {
  const theme = useTheme();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [dealers, setDealers] = useState<MarketplaceDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('devices');
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    storage: '',
    condition: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const currentUserId = auth.currentUser?.uid;
  const [refreshing, setRefreshing] = useState(false);  // Add this


  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      const marketplaceData = await inventoryService.getPublicInventory();
      // Filter out current user's items and cast to MarketplaceItem[]
      const validItems = marketplaceData.items
        .filter(item => item.id !== undefined && item.dealerId !== currentUserId)
        .map(item => ({
          ...item,
          id: item.id as string
        }));
      
      // Filter out current dealer from dealers list
      const otherDealers = marketplaceData.dealers.filter(dealer => 
        dealer.id !== currentUserId
      );
      
      setItems(validItems);
      setDealers(otherDealers);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarketplaceData();
    setRefreshing(false);
  };

  const filterItems = () => {
    return items.filter(item => {
      const searchLower = filters.search.toLowerCase();
      return (
        ((item.model && item.model.toLowerCase().includes(searchLower)) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower))) &&
        (!filters.brand || item.brand === filters.brand) &&
        (!filters.storage || item.storageGB === parseInt(filters.storage)) &&
        (!filters.condition || item.condition === filters.condition)
      );
    });
  };

  // Rest of your component remains the same...

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search devices or dealers..."
        onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
        value={filters.search}
        style={styles.searchbar}
        iconColor="#007BFF"
        theme={{ colors: { primary: '#007BFF' }}}
      />
      
      <SegmentedButtons
        value={viewMode}
        onValueChange={setViewMode}
        buttons={[
          { value: 'devices', label: 'Devices' },
          { value: 'dealers', label: 'Dealers' },
        ]}
        style={styles.segmentedButtons}
        theme={{ colors: { primary: '#007BFF' }}}
      />

      <Chip 
        onPress={() => setShowFilters(true)} 
        icon="filter-variant"
        style={styles.filterChip}
        selectedColor="#007BFF"
      >
        Filters
      </Chip>

      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Filters</Text>
          <FilterSection 
            title="Brand"
            options={['Apple', 'Samsung', 'OnePlus']}
            selected={filters.brand}
            onSelect={(value) => setFilters(prev => ({ ...prev, brand: value }))}
          />
          <FilterSection 
            title="Storage"
            options={['64', '128', '256', '512']}
            selected={filters.storage}
            onSelect={(value) => setFilters(prev => ({ ...prev, storage: value }))}
          />
          <FilterSection 
            title="Condition"
            options={['New', 'Like New', 'Good', 'Fair']}
            selected={filters.condition}
            onSelect={(value) => setFilters(prev => ({ ...prev, condition: value }))}
          />
          <Button 
            mode="contained" 
            onPress={() => setShowFilters(false)}
            style={styles.applyButton}
            theme={{ colors: { primary: '#007BFF' }}}
          >
            Apply Filters
          </Button>
        </Modal>
      </Portal>

      <FlatList
  data={viewMode === 'devices' ? filterItems() : dealers}
  renderItem={({ item }) => (
    <MarketplaceCard 
      item={item} 
      isDealer={viewMode === 'dealers'}
    />
  )}
  keyExtractor={item => item.id}
  contentContainerStyle={styles.list}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#007BFF"]}
      tintColor="#007BFF"
    />
  }
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 10,
    elevation: 2,
  },
  segmentedButtons: {
    margin: 10,
  },
  filterChip: {
    margin: 10,
  },
  list: {
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007BFF',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    marginRight: 8,
  },
  applyButton: {
    marginTop: 20,
  },
});
