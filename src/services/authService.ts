import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@sva_auth_state';
const ROLE_STORAGE_KEY = '@sva_user_role';
const USERS_COLLECTION = 'users';

export interface AuthUser {
  uid: string;
  phoneNumber: string;
  role: 'farmer' | 'retailer';
  name?: string;
  gstin?: string;
  shopName?: string;
  shopAddress?: string;
  isVerified?: boolean;
}

// For development/testing - simulate OTP verification
let mockVerificationId: string | null = null;
const MOCK_OTP = '123456';

/**
 * Send OTP to phone number
 * @param phoneNumber - Phone number with country code (e.g., +919876543210)
 * @returns Verification ID for OTP confirmation
 */
export const sendOTP = async (phoneNumber: string): Promise<string> => {
  try {
    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Phone number must include country code (e.g., +91)');
    }

    console.log('🔥 Current ENV:', process.env.EXPO_PUBLIC_APP_ENV);
    console.log('📱 Phone number:', phoneNumber);

    // For development - simulate OTP sending
    if (process.env.EXPO_PUBLIC_APP_ENV === 'development') {
      console.log('🔐 Development mode: OTP sent to', phoneNumber);
      console.log('📱 Use OTP:', MOCK_OTP);
      mockVerificationId = `mock_${Date.now()}`;
      return mockVerificationId;
    }

    // Production: For React Native with Expo, Firebase Phone Auth has limitations
    // Firebase Phone Auth on web requires reCAPTCHA
    // For native apps (not Expo Go), you need to build with EAS and configure properly
    
    console.log('⚠️ Production mode detected');
    console.warn(`
      ⚠️ FIREBASE PHONE AUTH LIMITATION:
      Firebase Phone Auth on Expo/React Native requires:
      1. EAS Build (not Expo Go)
      2. Native configuration (google-services.json for Android)
      3. Or use Firebase Admin SDK on your backend
      
      RECOMMENDED SOLUTION:
      - Build backend API endpoint to send OTP via Firebase Admin SDK
      - Or use third-party SMS service (Twilio, AWS SNS, etc.)
      - Or build with EAS: eas build --platform android
      
      For now, falling back to development mode...
    `);

    // Fallback to development mode for testing
    console.log('🔐 Fallback: Using development mode OTP');
    console.log('📱 Use OTP:', MOCK_OTP);
    mockVerificationId = `mock_${Date.now()}`;
    return mockVerificationId;

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Verify OTP and complete sign in
 * @param verificationId - Verification ID from sendOTP
 * @param otp - OTP code entered by user
 * @param role - User role (farmer or retailer)
 * @param retailerData - Optional retailer data (gstin, shopName)
 * @returns User data
 */
export const verifyOTP = async (
  verificationId: string,
  otp: string,
  role: 'farmer' | 'retailer',
  retailerData?: { gstin?: string; shopName?: string }
): Promise<AuthUser> => {
  try {
    // Development mode - mock verification
    if (process.env.EXPO_PUBLIC_APP_ENV === 'development') {
      if (verificationId !== mockVerificationId) {
        throw new Error('Invalid verification ID');
      }
      if (otp !== MOCK_OTP) {
        throw new Error('Invalid OTP code');
      }

      const mockUser: AuthUser = {
        uid: `mock_user_${Date.now()}`,
        phoneNumber: '+919876543210',
        role,
        ...(role === 'retailer' && retailerData && {
          gstin: retailerData.gstin,
          shopName: retailerData.shopName,
          isVerified: false,
        }),
      };

      // Save user to Firestore
      await saveUserToFirestore(mockUser);

      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      await AsyncStorage.setItem(ROLE_STORAGE_KEY, role);

      return mockUser;
    }

    // Production: Verify with Firebase
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await signInWithCredential(auth, credential);

    const user: AuthUser = {
      uid: userCredential.user.uid,
      phoneNumber: userCredential.user.phoneNumber || '',
      role,
      ...(role === 'retailer' && retailerData && {
        gstin: retailerData.gstin,
        shopName: retailerData.shopName,
        isVerified: false,
      }),
    };

    // Save user to Firestore
    await saveUserToFirestore(user);

    // Save role to AsyncStorage
    await AsyncStorage.setItem(ROLE_STORAGE_KEY, role);

    return user;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error(error.message || 'Invalid OTP code');
  }
};

/**
 * Get stored authentication state
 */
export const getStoredAuthState = async (): Promise<AuthUser | null> => {
  try {
    const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    const role = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
    
    if (authData && role) {
      const parsedData = JSON.parse(authData);
      return {
        ...parsedData,
        role: role as 'farmer' | 'retailer',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting stored auth state:', error);
    return null;
  }
};

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Format phone number with country code
 * @param phone - Phone number (10 digits)
 * @param countryCode - Country code (default: +91 for India)
 */
export const formatPhoneNumber = (phone: string, countryCode: string = '+91'): string => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return '+' + cleanPhone;
  }
  
  return countryCode + cleanPhone;
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10;
};

/**
 * Save user data to Firestore
 */
export const saveUserToFirestore = async (user: AuthUser): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        lastLogin: Timestamp.now(),
        ...(user.gstin && { gstin: user.gstin }),
        ...(user.shopName && { shopName: user.shopName }),
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        role: user.role,
        name: user.role === 'farmer' ? 'Farmer User' : (user.shopName || 'Retailer User'),
        ...(user.role === 'retailer' && {
          gstin: user.gstin || '',
          shopName: user.shopName || '',
          shopAddress: '',
          isVerified: false,
        }),
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
      });
    }
    console.log('User saved to Firestore');
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    // Don't throw error - user can still use the app
  }
};

/**
 * Get user data from Firestore
 */
export const getUserFromFirestore = async (uid: string): Promise<AuthUser | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as AuthUser;
    }
    return null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};

/**
 * Update retailer verification status (for admin use)
 */
export const updateRetailerVerification = async (uid: string, isVerified: boolean): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      isVerified,
      verifiedAt: isVerified ? Timestamp.now() : null,
    });
    console.log('Retailer verification updated');
  } catch (error) {
    console.error('Error updating retailer verification:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string, 
  updates: { name?: string; phoneNumber?: string; profileImage?: string }
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.phoneNumber !== undefined) {
      updateData.phoneNumber = updates.phoneNumber;
    }
    if (updates.profileImage !== undefined) {
      updateData.profileImage = updates.profileImage;
    }

    await updateDoc(userRef, updateData);
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
