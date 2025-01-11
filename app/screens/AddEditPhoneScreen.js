import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, TextInput, Button, Surface, Text, Menu, Provider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imei, setImei] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  const pickMedia = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' ? 
          ImagePicker.MediaTypeOptions.Images : 
          ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: type === 'image' ? [4, 3] : [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setSelectedMedia([...selectedMedia, { ...result.assets[0], type }]);
      }
    } catch (error) {
      alert('Error picking media: ' + error.message);
    }
  };

  const handleSave = () => {
    if (!brand || !model || !condition || !price || !quantity) {
      alert('Please fill in all required fields');
      return;
    }
    // Add save logic here
    router.back();
  };

  return (
    <Provider>
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
          <Appbar.Content 
            title={isEdit ? "Edit Phone" : "Add New Phone"} 
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>

        <ScrollView style={styles.content}>
          <TextInput
            label="Brand *"
            value={brand}
            onChangeText={setBrand}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Model *"
            value={model}
            onChangeText={setModel}
            mode="outlined"
            style={styles.input}
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
              />
            }
          >
            {CONDITIONS.map((item, index) => (
              <Menu.Item
                key={index}
                onPress={() => {
                  setCondition(item.label);
                  setMenuVisible(false);
                }}
                title={item.label}
              />
            ))}
          </Menu>

          <TextInput
            label="Price *"
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
          />

          <TextInput
            label="Quantity in Stock *"
            value={quantity}
            onChangeText={setQuantity}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="IMEI Number (Optional)"
            value={imei}
            onChangeText={setImei}
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.uploadTitle}>Upload Media</Text>

          <View style={styles.mediaButtons}>
            <Button
              mode="outlined"
              icon="camera"
              onPress={() => pickMedia('image')}
              style={styles.mediaButton}
              labelStyle={{ color: '#007BFF' }}
            >
              Images
            </Button>
            <Button
              mode="outlined"
              icon="video"
              onPress={() => pickMedia('video')}
              style={styles.mediaButton}
              labelStyle={{ color: '#007BFF' }}
            >
              Videos
            </Button>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              labelStyle={{ color: '#FFFFFF' }}
            >
              Save
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              labelStyle={{ color: '#007BFF' }}
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
    elevation: 0,
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
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  mediaButton: {
    flex: 1,
    borderColor: '#007BFF',
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
  }
});
