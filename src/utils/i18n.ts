
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      welcome: 'Welcome to SVA AgroMart',
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      
      // Navigation
      home: 'Home',
      catalog: 'Catalog',
      forum: 'Forum',
      profile: 'Profile',
      cart: 'Cart',
      
      // Auth
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      phoneNumber: 'Phone Number',
      enterPhone: 'Enter your phone number',
      selectRole: 'Select your role',
      farmer: 'Farmer',
      retailer: 'Retailer',
      admin: 'Admin',
      
      // Home
      goodMorning: 'Good Morning',
      weather: 'Weather',
      categories: 'Categories',
      quickActions: 'Quick Actions',
      seeds: 'Seeds',
      fertilizers: 'Fertilizers',
      pesticides: 'Pesticides',
      cropDetection: 'Crop Disease Detection',
      govtSchemes: 'Government Schemes',
      
      // Products
      products: 'Products',
      addToCart: 'Add to Cart',
      price: 'Price',
      rating: 'Rating',
      reviews: 'Reviews',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      
      // Cart
      cartEmpty: 'Your cart is empty',
      total: 'Total',
      checkout: 'Checkout',
      quantity: 'Quantity',
      
      // Profile
      userProfile: 'User Profile',
      settings: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      
      // Forum
      communityForum: 'Community Forum',
      askQuestion: 'Ask a Question',
      recentPosts: 'Recent Posts',
    },
  },
  hi: {
    translation: {
      // Common
      welcome: 'SVA एग्रोमार्ट में आपका स्वागत है',
      loading: 'लोड हो रहा है...',
      error: 'कुछ गलत हुआ',
      retry: 'पुनः प्रयास करें',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      save: 'सेव करें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      
      // Navigation
      home: 'होम',
      catalog: 'कैटलॉग',
      forum: 'फोरम',
      profile: 'प्रोफाइल',
      cart: 'कार्ट',
      
      // Auth
      login: 'लॉगिन',
      signup: 'साइन अप',
      logout: 'लॉगआउट',
      phoneNumber: 'फोन नंबर',
      enterPhone: 'अपना फोन नंबर दर्ज करें',
      selectRole: 'अपनी भूमिका चुनें',
      farmer: 'किसान',
      retailer: 'रिटेलर',
      admin: 'एडमिन',
      
      // Home
      goodMorning: 'सुप्रभात',
      weather: 'मौसम',
      categories: 'श्रेणियां',
      quickActions: 'त्वरित कार्य',
      seeds: 'बीज',
      fertilizers: 'उर्वरक',
      pesticides: 'कीटनाशक',
      cropDetection: 'फसल रोग पहचान',
      govtSchemes: 'सरकारी योजनाएं',
      
      // Products
      products: 'उत्पाद',
      addToCart: 'कार्ट में जोड़ें',
      price: 'मूल्य',
      rating: 'रेटिंग',
      reviews: 'समीक्षाएं',
      inStock: 'स्टॉक में',
      outOfStock: 'स्टॉक में नहीं',
      
      // Cart
      cartEmpty: 'आपका कार्ट खाली है',
      total: 'कुल',
      checkout: 'चेकआउट',
      quantity: 'मात्रा',
      
      // Profile
      userProfile: 'उपयोगकर्ता प्रोफाइल',
      settings: 'सेटिंग्स',
      language: 'भाषा',
      notifications: 'सूचनाएं',
      
      // Forum
      communityForum: 'समुदायिक फोरम',
      askQuestion: 'प्रश्न पूछें',
      recentPosts: 'हाल की पोस्ट',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
