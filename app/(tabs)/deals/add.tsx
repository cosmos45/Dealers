//add.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  ActivityIndicator,
  Surface,
  Text,
  Menu,
  RadioButton,
  Provider,
  SegmentedButtons,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '../../../firebaseConfig';
import { dealService } from '../../../services/dealService';
import CreditTermsSection from '../../components/CreditTermsSection';
import DealerHistory from '../../components/DealerHistory';
import DocumentUpload from '../../components/DocumentUpload';
import PaymentSchedule from '../../components/PaymentSchedule';
import { inventoryService } from '../../../services/inventoryService';

interface Phone {
  id: string;
  model: string;
  basePrice: number;
  negotiatedPrice?: number;
  brand: string;
  storageGB: number;
  ramGB?: number;
  isIphone: boolean;
  status: 'available' | 'sold';
}

export default function AddDealScreen() {
  const router = useRouter();
  const [dealType, setDealType] = useState('retail');
  const [selectedPhones, setSelectedPhones] = useState<Phone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [creditTerm, setCreditTerm] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setLoading(true);
      try {
        const results = await inventoryService.searchInventoryPhones(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, []);

  useEffect(() => {
    const total = selectedPhones.reduce(
      (sum, phone) => sum + (phone.negotiatedPrice || phone.basePrice),
      0
    );
    setTotalAmount(total);
  }, [selectedPhones]);

  const handleSave = async () => {
    if (!buyerName || !buyerContact || !selectedPhones.length) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      const dealData = {
        customerName: buyerName,
        contact: buyerContact,
        totalAmount,
        status: paymentMode === 'credit' ? 'Pending' : 'Paid',
        phones: selectedPhones.map(phone => ({
          model: phone.model,
          price: phone.negotiatedPrice || phone.basePrice,
          phoneId: phone.id,
        })),
        paymentMode,
        dealType,
        ...(creditTerm ? { creditTerm } : {})
      };

      await dealService.addDeal(dealData);
      router.back();
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Error saving deal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Provider>
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
          <Appbar.Content title="Log a Deal" titleStyle={styles.headerTitle} />
        </Appbar.Header>
  
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <SegmentedButtons
                value={dealType}
                onValueChange={setDealType}
                buttons={[
                  { 
                    value: 'retail', 
                    label: 'Retail Sale',
                    style: dealType === 'retail' ? styles.activeSegment : styles.inactiveSegment,
                    labelStyle: { color: dealType === 'retail' ? '#FFFFFF' : '#007BFF' }
                  },
                  { 
                    value: 'wholesale', 
                    label: 'Wholesale/Bulk',
                    style: dealType === 'wholesale' ? styles.activeSegment : styles.inactiveSegment,
                    labelStyle: { color: dealType === 'wholesale' ? '#FFFFFF' : '#007BFF' }
                  }
                ]}
                style={styles.segmentedButtons}
              />
  
              <Text style={styles.sectionTitle}>Select Phones</Text>
  
              <TextInput
                placeholder="Search by Model or Brand"
                value={searchQuery}
                onChangeText={handleSearch}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" color="#007BFF" />}
                mode="outlined"
                outlineColor="#007BFF"
                activeOutlineColor="#007BFF"
              />
  
              {loading && <ActivityIndicator size="large" style={styles.loader} color="#007BFF" />}
            </>
          }
          renderItem={({ item }) => (
            <Surface style={styles.searchResultItem}>
              <Text style={styles.searchResultText}>{item.brand} {item.model}</Text>
              <Text style={styles.searchResultSubtext}>{item.storageGB}GB - ${item.basePrice}</Text>
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedPhones((prev) => [...prev, item]);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={styles.addButton}
                labelStyle={styles.addButtonLabel}
              >
                Add
              </Button>
            </Surface>
          )}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          ListEmptyComponent={
            !loading && searchQuery.length > 0 ? (
              <Text style={styles.noResults}>No results found</Text>
            ) : null
          }
          ListFooterComponent={
            <>
              {selectedPhones.map((phone) => (
                <Surface key={phone.id} style={styles.selectedPhone}>
                  <Text style={styles.phoneModel}>{`${phone.brand} ${phone.model} ${phone.storageGB}GB`}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Price:</Text>
                    <TextInput
                      value={(phone.negotiatedPrice || phone.basePrice).toString()}
                      onChangeText={(text) => {
                        const updatedPhones = selectedPhones.map((p) =>
                          p.id === phone.id ? { ...p, negotiatedPrice: Number(text) } : p
                        );
                        setSelectedPhones(updatedPhones);
                      }}
                      keyboardType="numeric"
                      mode="outlined"
                      style={styles.priceInput}
                      outlineColor="#007BFF"
                      activeOutlineColor="#007BFF"
                    />
                  </View>
                  <IconButton
                    icon="delete"
                    size={24}
                    onPress={() => {
                      setSelectedPhones((phones) => phones.filter((p) => p.id !== phone.id));
                    }}
                    iconColor="#007BFF"
                  />
                </Surface>
              ))}
  
              {selectedPhones.length > 0 && (
                <Surface style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
                </Surface>
              )}
  
              <TextInput
                label={dealType === 'wholesale' ? "Dealer Name *" : "Customer Name *"}
                value={buyerName}
                onChangeText={setBuyerName}
                mode="outlined"
                style={styles.input}
                outlineColor="#007BFF"
                activeOutlineColor="#007BFF"
              />
  
              <TextInput
                label="Contact Number *"
                value={buyerContact}
                onChangeText={setBuyerContact}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                outlineColor="#007BFF"
                activeOutlineColor="#007BFF"
              />
  
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <Surface style={styles.paymentSection}>
                <RadioButton.Group
                  onValueChange={(value) => setPaymentMode(value)}
                  value={paymentMode}
                >
                  <View style={styles.radioGroup}>
                    {['cash', 'online', 'credit'].map((mode) => (
                      <View key={mode} style={styles.radioButton}>
                        <RadioButton.Android value={mode} color="#007BFF" />
                        <Text style={styles.radioLabel}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                      </View>
                    ))}
                  </View>
                </RadioButton.Group>
              </Surface>
  
              {paymentMode === 'credit' && (
                <View style={styles.creditSection}>
                  <CreditTermsSection 
                    onSelectTerm={setCreditTerm}
                    selectedTerm={creditTerm}
                  />
                  {dealType === 'wholesale' && creditTerm && (
                    <>
                      <DealerHistory dealerId="123" />
                      <PaymentSchedule
                        totalAmount={totalAmount}
                        creditTerm={creditTerm}
                        startDate={new Date()}
                      />
                      <DocumentUpload onUpload={() => {}} />
                    </>
                  )}
                </View>
              )}
  
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                  labelStyle={styles.buttonLabel}
                  loading={isSaving}
                  disabled={!buyerName || !buyerContact || selectedPhones.length === 0 || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Deal'}
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
            </>
          }
          contentContainerStyle={styles.content}
        />
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
    flexGrow: 1,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  activeSegment: {
    backgroundColor: '#007BFF',
  },
  inactiveSegment: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007BFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: 16,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  loader: {
    marginTop: 20,
  },
  searchResultItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  searchResultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  searchResultSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: '#007BFF',
  },
  addButtonLabel: {
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 8,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666666',
  },
  selectedPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    elevation: 2,
  },
  phoneModel: {
    flex: 2,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#000000',
  },
  priceInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  paymentSection: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  creditSection: {
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#007BFF',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
