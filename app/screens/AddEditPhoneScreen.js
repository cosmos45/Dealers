import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Appbar, TextInput, Button, Surface, Text, Menu, Provider, Switch, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { inventoryService } from '../../services/inventoryService';
import { auth } from '../../firebaseConfig';

const CONDITIONS = [
  { label: "Brand New (Sealed)", value: "brand_new" },
  { label: "Like New (Open Box)", value: "like_new" },
  { label: "Excellent (9/10)", value: "excellent" },
  { label: "Very Good (8/10)", value: "very_good" },
  { label: "Good (7/10)", value: "good" },
  { label: "Fair (6/10)", value: "fair" },
  { label: "Refurbished (Certified)", value: "refurbished" },
  { label: "For Parts Only", value: "parts" }
];

export default function AddEditPhoneScreen() {
  const router = useRouter();
  const { isEdit, phoneData } = useLocalSearchParams();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('');
  const [storageGB, setStorageGB] = useState('');
  const [ramGB, setRamGB] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isIphone, setIsIphone] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isIphone) {
      setBrand('iPhone');
    }
  }, [isIphone]);

  useEffect(() => {
    if (isEdit && phoneData) {
      try {
        const phone = JSON.parse(phoneData);
        setBrand(phone.brand || '');
        setModel(phone.model || '');
        setCondition(phone.condition || '');
        setStorageGB(phone.storageGB?.toString() || '');
        setRamGB(phone.ramGB?.toString() || '');
        setBasePrice(phone.basePrice?.toString() || '');
        setQuantity(phone.quantity?.toString() || '1');
        setIsIphone(phone.isIphone || false);
        // Properly handle images array
        if (Array.isArray(phone.images)) {
          console.log('Loading existing images:', phone.images);
          setImages(phone.images);
        }
      } catch (error) {
        console.error('Error parsing phone data:', error);
      }
    }
  }, [isEdit, phoneData]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets) {
        const newImageUri = result.assets[0].uri;
        console.log('New image URI:', newImageUri);
        setImages(currentImages => [...currentImages, newImageUri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error selecting image. Please try again.');
    }
  };

  const removeImage = (index) => {
    setImages(currentImages => currentImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!brand || !model || !condition || !basePrice || !quantity || !storageGB) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');

      const deviceData = {
        brand,
        model,
        storageGB: parseInt(storageGB),
        ramGB: isIphone ? null : parseInt(ramGB),
        condition,
        quantity: parseInt(quantity),
        basePrice: parseFloat(basePrice),
        isIphone,
        images, // Make sure images array is included
        dealerId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isEdit) {
        const phoneId = JSON.parse(phoneData).id;
        await inventoryService.updateDevice(phoneId, deviceData);
      } else {
        await inventoryService.addDevice(deviceData);
      }

      router.back();
    } catch (error) {
      console.error('Error saving device:', error);
      alert('Error saving device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same, including the return statement and styles

  return (
    <Provider>
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
          <Appbar.Content 
            title={isEdit ? "Edit Device" : "Add New Device"} 
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>

        <ScrollView style={styles.content}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>iPhone Device</Text>
            <Switch
              value={isIphone}
              onValueChange={setIsIphone}
              color="#007BFF"
            />
          </View>

          <TextInput
            label="Brand *"
            value={brand}
            onChangeText={setBrand}
            mode="outlined"
            style={styles.input}
            disabled={isIphone}
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
          />

          <TextInput
            label="Model *"
            value={model}
            onChangeText={setModel}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
          />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TextInput
                label="Condition *"
                value={condition}
                mode="outlined"
                style={styles.input}
                right={<TextInput.Icon icon="menu-down" />}
                onTouchStart={() => setMenuVisible(true)}
                outlineColor="#E0E0E0"
                activeOutlineColor="#007BFF"
              />
            }
          >
            {CONDITIONS.map((item) => (
              <Menu.Item
                key={item.value}
                onPress={() => {
                  setCondition(item.label);
                  setMenuVisible(false);
                }}
                title={item.label}
              />
            ))}
          </Menu>

          <TextInput
            label="Storage (GB) *"
            value={storageGB}
            onChangeText={setStorageGB}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
          />

          {!isIphone && (
            <TextInput
              label="RAM (GB) *"
              value={ramGB}
              onChangeText={setRamGB}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#007BFF"
            />
          )}

          <TextInput
            label="Base Price *"
            value={basePrice}
            onChangeText={setBasePrice}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
          />

          <TextInput
            label="Quantity in Stock *"
            value={quantity}
            onChangeText={setQuantity}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
          />

          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Device Images</Text>
            <View style={styles.imageGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => removeImage(index)}
                    style={styles.removeImageButton}
                  />
                </View>
              ))}
              <IconButton
                icon="camera"
                size={24}
                onPress={pickImage}
                style={styles.addImageButton}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              labelStyle={styles.buttonLabel}
              loading={loading}
              disabled={loading}
            >
              Save
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              disabled={loading}
            >
              Cancel
            </Button>
          </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    padding: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  imageSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007BFF',
  },
  cancelButton: {
    flex: 1,
    borderColor: '#007BFF',
  },
  buttonLabel: {
    color: '#FFFFFF',
  },
  cancelButtonLabel: {
    color: '#007BFF',
  }
});
