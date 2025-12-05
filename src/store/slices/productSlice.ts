
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
  quantity?: number;
  retailerId?: string;
  retailerName?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  selectedCategory: string | null;
  searchQuery: string;
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  loading: false,
  selectedCategory: null,
  searchQuery: '',
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
      state.filteredProducts = action.payload;
      state.loading = false;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      // Filter products based on search query
      if (!action.payload.trim()) {
        state.filteredProducts = state.products;
      } else {
        const query = action.payload.toLowerCase().trim();
        state.filteredProducts = state.products.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.filteredProducts = state.products;
    },
  },
});

export const { setLoading, setProducts, setSelectedCategory, setSearchQuery, clearSearch } = productSlice.actions;
export default productSlice.reducer;
