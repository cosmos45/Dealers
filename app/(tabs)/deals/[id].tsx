import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Surface, Provider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DealDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <Provider>
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
          <Appbar.Content title="Deal Details" titleStyle={styles.headerTitle} />
        </Appbar.Header>

        <ScrollView style={styles.content}>
          {/* Add your deal details components here */}
        </ScrollView>
      </Surface>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  }
});
