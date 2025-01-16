// components/reports/StatsCard.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="headlineMedium" style={styles.value}>
          {value}
        </Text>
        {subtitle && <Text variant="bodySmall">{subtitle}</Text>}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
  },
  value: {
    marginVertical: 8,
    color: '#007BFF',
  },
});
