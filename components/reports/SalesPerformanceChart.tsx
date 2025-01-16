// components/reports/SalesPerformanceChart.tsx
import React from 'react';
import { Dimensions } from 'react-native';
import { VictoryAxis } from 'victory-native/lib/components/victory-axis';

import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';

interface SalesPerformanceProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
}

export default function SalesPerformanceChart({ data }: SalesPerformanceProps) {
  return (
    <VictoryChart
      theme={VictoryTheme.material}
      width={Dimensions.get('window').width - 40}
      domainPadding={20}
    >
      <VictoryAxis
        tickFormat={(t) => t.split('-').slice(1).join('/')}
        style={{
          tickLabels: { angle: -45, fontSize: 8 }
        }}
      />
      <VictoryAxis
        dependentAxis
        tickFormat={(t) => `£${t}`}
      />
      <VictoryBar
        data={data}
        x="date"
        y="revenue"
        style={{
          data: {
            fill: "#007BFF"
          }
        }}
      />
    </VictoryChart>
  );
}
