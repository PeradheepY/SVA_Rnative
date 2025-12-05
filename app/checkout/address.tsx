import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../src/store';
import { setSelectedAddress, addAddress } from '../../src/store/slices/orderSlice';
import { DeliveryAddress } from '../../src/services/orderService';
import { colors } from '../../styles/commonStyles';

const AddressScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { savedAddresses, selectedAddress } = useSelector((state: RootState) => state.orders);
  const { total, items } = useSelector((state: RootState) => state.cart);

  const [showForm, setShowForm] = useState(savedAddresses.length === 0);
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: user?.name || '',
    phone: user?.phoneNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const handleInputChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    if (!address.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!address.phone.trim() || address.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (!address.addressLine1.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!address.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (!address.state.trim()) {
      Alert.alert('Error', 'Please enter your state');
      return false;
    }
    if (!address.pincode.trim() || address.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleSaveAndContinue = () => {
    if (!validateAddress()) return;
    
    dispatch(addAddress(address));
    dispatch(setSelectedAddress(address));
    router.push('/checkout/review');
  };

  const handleSelectAddress = (addr: DeliveryAddress) => {
    dispatch(setSelectedAddress(addr));
    router.push('/checkout/review');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient colors={['#6BCF7F', '#5AB96D']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <BlurView intensity={20} style={styles.headerButtonBlur}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Address</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Saved Addresses */}
        {savedAddresses.length > 0 && !showForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            {savedAddresses.map((addr, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.addressCard,
                  selectedAddress === addr && styles.addressCardSelected
                ]}
                onPress={() => handleSelectAddress(addr)}
              >
                <View style={styles.addressRadio}>
                  {selectedAddress === addr ? (
                    <View style={styles.radioSelected} />
                  ) : (
                    <View style={styles.radioUnselected} />
                  )}
                </View>
                <View style={styles.addressContent}>
                  <Text style={styles.addressName}>{addr.fullName}</Text>
                  <Text style={styles.addressPhone}>{addr.phone}</Text>
                  <Text style={styles.addressText}>
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                  </Text>
                  <Text style={styles.addressText}>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.addNewButton}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addNewText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Address Form */}
        {(showForm || savedAddresses.length === 0) && (
          <View style={styles.section}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>
                {savedAddresses.length > 0 ? 'Add New Address' : 'Enter Delivery Address'}
              </Text>
              {savedAddresses.length > 0 && (
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <BlurView intensity={15} tint="light" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={address.fullName}
                  onChangeText={(v) => handleInputChange('fullName', v)}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={address.phone}
                  onChangeText={(v) => handleInputChange('phone', v)}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Line 1 *</Text>
                <TextInput
                  style={styles.input}
                  value={address.addressLine1}
                  onChangeText={(v) => handleInputChange('addressLine1', v)}
                  placeholder="House/Flat No., Building Name, Street"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Line 2</Text>
                <TextInput
                  style={styles.input}
                  value={address.addressLine2}
                  onChangeText={(v) => handleInputChange('addressLine2', v)}
                  placeholder="Area, Colony (Optional)"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Landmark</Text>
                <TextInput
                  style={styles.input}
                  value={address.landmark}
                  onChangeText={(v) => handleInputChange('landmark', v)}
                  placeholder="Near... (Optional)"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.input}
                    value={address.city}
                    onChangeText={(v) => handleInputChange('city', v)}
                    placeholder="City"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput
                    style={styles.input}
                    value={address.state}
                    onChangeText={(v) => handleInputChange('state', v)}
                    placeholder="State"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <TextInput
                  style={[styles.input, { width: '50%' }]}
                  value={address.pincode}
                  onChangeText={(v) => handleInputChange('pincode', v)}
                  placeholder="6-digit pincode"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </BlurView>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <BlurView intensity={20} tint="light" style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerItems}>{items.length} items</Text>
          <Text style={styles.footerTotal}>₹{total}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={showForm || savedAddresses.length === 0 ? handleSaveAndContinue : () => {
            if (selectedAddress) {
              router.push('/checkout/review');
            } else {
              Alert.alert('Select Address', 'Please select a delivery address');
            }
          }}
        >
          <LinearGradient
            colors={['#6BCF7F', '#5AB96D']}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>
              {showForm || savedAddresses.length === 0 ? 'Save & Continue' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(107, 207, 127, 0.05)',
  },
  addressRadio: {
    marginRight: 12,
    paddingTop: 4,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 5,
    borderColor: 'rgba(107, 207, 127, 0.3)',
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textLight,
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  footerItems: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default AddressScreen;
