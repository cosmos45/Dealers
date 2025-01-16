// components/reports/BrandDistributionPie.tsx
import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { VictoryPie, VictoryLabel } from 'victory-native';

interface BrandDistributionProps {
  data: {
    [key: string]: {
      count: number;
      revenue: number;
      averagePrice: number;
    };
  };
  showInventory: boolean;
}

export default function BrandDistributionPie({ data, showInventory }: BrandDistributionProps) {
  const total = Object.values(data).reduce((sum, stats) => sum + stats.count, 0);
  
  const pieData = Object.entries(data).map(([brand, stats]) => ({
    x: brand,
    y: stats.count,
    percentage: ((stats.count / total) * 100).toFixed(1)
  }));

  return (
    <View style={styles.container}>
      <VictoryPie
        data={pieData}
        width={Dimensions.get('window').width - 80}
        height={300}
        colorScale="qualitative"
        labels={({ datum }) => `${datum.x}\n${datum.percentage}%`}
        style={{
          labels: { 
            fontSize: 12,
            fill: '#000000',
          }
        }}
        labelRadius={({ innerRadius }) => (innerRadius || 0) + 50}
      />
      <View style={styles.legendContainer}>
        {pieData.map((item, index) => (
          <Text key={index} style={styles.legendText}>
            {item.x}: {item.percentage}%
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 16,
    width: '100%',
  },
  legendText: {
    fontSize: 12,
    marginVertical: 2,
  },
});
