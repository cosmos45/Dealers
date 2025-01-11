import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import { Deal } from '../../services/dealService';

interface DealSummaryProps {
  deals: Deal[];
}

export default function DealSummaryCard({ deals }: DealSummaryProps) {
  const calculateTotalSales = () => {
    return deals.reduce((sum, deal) => sum + deal.totalAmount, 0);
  };

  const calculatePendingAmount = () => {
    return deals
      .filter(deal => deal.status === 'Pending')
      .reduce((sum, deal) => sum + deal.totalAmount, 0);
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Summary</Text>
        <Text style={styles.period}>Today</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${calculateTotalSales().toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{deals.length}</Text>
          <Text style={styles.statLabel}>Deals</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>${calculatePendingAmount().toFixed(2)}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  period: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  }
});
