import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';
import { dealService } from '../../../services/dealService';
import DealDetailsScreen from '../../screens/DealDetailsScreen';

export default function DealDetailsRoute() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    const returnTo = params.returnTo;
    if (returnTo) {
      router.replace(returnTo);
    } else {
      router.replace('/(tabs)/deals');
    }
  };
  

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        if (!id) {
          router.replace('/(tabs)/deals');
          return;
        }
        const dealData = await dealService.getDealById(id);
        if (!dealData) {
          router.replace('/(tabs)/deals');
          return;
        }
        setDeal(dealData);
      } catch (error) {
        console.error('Error fetching deal:', error);
        router.replace('/(tabs)/deals');
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_right',
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <Text style={{ color: '#007BFF', fontSize: 16 }}>Back</Text>
            </Pressable>
          ),
          title: 'Deal Details'
        }}
      />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : !deal ? (
        <View style={styles.errorContainer}>
          <Text>Failed to load deal details.</Text>
        </View>
      ) : (
        <DealDetailsScreen id={id} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
