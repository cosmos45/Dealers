import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { InventoryItem } from '../../services/inventoryService';

interface Props {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}

export default function InventoryCard({ item, onEdit, onDelete }: Props) {
  const router = useRouter();

  const handleCardPress = () => {
    router.push({
      pathname: "/(auth)/PhoneDetailsScreen",
      params: { phoneData: JSON.stringify(item) }
    });
  };

  return (
    <Card style={styles.card} onPress={handleCardPress}>
      <View style={styles.cardContainer}>
        <View style={styles.thumbnailContainer}>
          {item.images?.[0] ? (
            <Image 
              source={{ 
                uri: item.images[0],
                cache: 'force-cache'
              }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.emptyThumbnail]} />
          )}
        </View>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.brandModel}>{`${item.brand} ${item.model}`}</Text>
          </View>
          
          <View style={styles.specs}>
            <Chip style={styles.chip}>
              <Text style={styles.chipText}>{item.storageGB}GB</Text>
            </Chip>
            {!item.isIphone && item.ramGB && (
              <Chip style={styles.chip}>
                <Text style={styles.chipText}>{item.ramGB}GB RAM</Text>
              </Chip>
            )}
            <Chip 
              style={[styles.chip, item.quantity < 5 && styles.lowStockChip]}
            >
              <Text style={styles.chipText}>Stock: {item.quantity}</Text>
            </Chip>
          </View>

          <Text style={styles.price}>${item.basePrice}</Text>

          <View style={styles.actions}>
            <IconButton 
              icon="pencil" 
              size={20} 
              onPress={onEdit}
              iconColor="#007BFF"
            />
            <IconButton 
              icon="delete" 
              size={20} 
              onPress={onDelete}
              iconColor="#dc3545"
            />
          </View>
        </Card.Content>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    height: 120,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
    marginLeft: 16,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  emptyThumbnail: {
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  header: {
    marginBottom: 10,
  },
  brandModel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 4,
  },
  chip: {
    backgroundColor: '#007BFF',
    height: 28,
    paddingHorizontal: 1,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  lowStockChip: {
    backgroundColor: '#FF4136',
  },
  price: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -35,
  }
});
