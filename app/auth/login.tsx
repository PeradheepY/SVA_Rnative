
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, commonStyles } from '../../styles/commonStyles';
import { setLoading, setVerificationId, setError } from '../../src/store/slices/authSlice';
import CustomButton from '../../src/components/CustomButton';
import InputField from '../../src/components/InputField';
import { sendOTP, formatPhoneNumber, validatePhoneNumber } from '../../src/services/authService';

const LoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'retailer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleSendOTP = async () => {
    if (!phoneNumber || !selectedRole) {
      Alert.alert('Error', 'Please enter phone number and select role');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const verificationId = await sendOTP(formattedPhone);
      
      dispatch(setVerificationId(verificationId));
      
      // Navigate to OTP verification screen
      router.push({
        pathname: '/auth/verify-otp',
        params: {
          phoneNumber: formattedPhone,
          verificationId,
          role: selectedRole,
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.form}>
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
                onPress={() => setSelectedRole('farmer')}
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

          <CustomButton
            title="Send OTP"
            onPress={handleSendOTP}
            loading={isLoading}
            disabled={!phoneNumber || !selectedRole}
            style={styles.loginButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
  loginButton: {
    marginTop: 32,
  },
});

export default LoginScreen;
