import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Appbar, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface PhoneDetails {
  id: string;
  brand: string;
  model: string;
  condition: string;
  storageGB: number;
  ramGB?: number;
  basePrice: number;
  quantity: number;
  images?: string[];
  isIphone?: boolean;
  createdAt?: {
    nanoseconds: number;
    seconds: number;
  };
  updatedAt?: {
    nanoseconds: number;
    seconds: number;
  };
  dealerId?: string;
}

export default function PhoneDetailsScreen() {
  const router = useRouter();
  const { phoneData } = useLocalSearchParams<{ phoneData: string }>();
  const [loading, setLoading] = useState(true);
  const [phoneDetails, setPhoneDetails] = useState<PhoneDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const parsedData = JSON.parse(phoneData) as PhoneDetails;
      console.log('Parsed phone data:', parsedData);
      setPhoneDetails(parsedData);
    } catch (error) {
      console.error('Error parsing phone details:', error);
      setError('Unable to load phone details');
    } finally {
      setLoading(false);
    }
  }, [phoneData]);

  const handlePurchase = () => {
    Alert.alert(
      'Confirm Purchase',
      'Would you like to proceed with the purchase?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed',
          onPress: () => console.log('Processing purchase...')
        }
      ]
    );
  };

  const handleReserve = () => {
    Alert.alert(
      'Confirm Reservation',
      'Would you like to reserve this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reserve',
          onPress: () => console.log('Processing reservation...')
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading phone details...</Text>
        </View>
      </View>
    );
  }

  if (error || !phoneDetails) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Error" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Phone details not found'}</Text>
          <Button 
            mode="contained" 
            onPress={() => router.back()} 
            style={styles.errorButton}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={`${phoneDetails.brand} ${phoneDetails.model}`} />
      </Appbar.Header>
      
      <ScrollView>
        <View style={styles.imageGallery}>
          {phoneDetails.images && phoneDetails.images.length > 0 ? (
            phoneDetails.images.map((uri, index) => (
              <Image 
                key={index} 
                source={{ uri }} 
                style={styles.image} 
                resizeMode="cover"
              />
            ))
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>
            {`${phoneDetails.brand} ${phoneDetails.model}`}
          </Text>
          <Text style={styles.subtitle}>
            Condition: {phoneDetails.condition}
          </Text>
          <Text style={styles.subtitle}>
            Storage: {phoneDetails.storageGB}GB
          </Text>
          {phoneDetails.ramGB && (
            <Text style={styles.subtitle}>RAM: {phoneDetails.ramGB}GB</Text>
          )}
          <Text style={styles.price}>${phoneDetails.basePrice}</Text>
          <Text style={[
            styles.stock, 
            phoneDetails.quantity < 5 && styles.lowStock
          ]}>
            Stock: {phoneDetails.quantity}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={handlePurchase}
            style={[styles.actionButton, styles.buyButton]}
          >
            Buy Now
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleReserve}
            style={styles.actionButton}
          >
            Reserve
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF4136',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  errorButton: {
    marginTop: 10,
  },
  imageGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  image: {
    width: 150,
    height: 150,
    margin: 8,
    borderRadius: 8,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  noImageText: {
    color: '#666',
    fontSize: 16,
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
  stock: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  lowStock: {
    color: '#FF4136',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  buyButton: {
    backgroundColor: '#007BFF',
  },
  additionalInfo: {
    padding: 16,
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
