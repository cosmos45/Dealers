import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, DataTable, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function DealsList({ deals }) {
  const router = useRouter();

  if (!deals || deals.length === 0) {
    return (
      <Surface style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No deals found</Text>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <ScrollView>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={styles.dateColumn}>
              <Text style={styles.headerText}>Date</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.nameColumn}>
              <Text style={styles.headerText}>Customer</Text>
            </DataTable.Title>
            <DataTable.Title numeric style={styles.amountColumn}>
              <Text style={styles.headerText}>Amount</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.statusColumn}>
              <Text style={styles.headerText}>Status</Text>
            </DataTable.Title>
          </DataTable.Header>

          {deals.map((deal) => (
            <DataTable.Row 
              key={deal.id}
              onPress={() => router.push(`/deals/${deal.id}`)}
              style={styles.tableRow}
            >
              <DataTable.Cell style={styles.dateColumn}>
                <Text style={styles.cellText}>
                  {new Date(deal.date).toLocaleDateString()}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.nameColumn}>
                <Text style={styles.cellText}>{deal.customerName}</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric style={styles.amountColumn}>
                <Text style={styles.amountText}>${deal.totalAmount.toFixed(2)}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.statusColumn}>
                <Chip
                  mode="flat"
                  style={[
                    styles.statusChip,
                    { backgroundColor: deal.status === 'Paid' ? '#E8F5E9' : '#FFF3E0' }
                  ]}
                >
                  <Text style={[
                    styles.statusText,
                    { color: deal.status === 'Paid' ? '#2E7D32' : '#EF6C00' }
                  ]}>
                    {deal.status}
                  </Text>
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  tableHeader: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cellText: {
    fontSize: 15,
    color: '#000000',
  },
  amountText: {
    fontSize: 15,
    color: '#28a745',
    fontWeight: '600',
  },
  dateColumn: {
    flex: 1,
  },
  nameColumn: {
    flex: 1.5,
  },
  amountColumn: {
    flex: 1,
  },
  statusColumn: {
    flex: 1,
  },
  statusChip: {
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  }
});
