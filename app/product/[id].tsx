
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Product } from '../../src/store/slices/productSlice';
import { addToCart } from '../../src/store/slices/cartSlice';
import { getProductById } from '../../src/services/productService';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const loadProduct = useCallback(async () => {
    try {
      const productData = await getProductById(id as string);
      setProduct(productData);
    } catch (error) {
      console.log('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      console.log('Added to cart:', product.name);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, commonStyles.center]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, commonStyles.center]}>
        <Text>Product not found</Text>
        <CustomButton title="Go Back" onPress={handleBack} style={styles.backButton} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={['#6BCF7F', '#5AB96D']}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <BlurView intensity={20} style={styles.headerButtonBlur}>
              <IconSymbol name="chevron.left" size={20} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity style={styles.headerButton}>
            <BlurView intensity={20} style={styles.headerButtonBlur}>
              <IconSymbol name="heart" size={20} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {/* Product Image with Blur Overlay */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          
          {/* Stock Badge */}
          {product.inStock && (
            <BlurView intensity={20} tint="light" style={styles.stockBadge}>
              <View style={styles.stockDot} />
              <Text style={styles.stockBadgeText}>In Stock</Text>
            </BlurView>
          )}
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          <BlurView intensity={15} tint="light" style={styles.infoBlur}>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.productPrice}>₹{product.price}</Text>
              </View>
              
              <View style={styles.ratingCard}>
                <IconSymbol name="star.fill" size={18} color="#FFB74D" />
                <Text style={styles.ratingValue}>{product.rating}</Text>
                <Text style={styles.ratingReviews}>({product.reviews})</Text>
              </View>
            </View>

            {/* Category Badge */}
            <View style={styles.categoryRow}>
              <BlurView intensity={10} tint="light" style={styles.categoryBadge}>
                <IconSymbol name="tag.fill" size={14} color={colors.primary} />
                <Text style={styles.categoryText}>{product.category}</Text>
              </BlurView>
            </View>
          </BlurView>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <BlurView intensity={15} tint="light" style={styles.descriptionBlur}>
            <View style={styles.descriptionHeader}>
              <IconSymbol name="doc.text.fill" size={20} color={colors.primary} />
              <Text style={styles.descriptionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{product.description}</Text>
          </BlurView>
        </View>

        {/* Features Card */}
        <View style={styles.featuresCard}>
          <BlurView intensity={15} tint="light" style={styles.featuresBlur}>
            <Text style={styles.featuresTitle}>✨ Key Features</Text>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>100% Organic & Certified</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Fast Delivery Available</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Quality Guaranteed</Text>
            </View>
          </BlurView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Premium Footer with Gradient Add to Cart Button */}
      <BlurView intensity={20} tint="light" style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerPriceSection}>
            <Text style={styles.footerPriceLabel}>Total Price</Text>
            <Text style={styles.footerPrice}>₹{product.price}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            <LinearGradient
              colors={product.inStock ? ['#6BCF7F', '#5AB96D'] : ['#ccc', '#999']}
              style={styles.addToCartGradient}
            >
              <IconSymbol name="cart.fill.badge.plus" size={20} color="#fff" />
              <Text style={styles.addToCartText}>{t('addToCart')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  gradientHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 320,
  },
  productImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  stockBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusGood,
    marginRight: 8,
  },
  stockBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.statusGood,
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoBlur: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 6,
  },
  ratingReviews: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  categoryRow: {
    flexDirection: 'row',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  descriptionCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionBlur: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 10,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  featuresCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresBlur: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  footerPriceSection: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  addToCartButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
});

export default ProductDetailScreen;
