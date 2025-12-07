
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productSlice from './slices/productSlice';
import cartSlice from './slices/cartSlice';
import cropDiseaseSlice from './slices/cropDiseaseSlice';
import orderSlice from './slices/orderSlice';
import fieldSlice from './slices/fieldSlice';
import addressSlice from './slices/addressSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    cart: cartSlice,
    cropDisease: cropDiseaseSlice,
    orders: orderSlice,
    field: fieldSlice,
    address: addressSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
