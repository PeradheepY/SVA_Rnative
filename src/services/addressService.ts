import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Address {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  userId: string;
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

/**
 * Create a new address
 */
export const createAddress = async (addressData: AddressInput): Promise<string> => {
  try {
    // If this is default address, unset other default addresses
    if (addressData.isDefault) {
      const q = query(
        collection(db, 'addresses'),
        where('userId', '==', addressData.userId),
        where('isDefault', '==', true)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, 'addresses', docSnap.id), { isDefault: false });
      });
    }

    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'addresses'), {
      ...addressData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating address:', error);
    throw new Error('Failed to create address');
  }
};

/**
 * Get all addresses for a user
 */
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const addresses: Address[] = [];
    
    querySnapshot.forEach((doc) => {
      addresses.push({
        id: doc.id,
        ...doc.data(),
      } as Address);
    });
    
    // Sort by default first, then by creation date
    addresses.sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return addresses;
  } catch (error) {
    console.error('Error getting user addresses:', error);
    throw new Error('Failed to get addresses');
  }
};

/**
 * Get default address for a user
 */
export const getDefaultAddress = async (userId: string): Promise<Address | null> => {
  try {
    const q = query(
      collection(db, 'addresses'),
      where('userId', '==', userId),
      where('isDefault', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Address;
  } catch (error) {
    console.error('Error getting default address:', error);
    throw new Error('Failed to get default address');
  }
};

/**
 * Update an address
 */
export const updateAddress = async (addressId: string, updates: Partial<Address>): Promise<void> => {
  try {
    const docRef = doc(db, 'addresses', addressId);
    
    // If setting as default, unset other default addresses
    if (updates.isDefault && updates.userId) {
      const q = query(
        collection(db, 'addresses'),
        where('userId', '==', updates.userId),
        where('isDefault', '==', true)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        if (docSnap.id !== addressId) {
          await updateDoc(doc(db, 'addresses', docSnap.id), { isDefault: false });
        }
      });
    }
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating address:', error);
    throw new Error('Failed to update address');
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'addresses', addressId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting address:', error);
    throw new Error('Failed to delete address');
  }
};

/**
 * Subscribe to real-time updates for user's addresses
 */
export const subscribeToUserAddresses = (
  userId: string,
  onUpdate: (addresses: Address[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    
    return onSnapshot(
      q,
      (snapshot) => {
        const addresses: Address[] = [];
        snapshot.forEach((doc) => {
          addresses.push({
            id: doc.id,
            ...doc.data(),
          } as Address);
        });
        
        // Sort by default first, then by creation date
        addresses.sort((a, b) => {
          if (a.isDefault !== b.isDefault) {
            return a.isDefault ? -1 : 1;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        onUpdate(addresses);
      },
      (error) => {
        console.error('Error subscribing to addresses:', error);
        if (onError) {
          onError(new Error('Failed to subscribe to addresses'));
        }
      }
    );
  } catch (error) {
    console.error('Error setting up address subscription:', error);
    throw new Error('Failed to subscribe to addresses');
  }
};
