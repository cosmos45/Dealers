// app/components/MarketplaceFilters.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';

interface MarketplaceFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

export default function MarketplaceFilters({ filters, onFilterChange }: MarketplaceFiltersProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', padding: 10, gap: 8 }}>
        <Chip 
          selected={!!filters.brand}
          onPress={() => onFilterChange({ ...filters, brand: filters.brand ? '' : 'Apple' })}
          selectedColor="#007BFF"
        >
          Brand
        </Chip>
        <Chip
          selected={!!filters.storage}
          onPress={() => onFilterChange({ ...filters, storage: filters.storage ? '' : '128' })}
          selectedColor="#007BFF"
        >
          Storage
        </Chip>
      </View>
    </ScrollView>
  );
}
