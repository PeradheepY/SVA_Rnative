import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../src/store';
import { clearCart } from '../../src/store/slices/cartSlice';
import { addOrder, clearOrderState } from '../../src/store/slices/orderSlice';
import { 
  createOrder, 
  sendOrderToWhatsApp,
  Order,
  OrderItem 
} from '../../src/services/orderService';
import { colors } from '../../styles/commonStyles';

// Default WhatsApp number for orders (can be changed per retailer)
const DEFAULT_WHATSAPP_NUMBER = '6382228364'; // Replace with actual number

const ReviewOrderScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { selectedAddress } = useSelector((state: RootState) => state.orders);
  
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleEditAddress = () => {
    router.back();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please add a delivery address');
      router.back();
      return;
    }

    setLoading(true);

    try {
      // Prepare order items
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.id,
        productName: item.name,
        productImage: item.image,
        price: item.price,
        quantity: item.quantity,
        retailerId: item.retailerId || 'unknown',
        retailerName: item.retailerName || 'SVA AgroMart',
      }));

      // Create order data
      const orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
        userId: user?.uid || 'guest',
        userName: user?.name || selectedAddress.fullName,
        userPhone: user?.phoneNumber || selectedAddress.phone,
        items: orderItems,
        deliveryAddress: selectedAddress,
        totalAmount: total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'whatsapp_cod',
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      // Create order in Firestore
      const createdOrder = await createOrder(orderData);
      
      // Add to Redux store
      dispatch(addOrder(createdOrder));

      // Send to WhatsApp
      const whatsappSent = await sendOrderToWhatsApp(createdOrder, DEFAULT_WHATSAPP_NUMBER);

      if (whatsappSent) {
        // Clear cart after successful order
        dispatch(clearCart());
        
        // Navigate to success page
        router.replace({
          pathname: '/checkout/success',
          params: { 
            orderNumber: createdOrder.orderNumber,
            orderId: createdOrder.id 
          }
        });
      } else {
        Alert.alert(
          'WhatsApp Not Available',
          'Order placed successfully! Your order number is: ' + createdOrder.orderNumber + 
          '\n\nPlease contact us manually to confirm your order.',
          [
            {
              text: 'OK',
              onPress: () => {
                dispatch(clearCart());
                router.replace({
                  pathname: '/checkout/success',
                  params: { 
                    orderNumber: createdOrder.orderNumber,
                    orderId: createdOrder.id 
                  }
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedAddress) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No address selected</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back to add address</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6BCF7F', '#5AB96D']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <BlurView intensity={20} style={styles.headerButtonBlur}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Order</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={handleEditAddress}>
              <Text style={styles.editText}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <BlurView intensity={15} tint="light" style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name="location" size={24} color={colors.primary} />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
              <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
              <Text style={styles.addressText}>
                {selectedAddress.addressLine1}
                {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}
              </Text>
              <Text style={styles.addressText}>
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </Text>
              {selectedAddress.landmark && (
                <Text style={styles.landmark}>Near {selectedAddress.landmark}</Text>
              )}
            </View>
          </BlurView>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
          
          <BlurView intensity={15} tint="light" style={styles.itemsCard}>
            {items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.orderItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
                {index < items.length - 1 && <View style={styles.itemDivider} />}
              </View>
            ))}
          </BlurView>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <BlurView intensity={15} tint="light" style={styles.notesCard}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special instructions for your order..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </BlurView>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <BlurView intensity={15} tint="light" style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <View style={styles.whatsappIcon}>
                <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              </View>
              <View style={styles.paymentContent}>
                <Text style={styles.paymentTitle}>Order via WhatsApp</Text>
                <Text style={styles.paymentSubtitle}>Cash on Delivery</Text>
              </View>
              <View style={styles.paymentCheck}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              </View>
            </View>
          </BlurView>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          
          <BlurView intensity={15} tint="light" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{total}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={styles.summaryFree}>FREE</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView intensity={20} tint="light" style={styles.footer}>
        <View style={styles.footerTop}>
          <Text style={styles.footerTotal}>₹{total}</Text>
          <Text style={styles.footerSubtext}>Total Amount</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.orderButton}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            style={styles.orderGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                <Text style={styles.orderText}>Place Order via WhatsApp</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  editText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 207, 127, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  landmark: {
    fontSize: 13,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemsCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 8,
  },
  notesCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  notesInput: {
    fontSize: 14,
    color: colors.text,
    minHeight: 60,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  paymentCheck: {
    marginLeft: 8,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  summaryFree: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  footerTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotal: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  footerSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  orderButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  orderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  orderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ReviewOrderScreen;
