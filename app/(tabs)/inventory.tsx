import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Appbar, Text, TextInput, Card, FAB, IconButton, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

const InventoryScreen = () => {
  const router = useRouter();
  const theme = {
    ...useTheme(),
    colors: {
      ...useTheme().colors,
      primary: '#007BFF',
    },
  };
  
  // Dummy data for demonstration
  const phones = [
    {
      id: 1,
      model: 'iPhone 13 Pro',
      condition: 'New',
      price: 999,
      quantity: 5,
      image: 'https://placeholder.com/phone.jpg'
    },
    {
      id: 2,
      model: 'Samsung S21',
      condition: 'Used',
      price: 699,
      quantity: 3,
      image: 'https://placeholder.com/phone.jpg'
    },
    {
      id: 3,
      model: 'Google Pixel 6',
      condition: 'New',
      price: 799,
      quantity: 7,
      image: 'https://placeholder.com/phone.jpg'
    },
  ];

  const handleEdit = (phone) => {
    router.push({
      pathname: '/screens/AddEditPhoneScreen',
      params: { isEdit: true, phoneData: JSON.stringify(phone) }
    });
  };

  const handleDelete = (phoneId) => {
    // Implement delete logic here
    alert('Delete functionality to be implemented');
  };

  const handleAddPhone = () => {
    router.push({
      pathname: '/screens/AddEditPhoneScreen',
      params: { isEdit: false }
    });
  };

  return (
    <Surface style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Inventory" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by Model, Brand, IMEI"
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" color="#007BFF" />}
          mode="outlined"
          outlineColor="#E0E0E0"
          activeOutlineColor="#007BFF"
          theme={theme}
        />
      </View>

      {/* Phone List */}
      <ScrollView style={styles.listContainer}>
        {phones.map((phone) => (
          <Card key={phone.id} style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {/* Left: Phone Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: phone.image }}
                  style={styles.phoneImage}
                  defaultSource={require('../../assets/images/icon.png')}
                />
              </View>

              {/* Middle: Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.modelText}>{phone.model}</Text>
                <Text style={styles.conditionText}>
                  Condition: {phone.condition}
                </Text>
                <Text style={styles.priceText}>
                  ${phone.price}
                </Text>
                <Text style={styles.quantityText}>
                  In Stock: {phone.quantity}
                </Text>
              </View>

              {/* Right: Action Icons */}
              <View style={styles.actionsContainer}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => handleEdit(phone)}
                  style={styles.actionIcon}
                  iconColor="#007BFF"
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDelete(phone.id)}
                  style={styles.actionIcon}
                  iconColor="#dc3545"
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddPhone}
        color="#FFFFFF"
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  modelText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    margin: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007BFF',
  },
});

export default InventoryScreen;
