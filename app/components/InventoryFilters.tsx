import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Provider } from 'react-native-paper';

interface FilterProps {
  onSortChange: (sort: string) => void;
  onStorageFilter: (storage: number) => void;
  onBrandFilter: (brand: string) => void;
}

export default function InventoryFilters({ onSortChange, onStorageFilter, onBrandFilter }: FilterProps) {
  const [sortMenuVisible, setSortMenuVisible] = React.useState(false);
  const [storageMenuVisible, setStorageMenuVisible] = React.useState(false);
  const [brandMenuVisible, setBrandMenuVisible] = React.useState(false);

  const sortOptions = [
    { label: 'Latest First', value: 'latest' },
    { label: 'Price: High to Low', value: 'priceDesc' },
    { label: 'Price: Low to High', value: 'priceAsc' }
  ];

  const storageOptions = [
    { label: 'All Storage', value: 0 },
    { label: '128GB', value: 128 },
    { label: '256GB', value: 256 },
    { label: '512GB', value: 512 }
  ];

  return (
    <View style={styles.container}>
      <Menu
        visible={sortMenuVisible}
        onDismiss={() => setSortMenuVisible(false)}
        anchor={
          <Button 
            mode="outlined" 
            onPress={() => setSortMenuVisible(true)}
            icon="sort"
            style={styles.filterButton}
          >
            Sort
          </Button>
        }
      >
        {sortOptions.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onSortChange(option.value);
              setSortMenuVisible(false);
            }}
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
            style={styles.filterButton}
          >
            Storage
          </Button>
        }
      >
        {storageOptions.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onStorageFilter(option.value);
              setStorageMenuVisible(false);
            }}
            title={option.label}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    borderColor: '#007BFF',
  }
});
