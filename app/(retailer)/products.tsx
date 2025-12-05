import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { RootState } from '../../src/store';
import { IconSymbol } from '../../components/IconSymbol';
import { colors } from '../../styles/commonStyles';
import { getProductsByRetailer, updateProduct, deleteProduct } from '../../src/services/productService';
import { Product } from '../../src/store/slices/productSlice';

const ProductsScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      if (user?.uid) {
        const data = await getProductsByRetailer(user.uid);
        setProducts(data);
      }
    } catch (error) {
      console.log('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleToggleStock = async (product: Product) => {
    try {
      await updateProduct(product.id, { inStock: !product.inStock });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, inStock: !p.inStock } : p
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock status');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <BlurView intensity={15} tint="light" style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
      </View>

      <View style={styles.productActions}>
        {/* Stock Toggle */}
        <TouchableOpacity
          style={[
            styles.stockBadge,
            item.inStock ? styles.inStockBadge : styles.outOfStockBadge,
          ]}
          onPress={() => handleToggleStock(item)}
        >
          <Text style={styles.stockText}>
            {item.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => {
              // Navigate to edit screen (can be implemented later)
              Alert.alert('Coming Soon', 'Edit functionality coming soon!');
            }}
          >
            <IconSymbol name="pencil" size={16} color="#2196F3" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteProduct(item)}
          >
            <IconSymbol name="trash.fill" size={16} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6BCF7F', '#4CAF50']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Products</Text>
          <Text style={styles.headerSubtitle}>{products.length} products listed</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(retailer)/add-product')}
        >
          <BlurView intensity={20} style={styles.addBtnBlur}>
            <IconSymbol name="plus" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterText, styles.filterTextActive]}>All ({products.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterText}>In Stock ({products.filter(p => p.inStock).length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterText}>Out ({products.filter(p => !p.inStock).length})</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Products Yet</Text>
            <Text style={styles.emptyText}>
              Start adding products to your inventory
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(retailer)/add-product')}
            >
              <LinearGradient
                colors={['#6BCF7F', '#4CAF50']}
                style={styles.emptyButtonGradient}
              >
                <IconSymbol name="plus" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Add First Product</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {},
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  addBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  addBtnBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  productCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  productActions: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  inStockBadge: {
    backgroundColor: '#4CAF50' + '20',
  },
  outOfStockBadge: {
    backgroundColor: '#FF5252' + '20',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#2196F3' + '20',
  },
  deleteBtn: {
    backgroundColor: '#FF5252' + '20',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ProductsScreen;
