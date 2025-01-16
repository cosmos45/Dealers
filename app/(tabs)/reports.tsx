// app/tabs/reports.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Surface, SegmentedButtons, Text, ActivityIndicator, Button, FAB } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import { reportsService } from '../../services/reportsService';
import BrandDistributionPie from '../../components/reports/BrandDistributionPie';
import StatsCard from '../../components/reports/StatsCard';
import TopModelsCard from '../../components/reports/TopModelsCard';
import InsightsCard from '../../components/reports/InsightsCard';

export default function ReportsScreen() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [brandData, setBrandData] = useState({});
  const [inventoryData, setInventoryData] = useState({});
  const [showInventory, setShowInventory] = useState(false);
  const [topModels, setTopModels] = useState([]);
  const [insights, setInsights] = useState({
    modelsPerBrand: {},
    salesDistribution: { wholesale: 0, retail: 0 },
    margins: { wholesale: 0, retail: 0, combined: 0 }
  });
  
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      loadReportData();
    }, [])
  );

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [
        brandAnalytics, 
        timeStats, 
        inventory, 
        models,
        modelsPerBrand,
        salesDist,
        margins
      ] = await Promise.all([
        reportsService.getBrandAnalytics(),
        reportsService.getTimeRangeStats(
          new Date(new Date().setDate(new Date().getDate() - 7)),
          new Date()
        ),
        reportsService.getInventoryAnalytics(),
        reportsService.getTopSellingModels(5),
        reportsService.getModelsPerBrand(),
        reportsService.getSalesDistribution(),
        reportsService.getAverageMargins()
      ]);

      setBrandData(brandAnalytics);
      setInventoryData(inventory);
      setStats(timeStats);
      setTopModels(models);
      setInsights({
        modelsPerBrand,
        salesDistribution: salesDist,
        margins
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReportData();
  }, []);

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    setStartDatePickerVisible(false);
    setEndDatePickerVisible(true);
  };

  const handleEndDateConfirm = async (date: Date) => {
    setEndDate(date);
    setEndDatePickerVisible(false);
    await exportSalesData(startDate, date);
  };

  const exportSalesData = async (start: Date, end: Date) => {
    try {
      const salesData = await reportsService.getSalesDataForDateRange(start, end);
      const csvContent = generateCSV(salesData);
      const fileUri = `${FileSystem.documentDirectory}sales_report.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const generateCSV = (data: any[]) => {
    const headers = ['Date', 'Model', 'Brand', 'Price', 'Deal Type', 'Margin'];
    const rows = data.map(item => 
      `${item.soldAt},${item.model},${item.brand},${item.price},${item.dealType},${item.price - item.cost}`
    );
    return [headers.join(','), ...rows].join('\n');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007BFF']}
            tintColor="#007BFF"
          />
        }
      >
        <View style={styles.timeRangeContainer}>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { 
                value: 'week', 
                label: 'Week',
                style: timeRange === 'week' ? styles.activeSegment : {}
              },
              { 
                value: 'month', 
                label: 'Month',
                style: timeRange === 'month' ? styles.activeSegment : {}
              },
              { 
                value: 'year', 
                label: 'Year',
                style: timeRange === 'year' ? styles.activeSegment : {}
              },
            ]}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Sales"
            value={stats.totalSales}
            subtitle="Phones Sold"
          />
          <StatsCard
            title="Total Revenue"
            value={`£${stats.totalRevenue.toFixed(2)}`}
          />
          <StatsCard
            title="Average Order Value"
            value={`£${stats.averageOrderValue.toFixed(2)}`}
          />
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {showInventory ? 'Inventory by Brand' : 'Sales by Brand'}
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowInventory(!showInventory)}
              style={styles.toggleButton}
            >
              Show {showInventory ? 'Sales' : 'Inventory'}
            </Button>
          </View>
          <BrandDistributionPie 
            data={showInventory ? inventoryData : brandData} 
            showInventory={showInventory}
          />
        </View>

        <TopModelsCard models={topModels} />

        <InsightsCard 
          modelsPerBrand={insights.modelsPerBrand}
          salesDistribution={insights.salesDistribution}
          margins={insights.margins}
        />
      </ScrollView>

      <FAB
        icon="file-download"
        label="Export Sales"
        style={styles.fab}
        onPress={() => setStartDatePickerVisible(true)}
        labelStyle={styles.fabLabel}
        color="#FFFFFF"
      />

      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setStartDatePickerVisible(false)}
      />

      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setEndDatePickerVisible(false)}
        minimumDate={startDate}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  timeRangeContainer: {
    padding: 16,
  },
  activeSegment: {
    backgroundColor: '#007BFF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  chartContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  toggleButton: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007BFF',
  },
  fabLabel: {
    color: '#FFFFFF',
  }
});
