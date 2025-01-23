// app/components/MarketplaceCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DealerData {
  id: string;
  name: string;
  location: string;
  inventoryCount: number;
}

interface DeviceData {
  id: string;
  brand: string;
  model: string;
  storageGB: number;
  ramGB?: number;
  condition: string;
  basePrice: number;
  dealerId: string;
}

type ItemProps = {
  item: DeviceData | DealerData;
  isDealer: boolean;
};

export default function MarketplaceCard({ item, isDealer }: ItemProps) {
  const theme = useTheme();

  if (isDealer && 'name' in item) {
    return (
      <Link href={`/marketplace/dealer/${item.id}`} asChild>
        <Card style={[styles.card, { borderColor: theme.colors.primary }]}>
          <Card.Content style={styles.content}>
            <Avatar.Text 
              size={50} 
              label={item.name.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: '#007BFF' }}
            />
            <View style={styles.details}>
              <Text style={[styles.name, { color: '#007BFF' }]}>{item.name}</Text>
              <Text style={styles.location}>{item.location}</Text>
              <Text style={[styles.inventory, { color: '#007BFF' }]}>
                {item.inventoryCount} devices available
              </Text>
            </View>
          </Card.Content>
        </Card>
      </Link>
    );
  }

  const device = item as DeviceData;
  return (
    <Link href={`/marketplace/${device.id}`} asChild>
      <Card style={[styles.card, { borderColor: theme.colors.primary }]}>
        <Card.Content>
          <Text style={[styles.name, { color: '#007BFF' }]}>
            {device.brand} {device.model}
          </Text>
          <Text style={styles.price}>₹{device.basePrice}</Text>
          <View style={styles.specs}>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="memory" size={16} color="#666" />
              <Text style={styles.specText}>
                {device.ramGB ? `${device.ramGB}GB RAM` : 'RAM N/A'}
              </Text>
            </View>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="harddisk" size={16} color="#666" />
              <Text style={styles.specText}>{device.storageGB}GB Storage</Text>
            </View>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="cellphone-check" size={16} color="#666" />
              <Text style={styles.specText}>{device.condition}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: 'green',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  inventory: {
    fontSize: 14,
    marginTop: 4,
  },
  specs: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 14,
    color: '#666',
  },
});
