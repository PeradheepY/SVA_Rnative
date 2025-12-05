import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { RootState } from '../../src/store';
import { IconSymbol } from '../../components/IconSymbol';
import { colors } from '../../styles/commonStyles';
import { getProductsByRetailer } from '../../src/services/productService';

const DashboardScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });

  const loadDashboardData = async () => {
    try {
      if (user?.uid) {
        const products = await getProductsByRetailer(user.uid);
        setStats({
          totalProducts: products.length,
          inStock: products.filter(p => p.inStock).length,
          outOfStock: products.filter(p => !p.inStock).length,
          totalOrders: 12, // Mock data
          pendingOrders: 3, // Mock data
          revenue: 45600, // Mock data
        });
      }
    } catch (error) {
      console.log('Error loading dashboard:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ icon, title, value, color, subtitle }: any) => (
    <BlurView intensity={20} tint="light" style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </BlurView>
  );

  const QuickAction = ({ icon, title, onPress, color }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient
        colors={[color, color + 'CC']}
        style={styles.quickActionGradient}
      >
        <IconSymbol name={icon} size={28} color="#fff" />
      </LinearGradient>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6BCF7F', '#4CAF50']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.shopName}>{user?.shopName || 'Retailer'} 🏪</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <BlurView intensity={20} style={styles.notificationBlur}>
              <IconSymbol name="bell.fill" size={22} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Verification Status */}
        <View style={[styles.verificationBanner, !user?.isVerified && styles.pendingBanner]}>
          <IconSymbol 
            name={user?.isVerified ? "checkmark.seal.fill" : "clock.fill"} 
            size={18} 
            color={user?.isVerified ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={styles.verificationText}>
            {user?.isVerified 
              ? 'Verified Retailer' 
              : 'Verification Pending - Your products will be visible after approval'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="cube.box.fill"
            title="Total Products"
            value={stats.totalProducts}
            color="#6BCF7F"
          />
          <StatCard
            icon="checkmark.circle.fill"
            title="In Stock"
            value={stats.inStock}
            color="#4CAF50"
          />
          <StatCard
            icon="xmark.circle.fill"
            title="Out of Stock"
            value={stats.outOfStock}
            color="#FF5252"
          />
          <StatCard
            icon="list.clipboard.fill"
            title="Orders"
            value={stats.totalOrders}
            color="#2196F3"
            subtitle={`${stats.pendingOrders} pending`}
          />
        </View>

        {/* Revenue Card */}
        <BlurView intensity={15} tint="light" style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>Total Revenue</Text>
            <Text style={styles.revenuePeriod}>This Month</Text>
          </View>
          <Text style={styles.revenueAmount}>₹{stats.revenue.toLocaleString()}</Text>
          <View style={styles.revenueGrowth}>
            <IconSymbol name="arrow.up.right" size={16} color="#4CAF50" />
            <Text style={styles.growthText}>+12.5% from last month</Text>
          </View>
        </BlurView>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="plus.circle.fill"
            title="Add Product"
            color="#6BCF7F"
            onPress={() => router.push('/(retailer)/add-product')}
          />
          <QuickAction
            icon="cube.box.fill"
            title="Manage Stock"
            color="#2196F3"
            onPress={() => router.push('/(retailer)/products')}
          />
          <QuickAction
            icon="list.clipboard.fill"
            title="View Orders"
            color="#FF9800"
            onPress={() => router.push('/(retailer)/orders')}
          />
          <QuickAction
            icon="chart.line.uptrend.xyaxis"
            title="Analytics"
            color="#9C27B0"
            onPress={() => {}}
          />
        </View>

        {/* GSTIN Info */}
        <BlurView intensity={15} tint="light" style={styles.gstinCard}>
          <View style={styles.gstinHeader}>
            <IconSymbol name="doc.text.fill" size={20} color={colors.primary} />
            <Text style={styles.gstinTitle}>Business Details</Text>
          </View>
          <View style={styles.gstinInfo}>
            <Text style={styles.gstinLabel}>GSTIN</Text>
            <Text style={styles.gstinValue}>{user?.gstin || 'Not Available'}</Text>
          </View>
          <View style={styles.gstinInfo}>
            <Text style={styles.gstinLabel}>Shop Name</Text>
            <Text style={styles.gstinValue}>{user?.shopName || 'Not Available'}</Text>
          </View>
        </BlurView>

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
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  shopName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  notificationBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  notificationBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF5252',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  pendingBanner: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  verificationText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  statTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  revenueCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  revenuePeriod: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  revenueAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  revenueGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  growthText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  gstinCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  gstinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  gstinTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  gstinInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '40',
  },
  gstinLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gstinValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default DashboardScreen;
