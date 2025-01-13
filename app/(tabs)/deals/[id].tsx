import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Surface, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { dealService } from '../../../services/dealService';

export default function DealDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // Correct TypeScript syntax
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        const fetchedDeals = await dealService.getDealerDeals(); // Fetch all deals
        const selectedDeal = fetchedDeals.find((d) => d.id === id); // Find by ID
        setDeal(selectedDeal);
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDeal();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!deal) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load deal details.</Text>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Deal Details" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text>Customer Name: {deal.customerName}</Text>
        <Text>Contact Number: {deal.contact}</Text>
        <Text>Total Amount: ${deal.totalAmount.toFixed(2)}</Text>
        <Text>Status: {deal.status}</Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
});
