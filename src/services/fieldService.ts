import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FieldHealthMetrics {
  waterDepth: number; // 0-100%
  plantHealth: number; // 0-100%
  soilQuality: number; // 0-100%
  pestLevel: number; // 0-100%
  yield: number; // kg per hectare
  plantAge: number; // days
}

export interface Field {
  id: string;
  userId: string;
  name: string;
  cropType: string;
  size: number; // hectares
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  plantingDate: string;
  expectedHarvestDate: string;
  image?: string; // emoji or image URL
  healthMetrics: FieldHealthMetrics;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldInput {
  userId: string;
  name: string;
  cropType: string;
  size: number;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  plantingDate: string;
  expectedHarvestDate: string;
  image?: string;
  healthMetrics: FieldHealthMetrics;
  notes?: string;
}

/**
 * Create a new field
 */
export const createField = async (fieldData: FieldInput): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'fields'), {
      ...fieldData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating field:', error);
    throw new Error('Failed to create field');
  }
};

/**
 * Get all fields for a user
 */
export const getUserFields = async (userId: string): Promise<Field[]> => {
  try {
    const q = query(collection(db, 'fields'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const fields: Field[] = [];
    
    querySnapshot.forEach((doc) => {
      fields.push({
        id: doc.id,
        ...doc.data(),
      } as Field);
    });
    
    return fields;
  } catch (error) {
    console.error('Error getting user fields:', error);
    throw new Error('Failed to get fields');
  }
};

/**
 * Get a single field by ID
 */
export const getFieldById = async (fieldId: string): Promise<Field | null> => {
  try {
    const docRef = doc(db, 'fields', fieldId);
    const docSnap = await getDocs(query(collection(db, 'fields'), where('__name__', '==', fieldId)));
    
    if (docSnap.empty) {
      return null;
    }
    
    const fieldDoc = docSnap.docs[0];
    return {
      id: fieldDoc.id,
      ...fieldDoc.data(),
    } as Field;
  } catch (error) {
    console.error('Error getting field:', error);
    throw new Error('Failed to get field');
  }
};

/**
 * Update field information
 */
export const updateField = async (fieldId: string, updates: Partial<Field>): Promise<void> => {
  try {
    const docRef = doc(db, 'fields', fieldId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating field:', error);
    throw new Error('Failed to update field');
  }
};

/**
 * Update field health metrics
 */
export const updateFieldMetrics = async (
  fieldId: string,
  metrics: Partial<FieldHealthMetrics>
): Promise<void> => {
  try {
    const docRef = doc(db, 'fields', fieldId);
    await updateDoc(docRef, {
      healthMetrics: metrics,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating field metrics:', error);
    throw new Error('Failed to update field metrics');
  }
};

/**
 * Delete a field
 */
export const deleteField = async (fieldId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'fields', fieldId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting field:', error);
    throw new Error('Failed to delete field');
  }
};

/**
 * Subscribe to real-time updates for user's fields
 */
export const subscribeToUserFields = (
  userId: string,
  onUpdate: (fields: Field[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const q = query(collection(db, 'fields'), where('userId', '==', userId));
    
    return onSnapshot(
      q,
      (snapshot) => {
        const fields: Field[] = [];
        snapshot.forEach((doc) => {
          fields.push({
            id: doc.id,
            ...doc.data(),
          } as Field);
        });
        onUpdate(fields);
      },
      (error) => {
        console.error('Error subscribing to fields:', error);
        if (onError) {
          onError(new Error('Failed to subscribe to fields'));
        }
      }
    );
  } catch (error) {
    console.error('Error setting up field subscription:', error);
    throw new Error('Failed to subscribe to fields');
  }
};

/**
 * Calculate field status based on health metrics
 */
export const calculateFieldStatus = (metrics: FieldHealthMetrics): {
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  needsAttention: boolean;
  alerts: string[];
} => {
  const alerts: string[] = [];
  
  // Check each metric
  if (metrics.waterDepth < 30) {
    alerts.push('Low water level - needs irrigation');
  } else if (metrics.waterDepth > 80) {
    alerts.push('High water level - check drainage');
  }
  
  if (metrics.plantHealth < 50) {
    alerts.push('Poor plant health - inspect crops');
  }
  
  if (metrics.soilQuality < 40) {
    alerts.push('Low soil quality - consider fertilization');
  }
  
  if (metrics.pestLevel > 20) {
    alerts.push('High pest activity - apply pest control');
  }
  
  // Calculate overall score
  const overallScore = (
    metrics.waterDepth * 0.25 +
    metrics.plantHealth * 0.35 +
    metrics.soilQuality * 0.25 +
    (100 - metrics.pestLevel) * 0.15
  );
  
  let status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  
  if (overallScore >= 80) {
    status = 'Excellent';
  } else if (overallScore >= 60) {
    status = 'Good';
  } else if (overallScore >= 40) {
    status = 'Needs Attention';
  } else {
    status = 'Critical';
  }
  
  return {
    status,
    needsAttention: alerts.length > 0,
    alerts,
  };
};

/**
 * Get mock field data for development/testing
 */
export const getMockFields = (userId: string): Field[] => {
  const now = new Date();
  const plantingDate1 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
  const plantingDate2 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const plantingDate3 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
  
  return [
    {
      id: '1',
      userId,
      name: 'North Field',
      cropType: 'Tomatoes',
      size: 12,
      location: {
        address: 'North plot near well',
      },
      plantingDate: plantingDate1.toISOString(),
      expectedHarvestDate: new Date(plantingDate1.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      image: '🍅',
      healthMetrics: {
        waterDepth: 50,
        plantHealth: 80,
        soilQuality: 70,
        pestLevel: 5,
        yield: 0,
        plantAge: 45,
      },
      notes: 'Regular watering schedule, good growth',
      createdAt: plantingDate1.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '2',
      userId,
      name: 'East Field',
      cropType: 'Lettuce',
      size: 18,
      location: {
        address: 'East plot near road',
      },
      plantingDate: plantingDate2.toISOString(),
      expectedHarvestDate: new Date(plantingDate2.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      image: '🥬',
      healthMetrics: {
        waterDepth: 25,
        plantHealth: 65,
        soilQuality: 55,
        pestLevel: 15,
        yield: 0,
        plantAge: 30,
      },
      notes: 'Needs watering, some pest activity',
      createdAt: plantingDate2.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '3',
      userId,
      name: 'West Paddy',
      cropType: 'Rice',
      size: 24,
      location: {
        address: 'West paddy field',
      },
      plantingDate: plantingDate3.toISOString(),
      expectedHarvestDate: new Date(plantingDate3.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      image: '🌾',
      healthMetrics: {
        waterDepth: 85,
        plantHealth: 90,
        soilQuality: 85,
        pestLevel: 3,
        yield: 0,
        plantAge: 60,
      },
      notes: 'Excellent growth, ready for harvest soon',
      createdAt: plantingDate3.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
};
