// app/(tabs)/marketplace/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    const docRef = doc(db, 'inventory', id as string);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setItem({ id: docSnap.id, ...docSnap.data() });
    }
  };

  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{item.brand} {item.model}</Text>
          <Text style={styles.price}>₹{item.basePrice}</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.specs}>
            <SpecItem icon="memory" label={`${item.ramGB}GB RAM`} />
            <SpecItem icon="harddisk" label={`${item.storageGB}GB Storage`} />
            <SpecItem icon="cellphone-check" label={item.condition} />
          </View>

          <Button
            mode="contained"
            onPress={() => Linking.openURL(`whatsapp://send?phone=+91${item.dealerPhone}`)}
            style={styles.button}
          >
            Contact Dealer
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const SpecItem = ({ icon, label }) => (
  <View style={styles.specItem}>
    <MaterialCommunityIcons name={icon} size={20} color="#666" />
    <Text style={styles.specText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 20,
    color: 'green',
    marginTop: 5,
  },
  divider: {
    marginVertical: 15,
  },
  specs: {
    gap: 10,
    marginBottom: 20,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  specText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    marginTop: 10,
  },
});
