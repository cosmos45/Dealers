import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Appbar, Text, Button, ActivityIndicator, Card, DataTable } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { dealService } from '../../services/dealService';
import { inventoryService } from '../../services/inventoryService';
import type { SaleHistory, MarketInsights } from '../../services/dealService';
import type { InventoryItem } from '../../services/inventoryService';

const { width } = Dimensions.get('window');

interface PhoneDetails {
  id?: string;
  brand: string;
  model: string;
  condition: string;
  storageGB: number;
  ramGB?: number;
  basePrice: number;
  quantity: number;
  images?: string[];
  imagePaths?: string[];
  isIphone?: boolean;
  createdAt?: any;
  updatedAt?: any;
  dealerId?: string;
}

export default function PhoneDetailsScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { phoneData } = useLocalSearchParams<{ phoneData: string }>();
  const [loading, setLoading] = useState(true);
  const [isChangingDevice, setIsChangingDevice] = useState(false);
  const [phoneDetails, setPhoneDetails] = useState<PhoneDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [recentSales, setRecentSales] = useState<SaleHistory[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [similarPhones, setSimilarPhones] = useState<InventoryItem[]>([]);

  useEffect(() => {
    try {
      const parsedData = JSON.parse(phoneData) as PhoneDetails;
      console.log('Parsed phone data:', parsedData);
      setPhoneDetails(parsedData);
      fetchAdditionalData(parsedData);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (error) {
      console.error('Error parsing phone details:', error);
      setError('Unable to load phone details');
    } finally {
      setLoading(false);
      setIsChangingDevice(false);
    }
  }, [phoneData]);

  const fetchAdditionalData = async (phone: PhoneDetails) => {
  try {
    const [sales, insights] = await Promise.all([
      dealService.getRecentSales(phone.model),
      dealService.getMarketInsights(phone.model)
    ]);
    setRecentSales(sales);
    setMarketInsights(insights);

    const unsubscribe = inventoryService.subscribeToInventory((items) => {
      const similar = items
        .filter(item => {
          if (item.id === phone.id) return false;

          const isSameBrand = item.brand.toLowerCase() === phone.brand.toLowerCase();
          const modelMatch = item.model.toLowerCase().includes(phone.model.toLowerCase()) || 
                             phone.model.toLowerCase().includes(item.model.toLowerCase());

          // Relaxed storage and RAM constraints
          const hasSimilarStorage = !phone.storageGB || Math.abs(item.storageGB - phone.storageGB) <= 128;
          const hasSimilarRam = !phone.ramGB || !item.ramGB || Math.abs(item.ramGB - phone.ramGB) <= 4;

          return isSameBrand && (modelMatch || hasSimilarStorage || hasSimilarRam);
        })
        .sort((a, b) => {
          const conditionOrder = {
            'New': 0,
            'Like New': 1,
            'Excellent': 2,
            'Good': 3,
            'Fair': 4
          };
          const aOrder = conditionOrder[a.condition] ?? 5;
          const bOrder = conditionOrder[b.condition] ?? 5;
          
          if (aOrder === bOrder) {
            // Sort by relevance: closer storage, RAM, and model match
            const aRelevance = Math.abs(a.storageGB - phone.storageGB) + 
                               (a.ramGB ? Math.abs(a.ramGB - phone.ramGB) : 0) + 
                               (a.model.toLowerCase().includes(phone.model.toLowerCase()) ? 0 : 1);
            const bRelevance = Math.abs(b.storageGB - phone.storageGB) + 
                               (b.ramGB ? Math.abs(b.ramGB - phone.ramGB) : 0) + 
                               (b.model.toLowerCase().includes(phone.model.toLowerCase()) ? 0 : 1);
            return aRelevance - bRelevance;
          }
          return aOrder - bOrder;
        })
        .slice(0, 10);

      setSimilarPhones(similar);
    });

    return () => unsubscribe();
  } catch (error) {
    console.error('Error fetching additional data:', error);
  }
};


  const handleSimilarPhoneClick = (phone: InventoryItem) => {
    setIsChangingDevice(true);
    const phoneDataString = JSON.stringify(phone);
    router.push({
      pathname: '/(auth)/PhoneDetailsScreen',
      params: { phoneData: phoneDataString }
    });
  };

  const handleViewMoreSimilar = () => {
    if (phoneDetails) {
      router.push({
        pathname: '/(tabs)/inventory',
        params: {
          brand: phoneDetails.brand,
          storage: phoneDetails.storageGB.toString()
        }
      });
    }
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
      
      <ScrollView ref={scrollViewRef}>
        <Card style={styles.imageCard}>
          {phoneDetails.images && phoneDetails.images.length > 0 ? (
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={({ nativeEvent }) => {
                  const slide = Math.ceil(
                    nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
                  );
                  if (slide !== activeImageIndex) {
                    setActiveImageIndex(slide);
                  }
                }}
                scrollEventThrottle={16}
              >
                {phoneDetails.images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.pagination}>
                {phoneDetails.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
        </Card>

        <Card style={styles.detailsCard}>
          <Card.Content>
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
          </Card.Content>
        </Card>

        <Card style={styles.detailsCard}>
          <Card.Title title="Market Insights" />
          <Card.Content>
            {marketInsights ? (
              <View style={styles.insightsGrid}>
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Average Price</Text>
                  <Text style={styles.insightValue}>
                    ${marketInsights.averagePrice.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Retail Average</Text>
                  <Text style={styles.insightValue}>
                    ${marketInsights.retailAverage.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Wholesale Average</Text>
                  <Text style={styles.insightValue}>
                    ${marketInsights.wholesaleAverage.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Total Sold</Text>
                  <Text style={styles.insightValue}>
                    {marketInsights.totalSold}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No market data available</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.detailsCard}>
          <Card.Title title="Recent Sales" />
          <Card.Content>
            {recentSales.length > 0 ? (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title numeric>Price</DataTable.Title>
                  <DataTable.Title>Type</DataTable.Title>
                </DataTable.Header>
                {recentSales.map((sale) => (
                  <DataTable.Row key={sale.id}>
                    <DataTable.Cell>
                      {new Date(sale.date).toLocaleDateString()}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>${sale.price}</DataTable.Cell>
                    <DataTable.Cell>{sale.dealType}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <Text style={styles.noDataText}>No sales history available</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.detailsCard}>
          <View style={styles.sectionHeader}>
            <Card.Title title="Similar Models" />
            {similarPhones.length > 0 && (
              <Button
                mode="text"
                onPress={handleViewMoreSimilar}
                style={styles.viewMoreButton}
              >
                View More
              </Button>
            )}
          </View>
          <Card.Content>
            {similarPhones.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarPhones.map((phone) => (
                  <TouchableOpacity
                    key={phone.id}
                    onPress={() => handleSimilarPhoneClick(phone)}
                    style={styles.similarPhoneCard}
                  >
                    <Card style={styles.similarPhoneInnerCard}>
                      {phone.images && phone.images[0] ? (
                        <Image
                          source={{ uri: phone.images[0] }}
                          style={styles.similarPhoneImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.noImageContainer}>
                          <Text style={styles.noImageText}>No image</Text>
                        </View>
                      )}
                      <View style={styles.similarPhoneDetails}>
                        <Text style={styles.similarPhoneModel}>
                          {phone.model}
                        </Text>
                        <Text style={styles.similarPhoneStorage}>
                          {phone.storageGB}GB
                        </Text>
                        <Text style={styles.similarPhonePrice}>
                          ${phone.basePrice}
                        </Text>
                        <Text style={styles.similarPhoneCondition}>
                          {phone.condition}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noDataText}>No similar models available</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {isChangingDevice && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading device details...</Text>
        </View>
      )}
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
  imageCard: {
    margin: 16,
    overflow: 'hidden',
  },
  carouselImage: {
    width: width - 32,
    height: 300,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    margin: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007BFF',
  },
  noImageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noImageText: {
    color: '#666',
    fontSize:
 16,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
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
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightItem: {
    width: '48%',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,

  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16,
  },
  similarPhoneCard: {
    width: 160,
    marginRight: 12,
  },
  similarPhoneInnerCard: {
    overflow: 'hidden',
  },
  similarPhoneImage: {
    width: '100%',
    height: 120,
  },
  similarPhoneDetails: {
    padding: 8,
  },
  similarPhoneModel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  similarPhonePrice: {
    fontSize: 16,
    color: '#28a745',
    marginTop: 4,
  },
  similarPhoneCondition: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  }
});