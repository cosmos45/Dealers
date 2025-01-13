import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, DataTable, Appbar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { dealService } from '../../../services/dealService';

interface SoldPhone {
  id: string;
  model: string;
  condition: string;
  price: number;
  dealId: string;
  dealerName: string;
  dealerId: string;
  soldAt: string;
}

export default function SoldPhonesScreen() {
  const [soldPhones, setSoldPhones] = useState<SoldPhone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSoldPhones = async () => {
      try {
        const q = query(
          collection(db, 'soldPhones'),
          where('dealerId', '==', auth.currentUser?.uid),
        //   orderBy('soldAt', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const phones = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SoldPhone[];

        setSoldPhones(phones);
      } catch (error) {
        console.error('Error fetching sold phones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSoldPhones();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
        <Appbar.Content title="Sold Phones History" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Model</DataTable.Title>
            <DataTable.Title>Condition</DataTable.Title>
            <DataTable.Title numeric>Price</DataTable.Title>
            <DataTable.Title>Date</DataTable.Title>
          </DataTable.Header>

          {soldPhones.map((phone) => (
            <DataTable.Row key={phone.id}>
              <DataTable.Cell>{phone.model}</DataTable.Cell>
              <DataTable.Cell>{phone.condition}</DataTable.Cell>
              <DataTable.Cell numeric>${phone.price}</DataTable.Cell>
              <DataTable.Cell>
                {new Date(phone.soldAt).toLocaleDateString()}
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        {soldPhones.length === 0 && (
          <Surface style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sold phones found</Text>
          </Surface>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
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
    borderRadius: 8,
    marginTop: 16
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6C757D'
  }
});
