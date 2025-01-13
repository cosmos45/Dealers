import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, DataTable, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function DealsList({ deals }) {
  const router = useRouter();
  const [page, setPage] = useState(0); // Current page
  const itemsPerPage = 10; // Number of deals per page

  // Paginate deals
  const paginatedDeals = deals.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  if (!deals || deals.length === 0) {
    return (
      <Surface style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No deals found</Text>
      </Surface>
    );
  }

  return (
    <Surface style={styles.card}>
      <DataTable>
        {/* Table Header */}
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title style={styles.dateColumn}>
            <Text style={styles.headerText}>Date</Text>
          </DataTable.Title>
          <DataTable.Title style={styles.customerColumn}>
            <Text style={styles.headerText}>Customer</Text>
          </DataTable.Title>
          <DataTable.Title numeric style={styles.amountColumn}>
            <Text style={styles.headerText}>Amount</Text>
          </DataTable.Title>
          <DataTable.Title style={styles.statusColumn}>
            <Text style={styles.headerText}>Status</Text>
          </DataTable.Title>
        </DataTable.Header>

        {/* Table Rows */}
        {paginatedDeals.map((deal, index) => (
          <DataTable.Row
          key={deal.id}
          onPress={() => router.push(`/(tabs)/deals/${deal.id}`)}
          style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
        >
            <DataTable.Cell style={styles.dateColumn}>
              <Text style={styles.cellText}>
                {new Date(deal.date).toLocaleDateString()}
              </Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.customerColumn}>
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
                  { backgroundColor: deal.status === 'Paid' ? '#E8F5E9' : '#FFF3E0' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: deal.status === 'Paid' ? '#2E7D32' : '#EF6C00' },
                  ]}
                >
                  {deal.status}
                </Text>
              </Chip>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      {/* Pagination */}
      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(deals.length / itemsPerPage)}
        onPageChange={(newPage) => setPage(newPage)}
        label={`${page * itemsPerPage + 1}-${Math.min(
          (page + 1) * itemsPerPage,
          deals.length
        )} of ${deals.length}`}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    marginVertical: 8,
    overflow: 'hidden', // Ensures content stays within the card
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
    height: 43, // Reduced header height
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    height: 50, // Reduced row height for more rows per page
    alignItems: 'center',
  },
  rowEven: {
    backgroundColor: '#FFFFFF', // White for even rows
  },
  rowOdd: {
    backgroundColor: '#F8F9FA', // Light gray for odd rows
  },
  cellText: {
    fontSize: 14,
    color: '#000000',
  },
  amountText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  statusText:{
    fontSize: 9,

  },
  dateColumn: {
    flex: 5, // Adjust column width
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  customerColumn: {
    flex: 6, // Adjust column width
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  amountColumn: {
    flex: 4, // Adjust column width to shift left slightly
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
  },
  statusColumn: {
    flex: 5, // Adjust column width to shift left slightly
    justifyContent: 'flex-start',
    paddingHorizontal: 1,
    
   
  },
});
