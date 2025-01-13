import React, { useState, useEffect } from 'react';
import { View, ScrollView, Linking } from 'react-native';
import { Appbar, Surface, Text, ActivityIndicator, Card, Chip, DataTable, Button, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { dealService } from '../../services/dealService';
import { StyleSheet } from 'react-native';
import { format } from 'date-fns';

interface Phone {
  model: string;
  price: number;
  quantity: number;
  phoneId?: string;
}

interface PhoneConditions {
  [key: string]: string;
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
  date?: string;
}

interface DealDetailsProps {
  id: string;
}

const THEME_COLOR = '#007BFF';
const SUCCESS_COLOR = '#28a745';

export default function DealDetailsScreen({ id }: DealDetailsProps) {
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [phoneConditions, setPhoneConditions] = useState<PhoneConditions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const [dealData, conditions] = await Promise.all([
          dealService.getDealById(id),
          dealService.getPhoneConditions(id)
        ]);
        setDeal(dealData);
        setPhoneConditions(conditions);
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealData();
  }, [id]);

  const formatDate = (date: string | Date | { seconds: number; nanoseconds: number }) => {
    try {
      if (!date) return 'No date available';
      
      if (typeof date === 'object' && 'seconds' in date) {
        return format(new Date(date.seconds * 1000), 'PPp');
      }
      
      if (typeof date === 'string' && date.includes('T')) {
        return format(new Date(date), 'PPp');
      }
      
      if (typeof date === 'string' && date.includes('UTC')) {
        const parsedDate = new Date(date.replace(' UTC', ''));
        return format(parsedDate, 'PPp');
      }
      
      return format(new Date(date), 'PPp');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleCallPress = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  if (loading) {
    return (
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color={THEME_COLOR} />
          <Appbar.Content title="Deal Details" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      </Surface>
    );
  }

  if (!deal) {
    return (
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color={THEME_COLOR} />
          <Appbar.Content title="Deal Details" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text>Deal not found</Text>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={THEME_COLOR} />
        <Appbar.Content title="Deal Details" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Title 
            title={deal.dealType === 'retail' ? 'Retail Sale' : 'Wholesale Deal'} 
            titleStyle={styles.cardTitle}
            subtitle={deal.date ? formatDate(deal.date) : formatDate(deal.createdAt)}
            subtitleStyle={styles.cardSubtitle}
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
              <Text 
                style={[styles.value, styles.phoneLink]}
                onPress={() => handleCallPress(deal.contact)}
              >
                {deal.contact}
              </Text>
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
                style={[styles.chip, { backgroundColor: deal.status === 'Paid' ? '#e8f5e9' : '#fff3e0' }]}
              >
                {deal.status}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.phonesCard]}>
          <Card.Title title="Phones" titleStyle={styles.cardTitle} />
          <Card.Content>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>Model</DataTable.Title>
                <DataTable.Title numeric>Price</DataTable.Title>
                <DataTable.Title>Condition</DataTable.Title>
              </DataTable.Header>

              {deal.phones.map((phone, index) => (
                <DataTable.Row 
                  key={index} 
                  style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                >
                  <DataTable.Cell>{phone.model}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.priceCell}>
                    ${phone.price}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    {phoneConditions[phone.model] || 'Condition not found'}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>${deal.totalAmount.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        {deal.paymentMode === 'credit' && (
          <Card style={styles.card}>
            <Card.Title title="Credit Details" titleStyle={styles.cardTitle} />
            <Card.Content>
              <View style={styles.row}>
                <Text style={styles.label}>Credit Term:</Text>
                <Text style={styles.value}>{deal.creditTerm} months</Text>
              </View>
            </Card.Content>
          </Card>
        )}

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
    backgroundColor: '#f8f9fa'
  },
  header: {
    backgroundColor: '#fff',
    elevation: 2
  },
  headerTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600'
  },
  content: {
    padding: 16
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },
  cardTitle: {
    color: '#212529',
    fontSize: 18,
    fontWeight: '600'
  },
  cardSubtitle: {
    color: '#666'
  },
  phonesCard: {
    marginTop: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
    fontWeight: '500'
  },
  value: {
    flex: 2,
    fontSize: 16,
    color: '#212529',
    textAlign: 'right'
  },
  phoneLink: {
    color: THEME_COLOR,
    textDecorationLine: 'underline'
  },
  chip: {
    height: 32,
    borderRadius: 16
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#dee2e6'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: '#dee2e6'
  },
  tableRow: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  rowEven: {
    backgroundColor: '#ffffff'
  },
  rowOdd: {
    backgroundColor: '#f8f9fa'
  },
  priceCell: {
    color: THEME_COLOR
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057'
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SUCCESS_COLOR
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 32
  },
  editButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: 8
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
