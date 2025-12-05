import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { RootState } from '../../src/store';
import { IconSymbol } from '../../components/IconSymbol';
import { colors } from '../../styles/commonStyles';
import InputField from '../../src/components/InputField';
import CustomButton from '../../src/components/CustomButton';
import { addProduct } from '../../src/services/productService';
import { uploadProductImage } from '../../src/services/storageService';

const AddProductScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '' as 'seeds' | 'fertilizers' | 'pesticides' | '',
    quantity: '',
  });

  const categories = [
    { key: 'seeds', label: 'Seeds', icon: '🌱' },
    { key: 'fertilizers', label: 'Fertilizers', icon: '🧪' },
    { key: 'pesticides', label: 'Pesticides', icon: '🛡️' },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter product description');
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      Alert.alert('Error', 'Please enter valid quantity');
      return false;
    }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400';
      
      // Upload image to Firebase Storage if user selected one
      if (productImage) {
        try {
          setUploadingImage(true);
          imageUrl = await uploadProductImage(
            productImage,
            formData.name,
            user?.uid || 'unknown'
          );
          setUploadingImage(false);
        } catch (uploadError) {
          console.log('Image upload failed, using fallback:', uploadError);
          // Continue with fallback image
          setUploadingImage(false);
        }
      }

      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        category: formData.category as 'seeds' | 'fertilizers' | 'pesticides',
        image: imageUrl,
        rating: 0,
        reviews: 0,
        inStock: parseInt(formData.quantity) > 0,
        quantity: parseInt(formData.quantity),
        retailerId: user?.uid || '',
        retailerName: user?.shopName || user?.name || 'Unknown',
      };

      await addProduct(productData);
      
      Alert.alert(
        'Success! 🎉',
        'Product added successfully. It will be visible to farmers.',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({ name: '', price: '', description: '', category: '', quantity: '' });
              setProductImage(null);
            },
          },
          {
            text: 'View Products',
            onPress: () => router.push('/(retailer)/products'),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={['#6BCF7F', '#4CAF50']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={uploadingImage}>
          {productImage ? (
            <>
              <Image source={{ uri: productImage }} style={styles.productImage} />
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <IconSymbol name="camera.fill" size={40} color={colors.textSecondary} />
              <Text style={styles.imagePickerText}>Tap to add product image</Text>
              <Text style={styles.imageHint}>Image will be stored in cloud</Text>
            </View>
          )}
          <View style={styles.imagePickerBadge}>
            <IconSymbol name="plus" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Form */}
        <BlurView intensity={15} tint="light" style={styles.formCard}>
          <InputField
            label="Product Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Premium Wheat Seeds"
          />

          <InputField
            label="Price (₹)"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9.]/g, '') })}
            placeholder="Enter price"
            keyboardType="numeric"
          />

          <InputField
            label="Stock Quantity"
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text.replace(/[^0-9]/g, '') })}
            placeholder="Enter available quantity"
            keyboardType="numeric"
          />

          {/* Category Selection */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    formData.category === cat.key && styles.categoryChipActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat.key as any })}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === cat.key && styles.categoryTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe your product..."
            multiline
          />
        </BlurView>

        {/* Submit Button */}
        <CustomButton
          title="Add Product"
          onPress={handleAddProduct}
          loading={loading}
          style={styles.submitButton}
        />

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.grey,
    borderStyle: 'dashed',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePickerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  imageHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  imagePickerBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  categorySection: {
    marginVertical: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.primary,
  },
  submitButton: {
    marginTop: 10,
  },
});

export default AddProductScreen;
