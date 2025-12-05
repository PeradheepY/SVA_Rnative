import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { getOrderById, Order, sendOrderToWhatsApp } from '../../src/services/orderService';
import { colors } from '../../styles/commonStyles';

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending': return '#FFB74D';
    case 'confirmed': return '#64B5F6';
    case 'processing': return '#7E57C2';
    case 'shipped': return '#4FC3F7';
    case 'delivered': return '#81C784';
    case 'cancelled': return '#EF5350';
    default: return colors.textSecondary;
  }
};

const formatDate = (date: any): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    
    try {
      const fetchedOrder = await getOrderById(id as string);
      setOrder(fetchedOrder);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleBack = () => {
    router.back();
  };

  const handleContactSeller = async () => {
    if (order) {
      await sendOrderToWhatsApp(order, '919876543210'); // Replace with actual number
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status);

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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Order Info Card */}
        <BlurView intensity={15} tint="light" style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(order.status)}20` }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
        </BlurView>

        {/* Order Tracking */}
        {order.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Tracking</Text>
            <BlurView intensity={15} tint="light" style={styles.trackingCard}>
              {statusSteps.map((step, index) => (
                <View key={step} style={styles.trackingStep}>
                  <View style={styles.trackingLeft}>
                    <View style={[
                      styles.trackingDot,
                      index <= currentStepIndex && styles.trackingDotActive,
                      index === currentStepIndex && styles.trackingDotCurrent
                    ]}>
                      {index < currentStepIndex && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    {index < statusSteps.length - 1 && (
                      <View style={[
                        styles.trackingLine,
                        index < currentStepIndex && styles.trackingLineActive
                      ]} />
                    )}
                  </View>
                  <View style={styles.trackingContent}>
                    <Text style={[
                      styles.trackingLabel,
                      index <= currentStepIndex && styles.trackingLabelActive
                    ]}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </Text>
                    <Text style={styles.trackingDesc}>
                      {step === 'pending' && 'Order placed, waiting for confirmation'}
                      {step === 'confirmed' && 'Order confirmed by seller'}
                      {step === 'processing' && 'Order is being prepared'}
                      {step === 'shipped' && 'Order is on the way'}
                      {step === 'delivered' && 'Order delivered successfully'}
                    </Text>
                  </View>
                </View>
              ))}
            </BlurView>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <BlurView intensity={15} tint="light" style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressName}>{order.deliveryAddress.fullName}</Text>
              <Text style={styles.addressPhone}>{order.deliveryAddress.phone}</Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress.addressLine1}
                {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
              </Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </Text>
            </View>
          </BlurView>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
          <BlurView intensity={15} tint="light" style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View key={index}>
                <View style={styles.itemRow}>
                  <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    <Text style={styles.itemSeller}>Sold by: {item.retailerName}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
                {index < order.items.length - 1 && <View style={styles.itemDivider} />}
              </View>
            ))}
          </BlurView>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <BlurView intensity={15} tint="light" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{order.totalAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryFree}>FREE</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
          </BlurView>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <BlurView intensity={15} tint="light" style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </BlurView>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <BlurView intensity={20} tint="light" style={styles.footer}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContactSeller}
        >
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            style={styles.contactGradient}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.contactText}>Contact Seller</Text>
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
  orderCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  trackingCard: {
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  trackingStep: {
    flexDirection: 'row',
    minHeight: 60,
  },
  trackingLeft: {
    alignItems: 'center',
    width: 30,
  },
  trackingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingDotActive: {
    backgroundColor: colors.primary,
  },
  trackingDotCurrent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(107, 207, 127, 0.3)',
  },
  trackingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  trackingLineActive: {
    backgroundColor: colors.primary,
  },
  trackingContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  trackingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 4,
  },
  trackingLabelActive: {
    color: colors.text,
  },
  trackingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addressCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 207, 127, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  itemsCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
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
  itemSeller: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
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
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  paymentText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  notesCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  contactButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OrderDetailScreen;
