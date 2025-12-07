
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  uid: string;
  name: string;
  phoneNumber: string;
  role: 'farmer' | 'retailer';
  profileImage?: string;
  // Retailer specific fields
  gstin?: string;
  shopName?: string;
  shopAddress?: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  verificationId: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  verificationId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setVerificationId: (state, action: PayloadAction<string>) => {
      state.verificationId = action.payload;
      state.loading = false;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.verificationId = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.verificationId = null;
    },
    restoreAuth: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setVerificationId, 
  loginSuccess, 
  logout, 
  restoreAuth,
  updateProfile
} = authSlice.actions;
export default authSlice.reducer;
