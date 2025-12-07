import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../src/store';
import {
  addAddress,
  modifyAddress,
  selectAllAddresses,
} from '../../src/store/slices/addressSlice';
import { colors } from '../../styles/commonStyles';

export default function AddEditAddressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const addresses = useSelector(selectAllAddresses);
  const dispatch = useDispatch<AppDispatch>();

  const existingAddress = id ? addresses.find((addr) => addr.id === id) : null;
  const isEdit = !!existingAddress;

  const [name, setName] = useState(existingAddress?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(existingAddress?.phoneNumber || '');
  const [addressLine1, setAddressLine1] = useState(existingAddress?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(existingAddress?.addressLine2 || '');
  const [city, setCity] = useState(existingAddress?.city || '');
  const [state, setState] = useState(existingAddress?.state || '');
  const [pincode, setPincode] = useState(existingAddress?.pincode || '');
  const [landmark, setLandmark] = useState(existingAddress?.landmark || '');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>(
    existingAddress?.addressType || 'Home'
  );
  const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter recipient name');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }
    if (!addressLine1.trim()) {
      Alert.alert('Error', 'Please enter address');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return;
    }
    if (!state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Error', 'Please enter valid 6-digit pincode');
      return;
    }

    try {
      setSaving(true);

      if (isEdit && existingAddress) {
        await dispatch(
          modifyAddress({
            addressId: existingAddress.id,
            updates: {
              name,
              phoneNumber,
              addressLine1,
              addressLine2: addressLine2 || undefined,
              city,
              state,
              pincode,
              landmark: landmark || undefined,
              addressType,
              isDefault,
              userId: user!.uid,
            },
          })
        );
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await dispatch(
          addAddress({
            userId: user!.uid,
            name,
            phoneNumber,
            addressLine1,
            addressLine2: addressLine2 || undefined,
            city,
            state,
            pincode,
            landmark: landmark || undefined,
            addressType,
            isDefault,
          })
        );
        Alert.alert('Success', 'Address added successfully');
      }

      router.back();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Address' : 'Add New Address'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address Type */}
        <Text style={styles.sectionTitle}>Address Type</Text>
        <View style={styles.typeContainer}>
          {(['Home', 'Work', 'Other'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, addressType === type && styles.typeButtonActive]}
              onPress={() => setAddressType(type)}
            >
              <Ionicons
                name={type === 'Home' ? 'home' : type === 'Work' ? 'briefcase' : 'location'}
                size={20}
                color={addressType === type ? '#fff' : colors.primary}
              />
              <Text
                style={[styles.typeText, addressType === type && styles.typeTextActive]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter recipient name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Line 1 *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="House No., Building Name"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Road name, Area, Colony (Optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="Enter state"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={setPincode}
              placeholder="Enter 6-digit pincode"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Landmark</Text>
            <TextInput
              style={styles.input}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Near famous place (Optional)"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Default Address Toggle */}
          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() => setIsDefault(!isDefault)}
          >
            <View style={styles.defaultLeft}>
              <Ionicons
                name={isDefault ? 'checkbox' : 'square-outline'}
                size={24}
                color={colors.primary}
              />
              <Text style={styles.defaultLabel}>Set as default address</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveGradient}
          >
            {saving ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.saveText}>Saving...</Text>
              </>
            ) : (
              <Text style={styles.saveText}>Save Address</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  typeTextActive: {
    color: '#fff',
  },
  form: {
    marginTop: 24,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  defaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
