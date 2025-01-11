import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, DataTable } from 'react-native-paper';

export default function DealerHistory({ dealerId }) {
  const transactions = [
    { id: 1, date: '2025-01-01', amount: 5000, status: 'Paid', dueDate: '2025-02-01' },
    { id: 2, date: '2024-12-15', amount: 3000, status: 'Pending', dueDate: '2025-01-15' },
  ];

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <DataTable>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title style={styles.dateColumn}>
            <Text style={styles.headerText}>Date</Text>
          </DataTable.Title>
          <DataTable.Title style={styles.amountColumn}>
            <Text style={styles.headerText}>Amount</Text>
          </DataTable.Title>
          <DataTable.Title style={styles.statusColumn}>
            <Text style={styles.headerText}>Status</Text>
          </DataTable.Title>
          <DataTable.Title style={styles.dateColumn}>
            <Text style={styles.headerText}>Due Date</Text>
          </DataTable.Title>
        </DataTable.Header>

        {transactions.map((transaction) => (
          <DataTable.Row key={transaction.id}>
            <DataTable.Cell style={styles.dateColumn}>
              <Text style={styles.cellText}>{transaction.date}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.amountColumn}>
              <Text style={styles.cellText}>${transaction.amount}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.statusColumn}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: transaction.status === 'Paid' ? '#E8F5E9' : '#FFF3E0' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: transaction.status === 'Paid' ? '#2E7D32' : '#EF6C00' }
                ]}>
                  {transaction.status}
                </Text>
              </View>
            </DataTable.Cell>
            <DataTable.Cell style={styles.dateColumn}>
              <Text style={styles.cellText}>{transaction.dueDate}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  cellText: {
    fontSize: 15,
    color: '#000000',
  },
  dateColumn: {
    flex: 1.2,
    paddingLeft: 16,
  },
  amountColumn: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusColumn: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
