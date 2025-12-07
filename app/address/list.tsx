import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../src/store';
import {
  fetchUserAddresses,
  removeAddress,
  modifyAddress,
  selectAllAddresses,
  selectAddressLoading,
} from '../../src/store/slices/addressSlice';
import { colors } from '../../styles/commonStyles';

export default function AddressListScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const addresses = useSelector(selectAllAddresses);
  const loading = useSelector(selectAddressLoading);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserAddresses(user.uid));
    }
  }, [user?.uid]);

  const handleSetDefault = (addressId: string) => {
    if (user?.uid) {
      dispatch(modifyAddress({ addressId, updates: { isDefault: true, userId: user.uid } }));
    }
  };

  const handleDelete = (addressId: string, addressName: string) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete ${addressName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeAddress(addressId)),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Addresses Yet</Text>
            <Text style={styles.emptyText}>Add your delivery address to get started</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                  <Ionicons
                    name={
                      address.addressType === 'Home'
                        ? 'home'
                        : address.addressType === 'Work'
                        ? 'briefcase'
                        : 'location'
                    }
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.addressType}>{address.addressType}</Text>
                </View>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>DEFAULT</Text>
                  </View>
                )}
              </View>

              <Text style={styles.addressName}>{address.name}</Text>
              <Text style={styles.addressPhone}>{address.phoneNumber}</Text>
              <Text style={styles.addressText}>
                {address.addressLine1}
                {address.addressLine2 && `, ${address.addressLine2}`}
              </Text>
              <Text style={styles.addressText}>
                {address.city}, {address.state} - {address.pincode}
              </Text>
              {address.landmark && (
                <Text style={styles.addressLandmark}>Landmark: {address.landmark}</Text>
              )}

              <View style={styles.addressActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/address/edit?id=${address.id}`)}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                {!address.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                    <Text style={styles.actionText}>Set Default</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(address.id, address.name)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Address FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/address/add')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  defaultBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  addressLandmark: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
