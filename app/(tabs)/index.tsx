import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface, Text, Card, Button, Avatar, useTheme, Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{ flex: 1 }}>
        <Surface style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Dealers</Text>
            <Avatar.Icon 
              size={40} 
              icon="account-circle"
              style={styles.profileIcon}
              onPress={() => router.push('/settings')}
            />
          </View>

          <ScrollView style={styles.content}>
            {/* Inventory Overview */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Inventory Overview</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="phone" size={24} color="#007BFF" />
                    <Text style={styles.statNumber}>100</Text>
                    <Text style={styles.statLabel}>Total Stock</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="sale" size={24} color="#28a745" />
                    <Text style={styles.statNumber}>50</Text>
                    <Text style={styles.statLabel}>Sold Devices</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="alert" size={24} color="#dc3545" />
                    <Text style={styles.statNumber}>5</Text>
                    <Text style={styles.statLabel}>Low Stock</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Recent Deals */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Recent Deals</Text>
                {[1, 2, 3, 4, 5].map((item) => (
                  <View key={item} style={styles.dealItem}>
                    <Text style={styles.dealModel}>iPhone 13 Pro</Text>
                    <Text style={styles.dealAmount}>$999</Text>
                    <Text style={styles.dealInfo}>John Doe • Jan 10, 2025</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Button 
                mode="contained" 
                icon="phone-plus"
                style={[styles.actionButton, { backgroundColor: '#007BFF' }]}
                onPress={() => router.push('/screens/AddEditPhoneScreen')}
              >
                Add Phone
              </Button>
              <Button 
                mode="contained"
                icon="cash-register"
                style={[styles.actionButton, { backgroundColor: '#28a745' }]}
                onPress={() => router.push('/deals')}
              >
                Log Sale
              </Button>
            </View>
          </ScrollView>
        </Surface>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    backgroundColor: '#007BFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  dealItem: {
    marginBottom: 12,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dealModel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dealAmount: {
    color: '#28a745',
    fontSize: 14,
    marginVertical: 4,
  },
  dealInfo: {
    color: '#666',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
});
