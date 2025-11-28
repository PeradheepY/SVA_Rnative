
import { Product } from '../store/slices/productSlice';

// Mock data for products
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

export const getProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Fetching products from API');
  return mockProducts;
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log('Fetching products by category:', category);
  return mockProducts.filter(product => product.category === category);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Fetching product by ID:', id);
  return mockProducts.find(product => product.id === id) || null;
};
