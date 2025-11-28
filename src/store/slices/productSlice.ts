
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'seeds' | 'fertilizers' | 'pesticides';
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  selectedCategory: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  selectedCategory: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setLoading, setProducts, setSelectedCategory } = productSlice.actions;
export default productSlice.reducer;
