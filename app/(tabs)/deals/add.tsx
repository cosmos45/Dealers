import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, TextInput, Button, Surface, Text, Menu, RadioButton, Provider, SegmentedButtons, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '../../../firebaseConfig';
import { dealService } from '../../../services/dealService';
import CreditTermsSection from '../../components/CreditTermsSection';
import DealerHistory from '../../components/DealerHistory';
import DocumentUpload from '../../components/DocumentUpload';
import PaymentSchedule from '../../components/PaymentSchedule';

interface Phone {
  id: number;
  model: string;
  basePrice: number;
  negotiatedPrice?: number;
  quantity: number;
}

export default function AddDealScreen() {
  const router = useRouter();
  const [dealType, setDealType] = useState('retail');
  const [selectedPhones, setSelectedPhones] = useState<Phone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [creditTerm, setCreditTerm] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, []);

  // Dummy inventory data
  const inventoryPhones = [
    { id: 1, model: 'iPhone 13 Pro', basePrice: 999, quantity: 5 },
    { id: 2, model: 'Samsung S21', basePrice: 699, quantity: 3 },
  ];

  useEffect(() => {
    if (searchQuery) {
      const filtered = inventoryPhones.filter(phone => 
        phone.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPhones(filtered);
    } else {
      setFilteredPhones([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const total = selectedPhones.reduce((sum, phone) => 
      sum + (phone.negotiatedPrice || phone.basePrice) * phone.quantity, 0
    );
    setTotalAmount(total);
  }, [selectedPhones]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!buyerName || !buyerContact || selectedPhones.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
  
    try {
      setIsSaving(true); // Start loading
      const newDeal = {
        customerName: buyerName,
        contact: buyerContact,
        totalAmount,
        status: paymentMode === 'credit' ? 'Pending' : 'Paid',
        phones: selectedPhones.map(phone => ({
          model: phone.model,
          quantity: phone.quantity,
          price: phone.negotiatedPrice || phone.basePrice
        })),
        paymentMode,
        creditTerm: creditTerm || undefined,
        dealType
      };
  
      await dealService.addDeal(newDeal);
      router.back();
    } catch (error) {
      alert('Error saving deal. Please try again.');
    } finally {
      setIsSaving(false); // End loading
    }
  };
  
  

  return (
    <Provider>
      <Surface style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color="#007BFF" />
          <Appbar.Content title="Log a Deal" titleStyle={styles.headerTitle} />
        </Appbar.Header>

        <ScrollView style={styles.content}>
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
            placeholder="Search phones..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            style={styles.searchInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
            theme={{ colors: { text: '#000000' } }}
            left={<TextInput.Icon icon="magnify" color="#007BFF" />}
          />

          {filteredPhones.length > 0 && (
            <Surface style={styles.searchResults}>
              {filteredPhones.map(phone => (
                <Button
                  key={phone.id}
                  mode="text"
                  onPress={() => {
                    setSelectedPhones([...selectedPhones, { ...phone, quantity: 1 }]);
                    setSearchQuery('');
                  }}
                  style={styles.searchResultItem}
                  labelStyle={styles.searchResultText}
                >
                  {`${phone.model} - $${phone.basePrice}`}
                </Button>
              ))}
            </Surface>
          )}

          {selectedPhones.map(phone => (
            <Surface key={phone.id} style={styles.selectedPhone}>
              <Text style={styles.phoneModel}>{phone.model}</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  value={(phone.negotiatedPrice || phone.basePrice).toString()}
                  onChangeText={(text) => {
                    const newPhones = selectedPhones.map(p => 
                      p.id === phone.id ? { ...p, negotiatedPrice: Number(text) } : p
                    );
                    setSelectedPhones(newPhones);
                  }}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.priceInput}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#007BFF"
                  theme={{ colors: { text: '#000000' } }}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Qty</Text>
                <TextInput
                  value={phone.quantity.toString()}
                  onChangeText={(text) => {
                    const newPhones = selectedPhones.map(p => 
                      p.id === phone.id ? { ...p, quantity: Number(text) || 1 } : p
                    );
                    setSelectedPhones(newPhones);
                  }}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.quantityInput}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#007BFF"
                  theme={{ colors: { text: '#000000' } }}
                />
              </View>
              <IconButton
                icon="delete"
                size={24}
                onPress={() => {
                  setSelectedPhones(phones => phones.filter(p => p.id !== phone.id));
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
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
            theme={{ colors: { text: '#000000' } }}
          />

          <TextInput
            label="Contact Number *"
            value={buyerContact}
            onChangeText={setBuyerContact}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            outlineColor="#E0E0E0"
            activeOutlineColor="#007BFF"
            theme={{ colors: { text: '#000000' } }}
          />

          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Surface style={styles.paymentSection}>
            <RadioButton.Group
              onValueChange={value => setPaymentMode(value)}
              value={paymentMode}
            >
              <View style={styles.radioGroup}>
                <View style={styles.radioButton}>
                  <RadioButton.Android value="cash" color="#007BFF" />
                  <Text style={styles.radioLabel}>Cash</Text>
                </View>
                <View style={styles.radioButton}>
                  <RadioButton.Android value="online" color="#007BFF" />
                  <Text style={styles.radioLabel}>Online</Text>
                </View>
                <View style={styles.radioButton}>
                  <RadioButton.Android value="credit" color="#007BFF" />
                  <Text style={styles.radioLabel}>Credit</Text>
                </View>
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
  disabled={isSaving}
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
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchResults: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  searchResultItem: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchResultText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
  },
  phoneModel: {
    flex: 2,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  quantityInput: {
    backgroundColor: '#FFFFFF',
    height: 40,
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
    fontSize: 16,
  },
});
