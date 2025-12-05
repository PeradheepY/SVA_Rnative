import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Order, getOrderById, updateOrderStatus } from '../../src/services/orderService';
import { colors } from '../../styles/commonStyles';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface StatusOption {
  key: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const statusFlow: StatusOption[] = [
  { key: 'pending', label: 'Pending', icon: 'time-outline', color: '#FF9800' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline', color: '#2196F3' },
  { key: 'processing', label: 'Processing', icon: 'construct-outline', color: '#7E57C2' },
  { key: 'shipped', label: 'Shipped', icon: 'car-outline', color: '#00BCD4' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle-outline', color: '#4CAF50' },
];

const RetailerOrderDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    try {
      const fetchedOrder = await getOrderById(id);
      setOrder(fetchedOrder);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || !order.id) return;

    if (newStatus === 'cancelled') {
      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: () => updateStatus(newStatus) },
        ]
      );
    } else {
      updateStatus(newStatus);
    }
  };

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order?.id) return;
    
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const callCustomer = () => {
    if (order?.deliveryAddress?.phone) {
      Linking.openURL(`tel:${order.deliveryAddress.phone}`);
    }
  };

  const messageOnWhatsApp = () => {
    if (order?.deliveryAddress?.phone) {
      let phone = order.deliveryAddress.phone.replace(/[\s\-\(\)]/g, '');
      if (phone.length === 10) phone = '91' + phone;
      Linking.openURL(`whatsapp://send?phone=${phone}`);
    }
  };

  const formatDate = (date: any): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    const option = statusFlow.find(s => s.key === status);
    return option?.color || colors.textSecondary;
  };

  const getNextStatus = (): StatusOption | null => {
    if (!order) return null;
    const currentIndex = statusFlow.findIndex(s => s.key === order.status);
    if (currentIndex < 0 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.textLight} />
        <Text style={styles.loadingText}>Order not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nextStatus = getNextStatus();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6BCF7F', '#4CAF50']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '30' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.card}>
            <View style={styles.customerRow}>
              <View style={styles.customerInfo}>
                <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
                <View style={styles.customerText}>
                  <Text style={styles.customerName}>{order.deliveryAddress?.fullName}</Text>
                  <Text style={styles.customerPhone}>{order.deliveryAddress?.phone}</Text>
                </View>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactBtn} onPress={callCustomer}>
                  <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.contactBtn, { backgroundColor: '#25D366' }]} 
                  onPress={messageOnWhatsApp}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.card}>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
              <View style={styles.addressText}>
                <Text style={styles.addressLine}>{order.deliveryAddress?.addressLine1}</Text>
                {order.deliveryAddress?.addressLine2 && (
                  <Text style={styles.addressLine}>{order.deliveryAddress.addressLine2}</Text>
                )}
                {order.deliveryAddress?.landmark && (
                  <Text style={styles.addressLine}>Near {order.deliveryAddress.landmark}</Text>
                )}
                <Text style={styles.addressLine}>
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({order.items?.length})</Text>
          <View style={styles.card}>
            {order.items?.map((item, index) => (
              <View key={index} style={[styles.itemRow, index < order.items.length - 1 && styles.itemBorder]}>
                <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemRetailer}>From: {item.retailerName}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Order Total</Text>
              <Text style={styles.totalAmount}>₹{order.totalAmount?.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Notes</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Status Update */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.card}>
            {/* Status Timeline */}
            <View style={styles.statusTimeline}>
              {statusFlow.map((status, index) => {
                const currentIndex = statusFlow.findIndex(s => s.key === order.status);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <View key={status.key} style={styles.timelineItem}>
                    <View style={[
                      styles.timelineDot,
                      isCompleted && { backgroundColor: status.color },
                      isCurrent && styles.timelineDotActive,
                    ]}>
                      <Ionicons 
                        name={isCompleted ? 'checkmark' : status.icon} 
                        size={16} 
                        color={isCompleted ? '#fff' : colors.textLight} 
                      />
                    </View>
                    <Text style={[
                      styles.timelineLabel,
                      isCompleted && { color: status.color, fontWeight: '600' },
                    ]}>
                      {status.label}
                    </Text>
                    {index < statusFlow.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        isCompleted && { backgroundColor: status.color },
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Quick Actions */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <View style={styles.quickActions}>
                {nextStatus && (
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: nextStatus.color }]}
                    onPress={() => handleStatusUpdate(nextStatus.key)}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name={nextStatus.icon} size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Mark as {nextStatus.label}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => handleStatusUpdate('cancelled')}
                  disabled={updating}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#FF5252" />
                  <Text style={[styles.actionBtnText, { color: '#FF5252' }]}>Cancel Order</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'delivered' && (
              <View style={styles.completedBanner}>
                <Ionicons name="checkmark-done-circle" size={40} color="#4CAF50" />
                <Text style={styles.completedText}>Order Delivered Successfully!</Text>
              </View>
            )}

            {order.status === 'cancelled' && (
              <View style={[styles.completedBanner, { backgroundColor: 'rgba(255,82,82,0.1)' }]}>
                <Ionicons name="close-circle" size={40} color="#FF5252" />
                <Text style={[styles.completedText, { color: '#FF5252' }]}>Order Cancelled</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerText: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  customerPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressText: {
    flex: 1,
  },
  addressLine: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
  },
  itemRetailer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statusTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  timelineDotActive: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    transform: [{ scale: 1.1 }],
  },
  timelineLabel: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
  },
  timelineLine: {
    position: 'absolute',
    top: 16,
    left: '55%',
    width: '90%',
    height: 2,
    backgroundColor: '#E0E0E0',
    zIndex: -1,
  },
  quickActions: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.3)',
  },
  completedBanner: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 12,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 8,
  },
});

export default RetailerOrderDetailScreen;
