import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import {
  Appbar,
  Text,
  Button,
  ActivityIndicator,
  Card,
  DataTable
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { inventoryService, SoldPhone, InventoryItem } from '../../services/inventoryService';
import ImageView from 'react-native-image-viewing';
import * as FileSystem from 'expo-file-system';
import { auth, storage } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';

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

interface MarketInsights {
  averagePrice: number;
  totalSold: number;
}

// Add this before the return statement in PhoneDetailsScreen
const handleImageError = (error: any) => {
  if (error?.code === 'storage/unauthorized') {
    console.error('User not authorized to access image');
    return null;
  }
  if (error?.code === 'storage/invalid-format') {
    console.error('Invalid image format');
    return null;
  }
  console.error('Image loading error:', error);
  return null;
};


export default function PhoneDetailsScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { phoneData } = useLocalSearchParams<{ phoneData: string }>();

  const [loading, setLoading] = useState(true);
  const [isChangingDevice, setIsChangingDevice] = useState(false);
  const [phoneDetails, setPhoneDetails] = useState<PhoneDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [recentSales, setRecentSales] = useState<SoldPhone[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [similarPhones, setSimilarPhones] = useState<InventoryItem[]>([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<{[key: string]: boolean}>({});
  const [imageCache, setImageCache] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No authenticated user');
          return;
        }
  
        const parsedData = JSON.parse(phoneData) as PhoneDetails;
        console.log('Parsed phone data:', parsedData);
        setPhoneDetails(parsedData);
  
        // Fetch in-memory sales and insights
        fetchSalesAndInsights(parsedData);
  
        // Subscribe to inventory for "similar phones"
        const unsubscribe = inventoryService.subscribeToInventory((items) => {
          const similar = getSimilarPhones(items, parsedData);
          setSimilarPhones(similar);
        });
  
        if (parsedData?.images) {
          await Promise.all(parsedData.images.map(cacheImage));
        }
  
        // Scroll to top
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  
        setLoading(false);
        setIsChangingDevice(false);
  
        return () => unsubscribe();
      } catch (err) {
        console.error('Error parsing phone details:', err);
        setError('Unable to load phone details');
        setLoading(false);
      }
    };
  
    checkAuth();
  }, [phoneData]);

  const cacheImage = async (uri: string) => {
    try {
      const cacheKey = `${FileSystem.cacheDirectory}${uri.split('/').pop()}`;
      const cacheExists = await FileSystem.getInfoAsync(cacheKey);
      
      if (!cacheExists.exists) {
        await FileSystem.downloadAsync(uri, cacheKey);
      }
      
      setImageCache(prev => ({
        ...prev,
        [uri]: cacheKey
      }));
    } catch (error) {
      console.error('Image caching error:', error);
      setImageLoadErrors(prev => ({
        ...prev,
        [uri]: true
      }));
    }
  };
  
  

  const fetchSalesAndInsights = async (phone: PhoneDetails) => {
    try {
      const allSoldPhones = await inventoryService.getSoldDevicesWithDetails();
      const exactMatches = allSoldPhones.filter(sale => 
        sale.brand?.toLowerCase() === phone.brand.toLowerCase() &&
        sale.model?.toLowerCase() === phone.model.toLowerCase()
      );
  
      const modelOrBrandSales = exactMatches.length > 0 ? exactMatches : 
        allSoldPhones.filter(sale => 
          sale.brand?.toLowerCase() === phone.brand.toLowerCase()
        );
  
      setRecentSales(modelOrBrandSales.slice(0, 5));
      
      if (modelOrBrandSales.length > 0) {
        const totalSold = modelOrBrandSales.length;
        const totalPrice = modelOrBrandSales.reduce((sum, sale) => sum + (sale.price || 0), 0);
        setMarketInsights({
          averagePrice: totalPrice / totalSold,
          totalSold
        });
      }
    } catch (err) {
      console.error('Error fetching sales/insights:', err);
      setMarketInsights(null);
    }
  };
  

  const getSimilarPhones = (items: InventoryItem[], phone: PhoneDetails): InventoryItem[] => {
    return items
      .filter((item) => {
        if (item.id === phone.id) return false;
        const isSameBrand = item.brand?.toLowerCase() === phone.brand.toLowerCase();
        const modelMatch = item.model?.toLowerCase().includes(phone.model.toLowerCase()) ||
          phone.model.toLowerCase().includes(item.model?.toLowerCase());
        const hasSimilarStorage = !phone.storageGB || Math.abs(item.storageGB - phone.storageGB) <= 128;
        const hasSimilarRam = !phone.ramGB || !item.ramGB || Math.abs(item.ramGB - phone.ramGB) <= 4;
        return isSameBrand && (modelMatch || hasSimilarStorage || hasSimilarRam);
      })
      .sort((a, b) => {
        const conditionOrder: Record<string, number> = {
          New: 0,
          'Like New': 1,
          Excellent: 2,
          Good: 3,
          Fair: 4
        };
        const aOrder = conditionOrder[a.condition] ?? 5;
        const bOrder = conditionOrder[b.condition] ?? 5;
        return aOrder - bOrder;
      })
      .slice(0, 10);
  };

  const handleSimilarPhoneClick = (phone: InventoryItem) => {
    setIsChangingDevice(true);
    const phoneDataString = JSON.stringify(phone);
    router.push({
      pathname: '/(auth)/PhoneDetailsScreen',
      params: { phoneData: phoneDataString }
    });
  };

  const handleImagePress = (index: number) => {
    console.log('Image pressed:', index);
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
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
          <Button mode="contained" onPress={() => router.back()} style={styles.errorButton}>
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
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImagePress(index)}
                  >
                    <Image
  source={{ 
    uri: imageCache[uri] || uri,
    headers: { 
      Accept: 'image/*',
      'Cache-Control': 'no-cache',
      Authorization: `Bearer ${auth.currentUser?.getIdToken()}`
    }
  }}
  defaultSource={require('../../assets/images/icon.png')}
  style={styles.carouselImage}
  resizeMode="cover"
  onError={(e) => {
    handleImageError(e.nativeEvent.error);
    setImageLoadErrors(prev => ({
      ...prev,
      [uri]: true
    }));
  }}
  onLoadStart={() => {
    console.log('Starting to load image:', uri);
  }}
  onLoad={() => {
    console.log('Image loaded successfully:', uri);
    setImageLoadErrors(prev => ({
      ...prev,
      [uri]: false
    }));
  }}
/>


                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.pagination}>
                {phoneDetails.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeImageIndex && styles.paginationDotActive
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
            <Text
              style={[
                styles.stock,
                phoneDetails.quantity < 5 && styles.lowStock
              ]}
            >
              Stock: {phoneDetails.quantity}
            </Text>
          </Card.Content>
        </Card>

        {/* MARKET INSIGHTS */}
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
                  <Text style={styles.insightLabel}>Total Sold</Text>
                  <Text style={styles.insightValue}>
                    {marketInsights.totalSold}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>
                No market data available
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* RECENT SALES */}
        <Card style={styles.detailsCard}>
          <Card.Title title="Recent Sales" />
          <Card.Content>
            {recentSales.length > 0 ? (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Model</DataTable.Title>
                  <DataTable.Title numeric>Price</DataTable.Title>
                </DataTable.Header>
                {recentSales.map((sale) => (
                  <DataTable.Row key={sale.id}>
                    <DataTable.Cell>{sale.model}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      ${sale.price}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <Text style={styles.noDataText}>
                No recent sales found
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* SIMILAR PHONES */}
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
      <Text style={styles.noDataText}>
        No similar models available
      </Text>
    )}
  </Card.Content>
</Card>
</ScrollView>

<ImageView
        images={phoneDetails?.images?.map(uri => ({ uri })) || []}
        imageIndex={selectedImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

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
    backgroundColor: '#FFFFFF'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#FF4136',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16
  },
  errorButton: {
    marginTop: 10
  },
  imageCard: {
    margin: 16,
    overflow: 'hidden',
    borderRadius: 8
  },
  carouselImage: {
    width: width - 32,
    height: 300,
    borderRadius: 8
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    margin: 4
  },
  paginationDotActive: {
    backgroundColor: '#007BFF',
    width: 12,
    height: 12
  },
  noImageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  noImageText: {
    color: '#666',
    fontSize: 16
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666'
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8
  },
  stock: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
  },
  lowStock: {
    color: '#FF4136'
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  insightItem: {
    width: '48%',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF'
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  viewMoreButton: {
    marginRight: 8,
    alignSelf: 'center'
  },
  similarPhoneCard: {
    width: 160,
    marginRight: 12
  },
  similarPhoneInnerCard: {
    overflow: 'hidden',
    borderRadius: 8
  },
  similarPhoneImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  similarPhoneDetails: {
    padding: 8
  },
  similarPhoneModel: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  similarPhoneStorage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  similarPhonePrice: {
    fontSize: 16,
    color: '#28a745',
    marginTop: 4
  },
  similarPhoneCondition: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffffcc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1
  },
  imageViewerIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center'
  }
});
