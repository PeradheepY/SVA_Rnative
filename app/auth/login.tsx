
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, commonStyles } from '../../styles/commonStyles';
import { setLoading, setVerificationId, setError } from '../../src/store/slices/authSlice';
import CustomButton from '../../src/components/CustomButton';
import InputField from '../../src/components/InputField';
import { sendOTP, formatPhoneNumber, validatePhoneNumber } from '../../src/services/authService';

// GSTIN format: 2 digits state code + 10 char PAN + 1 char entity + 1 char check
const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
};

const LoginScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'retailer' | null>(null);
  const [gstin, setGstin] = useState('');
  const [shopName, setShopName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleSendOTP = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!phoneNumber || !selectedRole) {
      Alert.alert('Error', 'Please enter phone number and select role');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    // Validate retailer specific fields
    if (selectedRole === 'retailer') {
      if (!gstin.trim()) {
        Alert.alert('Error', 'Please enter your GSTIN number');
        return;
      }
      if (!validateGSTIN(gstin)) {
        Alert.alert('Error', 'Please enter a valid 15-digit GSTIN number');
        return;
      }
      if (!shopName.trim()) {
        Alert.alert('Error', 'Please enter your shop name');
        return;
      }
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const verificationId = await sendOTP(formattedPhone);
      
      dispatch(setVerificationId(verificationId));
      
      // Navigate to OTP verification screen with user data
      router.push({
        pathname: '/auth/verify-otp',
        params: {
          name: name.trim(),
          phoneNumber: formattedPhone,
          verificationId,
          role: selectedRole,
          ...(selectedRole === 'retailer' && {
            gstin: gstin.toUpperCase(),
            shopName: shopName,
          }),
        },
      });
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Send OTP error:', error);
      dispatch(setError(error.message));
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!name.trim() || !phoneNumber || !selectedRole) return false;
    if (selectedRole === 'retailer' && (!gstin.trim() || !shopName.trim())) return false;
    return true;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>🌱</Text>
            <Text style={styles.title}>{t('welcome')}</Text>
            <Text style={styles.subtitle}>Login to continue</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />

            <InputField
              label={t('phoneNumber')}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>{t('selectRole')}</Text>
              <View style={styles.roleButtons}>
                <CustomButton
                  title={t('farmer')}
                  onPress={() => {
                    setSelectedRole('farmer');
                    setGstin('');
                    setShopName('');
                  }}
                  variant={selectedRole === 'farmer' ? 'primary' : 'secondary'}
                  style={styles.roleButton}
                />
                <CustomButton
                  title={t('retailer')}
                  onPress={() => setSelectedRole('retailer')}
                  variant={selectedRole === 'retailer' ? 'primary' : 'secondary'}
                  style={styles.roleButton}
                />
              </View>
            </View>

            {/* Retailer Registration Fields */}
            {selectedRole === 'retailer' && (
              <View style={styles.retailerSection}>
                <View style={styles.retailerBadge}>
                  <Text style={styles.retailerBadgeIcon}>🏪</Text>
                  <Text style={styles.retailerBadgeText}>Retailer Registration</Text>
                </View>
                
                <InputField
                  label="Shop Name"
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="Enter your shop/business name"
                />

                <InputField
                  label="GSTIN Number"
                  value={gstin}
                  onChangeText={(text) => setGstin(text.toUpperCase())}
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  maxLength={15}
                />
                
                <Text style={styles.gstinHint}>
                  💡 GSTIN is a 15-digit unique identification number for GST registered businesses
                </Text>
              </View>
            )}

            <CustomButton
              title="Send OTP"
              onPress={handleSendOTP}
              loading={isLoading}
              disabled={!isFormValid()}
              style={styles.loginButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...commonStyles.title,
    textAlign: 'center',
  },
  subtitle: {
    ...commonStyles.text,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  roleSection: {
    marginVertical: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    width: '48%',
  },
  retailerSection: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  retailerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  retailerBadgeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  retailerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  gstinHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 32,
  },
});

export default LoginScreen;
