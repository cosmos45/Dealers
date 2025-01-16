// components/reports/TopModelsCard.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, DataTable } from 'react-native-paper';

interface TopModel {
  model: string;
  count: number;
  revenue: number;
}

interface TopModelsCardProps {
  models: TopModel[];
}

export default function TopModelsCard({ models }: TopModelsCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>Top 5 Selling Models</Text>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Model</DataTable.Title>
            <DataTable.Title numeric>Units Sold</DataTable.Title>
            <DataTable.Title numeric>Revenue</DataTable.Title>
          </DataTable.Header>

          {models.map((model, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{model.model}</DataTable.Cell>
              <DataTable.Cell numeric>{model.count}</DataTable.Cell>
              <DataTable.Cell numeric>£{model.revenue.toFixed(2)}</DataTable.Cell>
            </DataTable.Row>
          ))}
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
});
