import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Appbar, Surface, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { dealService } from '../../../services/dealService';
import DealDetailsScreen from '../../screens/DealDetailsScreen';

interface RouteParams {
  id: string;
}

export default function DealDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<RouteParams>();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const dealData = await dealService.getDealById(id);
        setDeal(dealData);
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }} 
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      </>
    );
  }

  if (!deal) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }} 
        />
        <View style={styles.errorContainer}>
          <Text>Failed to load deal details.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }} 
      />
      <DealDetailsScreen id={id} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  content: { 
    padding: 16 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
