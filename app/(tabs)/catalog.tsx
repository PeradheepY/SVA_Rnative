
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootState } from '../../src/store';
import { setProducts, setLoading, setSelectedCategory } from '../../src/store/slices/productSlice';
import { getProducts, getProductsByCategory } from '../../src/services/productService';
import { colors, commonStyles } from '../../styles/commonStyles';
import ProductCard from '../../src/components/ProductCard';
import { IconSymbol } from '../../components/IconSymbol';

const { width } = Dimensions.get('window');

const CatalogScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { category } = useLocalSearchParams();
  const { products, loading, selectedCategory } = useSelector((state: RootState) => state.products);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const categories = [
    { key: null, label: 'All' },
    { key: 'seeds', label: t('seeds') },
    { key: 'fertilizers', label: t('fertilizers') },
    { key: 'pesticides', label: t('pesticides') },
  ];

  const loadProducts = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const currentCategory = category || selectedCategory;
      const productsData = currentCategory 
        ? await getProductsByCategory(currentCategory as string)
        : await getProducts();
      dispatch(setProducts(productsData));
    } catch (error) {
      console.log('Error loading products:', error);
    }
  }, [category, selectedCategory, dispatch]);

  useEffect(() => {
    if (category) {
      dispatch(setSelectedCategory(category as string));
    }
    loadProducts();
  }, [category, dispatch, loadProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryKey: string | null) => {
    dispatch(setSelectedCategory(categoryKey));
    if (categoryKey) {
      router.setParams({ category: categoryKey });
    } else {
      router.setParams({ category: undefined });
    }
  };

  const navigateToProduct = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard
      product={item}
      onPress={() => navigateToProduct(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <LinearGradient
          colors={['#6BCF7F', '#5AB96D']}
          style={styles.gradientHeader}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>🛒 Shop</Text>
              <Text style={styles.headerSubtitle}>Premium Quality Products</Text>
            </View>
            <TouchableOpacity style={styles.cartButton}>
              <BlurView intensity={20} style={styles.cartBlur}>
                <IconSymbol name="cart.fill" size={22} color="#fff" />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>3</Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
          
          <BlurView intensity={15} tint="light" style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search products...</Text>
          </BlurView>
        </LinearGradient>

        {/* Fixed Categories */}
        <View style={styles.categoriesSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.key || 'all'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  (selectedCategory === item.key) && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryPress(item.key)}
              >
                <BlurView 
                  intensity={(selectedCategory === item.key) ? 0 : 15} 
                  tint="light" 
                  style={styles.categoryChipBlur}
                >
                  {(selectedCategory === item.key) && (
                    <LinearGradient
                      colors={['#6BCF7F', '#5AB96D']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[
                    styles.categoryChipText,
                    (selectedCategory === item.key) && styles.categoryChipTextActive
                  ]}>
                    {item.label}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      </View>

      {/* Scrollable Product List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  fixedHeader: {
    zIndex: 10,
    elevation: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  gradientHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  cartButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cartBlur: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
  },
  categoriesSection: {
    paddingTop: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryChipBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  categoryChipActive: {
    // Active state handled by gradient
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
});

export default CatalogScreen;
