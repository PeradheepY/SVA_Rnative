import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  BackHandler
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/commonStyles';

const OrderSuccessScreen: React.FC = () => {
  const { orderNumber, orderId } = useLocalSearchParams();

  // Disable back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)/home');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleViewOrders = () => {
    router.replace('/orders');
  };

  const handleContinueShopping = () => {
    router.replace('/(tabs)/catalog');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6BCF7F', '#5AB96D']}
        style={styles.background}
      />

      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={60} color="#fff" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been successfully placed and sent to the retailer via WhatsApp.
        </Text>

        {/* Order Number Card */}
        <BlurView intensity={20} tint="light" style={styles.orderCard}>
          <Text style={styles.orderLabel}>Order Number</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
          <View style={styles.orderInfo}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.orderInfoText}>
              Save this number to track your order
            </Text>
          </View>
        </BlurView>

        {/* What's Next Card */}
        <BlurView intensity={15} tint="light" style={styles.nextCard}>
          <Text style={styles.nextTitle}>What's Next?</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>WhatsApp Confirmation</Text>
              <Text style={styles.stepDesc}>
                Complete your order on WhatsApp with the retailer
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Order Processing</Text>
              <Text style={styles.stepDesc}>
                Retailer will confirm and prepare your order
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Delivery</Text>
              <Text style={styles.stepDesc}>
                Pay cash on delivery when your order arrives
              </Text>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.ordersButton}
          onPress={handleViewOrders}
        >
          <BlurView intensity={20} tint="light" style={styles.ordersButtonBlur}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            <Text style={styles.ordersButtonText}>View My Orders</Text>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinueShopping}
        >
          <LinearGradient
            colors={['#6BCF7F', '#5AB96D']}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue Shopping</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  animationContainer: {
    marginBottom: 24,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  orderCard: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 20,
  },
  orderLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  nextCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(107, 207, 127, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    gap: 12,
  },
  ordersButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ordersButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  ordersButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OrderSuccessScreen;
