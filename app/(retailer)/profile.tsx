import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { RootState } from '../../src/store';
import { logout } from '../../src/store/slices/authSlice';
import { IconSymbol } from '../../components/IconSymbol';
import { colors } from '../../styles/commonStyles';

const ProfileScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, showBadge, badgeColor }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <IconSymbol name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>!</Text>
        </View>
      )}
      <IconSymbol name="chevron.right" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6BCF7F', '#4CAF50']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.shopName?.charAt(0) || 'R'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.shopName}>{user?.shopName || 'Retailer'}</Text>
            <Text style={styles.phone}>{user?.phoneNumber}</Text>
            <View style={styles.verificationStatus}>
              <IconSymbol 
                name={user?.isVerified ? "checkmark.seal.fill" : "clock.fill"} 
                size={14} 
                color="#fff" 
              />
              <Text style={styles.verificationText}>
                {user?.isVerified ? 'Verified' : 'Pending Verification'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Info Card */}
        <BlurView intensity={15} tint="light" style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GSTIN</Text>
            <Text style={styles.infoValue}>{user?.gstin || 'Not Available'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shop Name</Text>
            <Text style={styles.infoValue}>{user?.shopName || 'Not Available'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phoneNumber}</Text>
          </View>
        </BlurView>

        {/* Menu Items */}
        <BlurView intensity={15} tint="light" style={styles.menuCard}>
          <MenuItem
            icon="pencil"
            title="Edit Profile"
            subtitle="Update shop information"
            onPress={() => Alert.alert('Coming Soon', 'Edit profile feature coming soon!')}
          />
          <MenuItem
            icon="bell.fill"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => {}}
            showBadge
            badgeColor="#FF5252"
          />
          <MenuItem
            icon="creditcard.fill"
            title="Payment Settings"
            subtitle="Bank account & UPI details"
            onPress={() => {}}
          />
          <MenuItem
            icon="doc.text.fill"
            title="Documents"
            subtitle="Upload GST & license documents"
            onPress={() => {}}
          />
        </BlurView>

        {/* Support Section */}
        <BlurView intensity={15} tint="light" style={styles.menuCard}>
          <MenuItem
            icon="questionmark.circle.fill"
            title="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="doc.plaintext.fill"
            title="Terms & Conditions"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield.fill"
            title="Privacy Policy"
            onPress={() => {}}
          />
        </BlurView>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>

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
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  phone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verificationText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  infoCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '20',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FF5252' + '15',
    gap: 10,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5252',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 20,
  },
});

export default ProfileScreen;
