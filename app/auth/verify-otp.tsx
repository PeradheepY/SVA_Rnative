
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, commonStyles } from '../../styles/commonStyles';
import { loginSuccess, setLoading, setError } from '../../src/store/slices/authSlice';
import CustomButton from '../../src/components/CustomButton';
import { verifyOTP } from '../../src/services/authService';

const OTPVerificationScreen: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoadingState] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  const phoneNumber = params.phoneNumber as string;
  const verificationId = params.verificationId as string;
  const role = params.role as 'farmer' | 'retailer';
  // Retailer specific params
  const gstin = params.gstin as string | undefined;
  const shopName = params.shopName as string | undefined;

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      const user = await verifyOTP(verificationId, otpCode, role);
      
      const userWithDetails = {
        ...user,
        name: role === 'farmer' ? 'Farmer User' : (shopName || 'Retailer User'),
        ...(role === 'retailer' && {
          gstin: gstin,
          shopName: shopName,
          isVerified: false, // Admin will verify the retailer
        }),
      };

      dispatch(loginSuccess(userWithDetails));
      
      // Navigate based on role
      if (role === 'retailer') {
        router.replace('/(retailer)/dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      dispatch(setError(error.message));
      Alert.alert('Verification Failed', error.message || 'Invalid OTP code');
      setLoadingState(false);
    }
  };

  const handleResendOtp = () => {
    if (timer > 0) {
      Alert.alert('Wait', `Please wait ${timer} seconds before resending OTP`);
      return;
    }

    Alert.alert('Success', 'OTP resent successfully');
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {process.env.EXPO_PUBLIC_APP_ENV === 'development' && (
          <View style={styles.devNote}>
            <Text style={styles.devNoteText}>🔧 Development Mode</Text>
            <Text style={styles.devNoteText}>Use OTP: 123456</Text>
          </View>
        )}

        <CustomButton
          title="Verify OTP"
          onPress={handleVerifyOtp}
          loading={loading}
          disabled={otp.join('').length !== 6}
          style={styles.verifyButton}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResendOtp}
            disabled={timer > 0}
          >
            <Text style={[
              styles.resendLink,
              timer > 0 && styles.resendLinkDisabled
            ]}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Change Phone Number</Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  subtitle: {
    ...commonStyles.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: colors.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.backgroundAlt,
  },
  devNote: {
    backgroundColor: colors.warning,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  devNoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  resendLinkDisabled: {
    color: colors.textSecondary,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default OTPVerificationScreen;
