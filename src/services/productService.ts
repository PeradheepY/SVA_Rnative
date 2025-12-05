
import { Product } from '../store/slices/productSlice';
import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';

// Mock data for fallback when Firestore is empty or unavailable
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wheat Seeds',
    price: 450,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    category: 'seeds',
    description: 'High-quality wheat seeds with excellent yield potential. Suitable for all soil types.',
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: '2',
    name: 'Organic Rice Seeds',
    price: 380,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    category: 'seeds',
    description: 'Certified organic rice seeds for sustainable farming practices.',
    rating: 4.7,
    reviews: 95,
    inStock: true,
  },
  {
    id: '3',
    name: 'NPK Fertilizer',
    price: 850,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    category: 'fertilizers',
    description: 'Balanced NPK fertilizer for healthy plant growth and maximum yield.',
    rating: 4.3,
    reviews: 203,
    inStock: true,
  },
  {
    id: '4',
    name: 'Organic Compost',
    price: 320,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    category: 'fertilizers',
    description: 'Natural organic compost to improve soil health and fertility.',
    rating: 4.6,
    reviews: 156,
    inStock: true,
  },
  {
    id: '5',
    name: 'Bio Pesticide',
    price: 680,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    category: 'pesticides',
    description: 'Eco-friendly bio pesticide for effective pest control without harmful chemicals.',
    rating: 4.4,
    reviews: 87,
    inStock: true,
  },
  {
    id: '6',
    name: 'Insect Repellent Spray',
    price: 420,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    category: 'pesticides',
    description: 'Safe and effective insect repellent spray for crop protection.',
    rating: 4.2,
    reviews: 74,
    inStock: false,
  },
];

// Fetch all products from Firestore
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Firestore');
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    
    // Try with ordering first, fallback to simple query if index doesn't exist
    let querySnapshot;
    try {
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      console.log('Index not ready, fetching without order:', indexError.message);
      // Fallback: fetch without ordering
      querySnapshot = await getDocs(productsRef);
    }
    
    if (querySnapshot.empty) {
      console.log('No products in Firestore, returning mock data');
      return mockProducts;
    }
    
    const products: Product[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    
    console.log(`Fetched ${products.length} products from Firestore`);
    return products;
  } catch (error: any) {
    console.log('Error fetching products from Firestore:', error.message);
    // Fallback to mock data
    return mockProducts;
  }
};

// Fetch products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    console.log('Fetching products by category:', category);
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    
    // Try with composite index first, fallback to simple where clause
    let querySnapshot;
    try {
      const q = query(
        productsRef,
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      console.log('Composite index not ready, using simple query:', indexError.message);
      // Fallback: just filter by category without ordering
      const q = query(productsRef, where('category', '==', category));
      querySnapshot = await getDocs(q);
    }
    
    if (querySnapshot.empty) {
      console.log('No products for category in Firestore, filtering mock data');
      return mockProducts.filter(product => product.category === category);
    }
    
    const products: Product[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    
    return products;
  } catch (error: any) {
    console.log('Error fetching products by category:', error.message);
    return mockProducts.filter(product => product.category === category);
  }
};

// Fetch single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    console.log('Fetching product by ID:', id);
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    
    // Fallback to mock data
    return mockProducts.find(product => product.id === id) || null;
  } catch (error) {
    console.log('Error fetching product by ID:', error);
    return mockProducts.find(product => product.id === id) || null;
  }
};

// Search products by name (client-side filtering)
export const searchProducts = async (searchQuery: string): Promise<Product[]> => {
  try {
    console.log('Searching products:', searchQuery);
    const allProducts = await getProducts();
    
    if (!searchQuery.trim()) {
      return allProducts;
    }
    
    const lowerQuery = searchQuery.toLowerCase().trim();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.log('Error searching products:', error);
    return [];
  }
};

// ============ RETAILER FUNCTIONS ============

// Add a new product (for retailers)
export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  try {
    console.log('Adding new product to Firestore:', product.name);
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    
    const productData = {
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      inStock: product.inStock ?? true,
      quantity: product.quantity || 0,
      retailerId: product.retailerId || '',
      retailerName: product.retailerName || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(productsRef, productData);
    console.log('✅ Product added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding product:', error.message);
    throw new Error(`Failed to add product: ${error.message}`);
  }
};

// Update an existing product (for retailers)
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    console.log('Updating product:', id);
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    console.log('Product updated successfully');
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product (for retailers)
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    console.log('Deleting product:', id);
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get products by retailer ID
export const getProductsByRetailer = async (retailerId: string): Promise<Product[]> => {
  try {
    console.log('Fetching products for retailer:', retailerId);
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    
    // Try with composite index first, fallback to simple where clause
    let querySnapshot;
    try {
      const q = query(
        productsRef,
        where('retailerId', '==', retailerId),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      console.log('Composite index not ready, using simple query:', indexError.message);
      // Fallback: just filter by retailerId without ordering
      const q = query(productsRef, where('retailerId', '==', retailerId));
      querySnapshot = await getDocs(q);
    }
    
    const products: Product[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    
    console.log(`Found ${products.length} products for retailer`);
    return products;
  } catch (error: any) {
    console.log('Error fetching retailer products:', error.message);
    return [];
  }
};
