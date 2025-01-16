// components/reports/InsightsCard.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, DataTable } from 'react-native-paper';

interface InsightsProps {
  modelsPerBrand: { [key: string]: number };
  salesDistribution: { wholesale: number; retail: number };
  margins: {
    wholesale: number;
    retail: number;
    combined: number;
  };
}

export default function InsightsCard({ modelsPerBrand, salesDistribution, margins }: InsightsProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>Business Insights</Text>
        
        <Text variant="titleMedium" style={styles.subtitle}>Models per Brand</Text>
        <DataTable>
          {Object.entries(modelsPerBrand).map(([brand, count]) => (
            <DataTable.Row key={brand}>
              <DataTable.Cell>{brand}</DataTable.Cell>
              <DataTable.Cell numeric>{count} models</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        <Text variant="titleMedium" style={styles.subtitle}>Sales Distribution</Text>
        <DataTable>
          <DataTable.Row>
            <DataTable.Cell>Wholesale</DataTable.Cell>
            <DataTable.Cell numeric>{salesDistribution.wholesale.toFixed(1)}%</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Retail</DataTable.Cell>
            <DataTable.Cell numeric>{salesDistribution.retail.toFixed(1)}%</DataTable.Cell>
          </DataTable.Row>
        </DataTable>

        <Text variant="titleMedium" style={styles.subtitle}>Average Margins</Text>
        <DataTable>
          <DataTable.Row>
            <DataTable.Cell>Wholesale</DataTable.Cell>
            <DataTable.Cell numeric>£{margins.wholesale.toFixed(2)}</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Retail</DataTable.Cell>
            <DataTable.Cell numeric>£{margins.retail.toFixed(2)}</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Combined</DataTable.Cell>
            <DataTable.Cell numeric>£{margins.combined.toFixed(2)}</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
});
