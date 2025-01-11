import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Surface, Text, DataTable, Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DealDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Dummy data - replace with actual deal data
  const deal = {
    id: 1,
    date: '2025-01-10',
    customerName: 'John Doe',
    contact: '+1234567890',
    totalAmount: 1999,
    status: 'Paid',
    phones: [
      { model: 'iPhone 13 Pro', quantity: 2, price: 999 }
    ]
  };

  return (
    <Surface style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
        <Appbar.Content title="Deal Details" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="share" onPress={() => {}} color="#007BFF" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{deal.customerName}</Text>
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>{deal.contact}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phones</Text>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title><Text style={styles.headerText}>Model</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>Qty</Text></DataTable.Title>
              <DataTable.Title numeric><Text style={styles.headerText}>Price</Text></DataTable.Title>
            </DataTable.Header>

            {deal.phones.map((phone, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{phone.model}</DataTable.Cell>
                <DataTable.Cell numeric>{phone.quantity}</DataTable.Cell>
                <DataTable.Cell numeric>${phone.price}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Text style={styles.label}>Total Amount</Text>
          <Text style={styles.amount}>${deal.totalAmount}</Text>
          <Text style={styles.label}>Status</Text>
          <Text style={[
            styles.status,
            { color: deal.status === 'Paid' ? '#2E7D32' : '#EF6C00' }
          ]}>
            {deal.status}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Print Receipt
          </Button>
        </View>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  amount: {
    fontSize: 20,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableHeader: {
    backgroundColor: '#F8F9FA',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#007BFF',
  },
  buttonLabel: {
    color: '#FFFFFF',
  },
});
