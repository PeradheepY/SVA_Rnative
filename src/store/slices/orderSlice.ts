import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, DeliveryAddress } from '../../services/orderService';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  savedAddresses: DeliveryAddress[];
  selectedAddress: DeliveryAddress | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  savedAddresses: [],
  selectedAddress: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.loading = false;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
      state.currentOrder = action.payload;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    // Address management
    addAddress: (state, action: PayloadAction<DeliveryAddress>) => {
      state.savedAddresses.push(action.payload);
    },
    removeAddress: (state, action: PayloadAction<number>) => {
      state.savedAddresses.splice(action.payload, 1);
    },
    setSelectedAddress: (state, action: PayloadAction<DeliveryAddress | null>) => {
      state.selectedAddress = action.payload;
    },
    setSavedAddresses: (state, action: PayloadAction<DeliveryAddress[]>) => {
      state.savedAddresses = action.payload;
    },
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearOrderState: (state) => {
      state.currentOrder = null;
      state.selectedAddress = null;
      state.error = null;
    },
  },
});

export const {
  setOrders,
  addOrder,
  setCurrentOrder,
  updateOrderInList,
  addAddress,
  removeAddress,
  setSelectedAddress,
  setSavedAddresses,
  setLoading,
  setError,
  clearOrderState,
} = orderSlice.actions;

export default orderSlice.reducer;
