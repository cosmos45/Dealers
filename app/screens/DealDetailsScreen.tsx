import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Appbar, Surface, Text, ActivityIndicator, Card, Chip, DataTable, Button, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { dealService } from '../../services/dealService';
import { StyleSheet } from 'react-native';
import { format } from 'date-fns';

interface Phone {
  model: string;
  price: number;
  quantity: number;
  phoneId?: string;
  condition?: string;
}

interface Deal {
  id?: string;
  customerName: string;
  contact: string;
  totalAmount: number;
  status: 'Paid' | 'Pending';
  phones: Phone[];
  paymentMode: 'cash' | 'online' | 'credit';
  creditTerm?: number;
  dealerId: string;
  dealType: 'retail' | 'wholesale';
  createdAt?: Date;
  updatedAt?: Date;
}

export default function DealDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
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

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'PPp');
  };

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
        <Text>Deal not found</Text>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
        <Appbar.Content title="Deal Details" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Title 
            title={deal.dealType === 'retail' ? 'Retail Sale' : 'Wholesale Deal'} 
            subtitle={formatDate(deal.createdAt || new Date())}
          />
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.label}>
                {deal.dealType === 'wholesale' ? 'Dealer Name:' : 'Customer Name:'}
              </Text>
              <Text style={styles.value}>{deal.customerName}</Text>
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.row}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{deal.contact}</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Payment Mode:</Text>
              <Chip mode="outlined" style={styles.chip}>
                {deal.paymentMode.toUpperCase()}
              </Chip>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Chip 
                mode="outlined" 
                style={[styles.chip, { backgroundColor: deal.status === 'Paid' ? '#e8f5e9' : '#ffebee' }]}
              >
                {deal.status}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.phonesCard]}>
          <Card.Title title="Phones" />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Model</DataTable.Title>
                <DataTable.Title numeric>Price</DataTable.Title>
                <DataTable.Title numeric>Qty</DataTable.Title>
                <DataTable.Title>Condition</DataTable.Title>
              </DataTable.Header>

              {deal.phones.map((phone, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{phone.model}</DataTable.Cell>
                  <DataTable.Cell numeric>${phone.price}</DataTable.Cell>
                  <DataTable.Cell numeric>{phone.quantity}</DataTable.Cell>
                  <DataTable.Cell>{phone.condition || 'N/A'}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>${deal.totalAmount.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        {deal.status === 'Pending' && (
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              onPress={() => router.push(`/deals/${id}/edit`)}
              style={styles.editButton}
            >
              Edit Deal
            </Button>
          </View>
        )}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    elevation: 4
  },
  headerTitle: {
    color: '#000'
  },
  content: {
    padding: 16
  },
  card: {
    marginBottom: 16,
    elevation: 2
  },
  phonesCard: {
    marginTop: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#666'
  },
  value: {
    flex: 2,
    fontSize: 16,
    color: '#000',
    textAlign: 'right'
  },
  chip: {
    height: 28
  },
  divider: {
    marginVertical: 8
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF'
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 32
  },
  editButton: {
    backgroundColor: '#007BFF'
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
