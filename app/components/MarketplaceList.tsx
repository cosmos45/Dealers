// app/components/MarketplaceList.tsx
import React from 'react';
import { FlatList } from 'react-native';
import MarketplaceCard from './MarketplaceCard';

interface MarketplaceListProps {
  items: any[];
}

export default function MarketplaceList({ items }: MarketplaceListProps) {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <MarketplaceCard item={item} />}
      keyExtractor={item => item.id}
    />
  );
}
