import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Address,
  AddressInput,
  createAddress,
  getUserAddresses,
  getDefaultAddress,
  updateAddress,
  deleteAddress,
} from '../../services/addressService';

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  defaultAddress: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserAddresses = createAsyncThunk(
  'address/fetchUserAddresses',
  async (userId: string) => {
    return await getUserAddresses(userId);
  }
);

export const fetchDefaultAddress = createAsyncThunk(
  'address/fetchDefaultAddress',
  async (userId: string) => {
    return await getDefaultAddress(userId);
  }
);

export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (addressData: AddressInput) => {
    const addressId = await createAddress(addressData);
    return { id: addressId, ...addressData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
);

export const modifyAddress = createAsyncThunk(
  'address/modifyAddress',
  async ({ addressId, updates }: { addressId: string; updates: Partial<Address> }) => {
    await updateAddress(addressId, updates);
    return { addressId, updates };
  }
);

export const removeAddress = createAsyncThunk(
  'address/removeAddress',
  async (addressId: string) => {
    await deleteAddress(addressId);
    return addressId;
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user addresses
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.defaultAddress = action.payload.find((addr) => addr.isDefault) || null;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch addresses';
      })
      // Fetch default address
      .addCase(fetchDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultAddress = action.payload;
      })
      .addCase(fetchDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch default address';
      })
      // Add address
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload as Address);
        if (action.payload.isDefault) {
          state.defaultAddress = action.payload as Address;
        }
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add address';
      })
      // Modify address
      .addCase(modifyAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyAddress.fulfilled, (state, action) => {
        state.loading = false;
        const { addressId, updates } = action.payload;
        const index = state.addresses.findIndex((addr) => addr.id === addressId);
        if (index !== -1) {
          state.addresses[index] = { ...state.addresses[index], ...updates };
          if (updates.isDefault) {
            state.defaultAddress = state.addresses[index];
          }
        }
      })
      .addCase(modifyAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update address';
      })
      // Remove address
      .addCase(removeAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter((addr) => addr.id !== action.payload);
        if (state.defaultAddress?.id === action.payload) {
          state.defaultAddress = null;
        }
      })
      .addCase(removeAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete address';
      });
  },
});

export const { setSelectedAddress, clearAddressError } = addressSlice.actions;

export default addressSlice.reducer;

// Selectors
export const selectAllAddresses = (state: { address: AddressState }) => state.address.addresses;
export const selectSelectedAddress = (state: { address: AddressState }) => state.address.selectedAddress;
export const selectDefaultAddress = (state: { address: AddressState }) => state.address.defaultAddress;
export const selectAddressLoading = (state: { address: AddressState }) => state.address.loading;
export const selectAddressError = (state: { address: AddressState }) => state.address.error;
