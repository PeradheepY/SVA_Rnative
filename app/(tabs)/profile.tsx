
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../src/store';
import { logout } from '../../src/store/slices/authSlice';
import { signOutUser } from '../../src/services/authService';
import { colors, commonStyles } from '../../styles/commonStyles';

const ProfileScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
              dispatch(logout());
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'W'}</Text>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
              <Ionicons name="pencil-outline" size={20} color={colors.text} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Wahib Khan'}</Text>
          
          <View style={styles.userDetailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{user?.phoneNumber || '+91 9876543210'}</Text>
            </View>
          </View>
        </View>

        {/* Info Items */}
        <View style={styles.infoSection}>
          <TouchableOpacity onPress={() => router.push('/orders')}>
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(107, 207, 127, 0.1)' }]}>
                  <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.infoLabel}>My Orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/cart')}>
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(255, 183, 77, 0.1)' }]}>
                  <Ionicons name="cart-outline" size={20} color="#FFB74D" />
                </View>
                <Text style={styles.infoLabel}>My Cart</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/address/list')}>
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                  <Ionicons name="location-outline" size={20} color="#2196F3" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>My Addresses</Text>
                  <Text style={styles.infoSubtext}>Manage delivery addresses</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="settings-outline" size={20} color={colors.text} />
                </View>
                <Text style={styles.infoLabel}>Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageChange}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="language-outline" size={20} color={colors.text} />
              </View>
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="notifications-outline" size={20} color={colors.text} />
              </View>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Help Center */}
        <View style={styles.helpItem}>
          <View style={styles.infoLeft}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle-outline" size={20} color={colors.text} />
            </View>
            <Text style={styles.infoLabel}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#666',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  userDetailsRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 20,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  infoSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingsCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 4,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});

export default ProfileScreen;
