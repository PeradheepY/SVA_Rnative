
import api from './api';

export interface DiseaseDetectionResult {
  id: string;
  diseaseName: string;
  confidence: number;
  description: string;
  symptoms: string[];
  causes: string[];
  treatments: Treatment[];
  preventionTips: string[];
  severity: 'low' | 'medium' | 'high';
  affectedCrops: string[];
}

export interface Treatment {
  id: string;
  name: string;
  type: 'organic' | 'chemical' | 'biological';
  description: string;
  applicationMethod: string;
  dosage: string;
  frequency: string;
  cost: number;
}

export interface ExpertConsultation {
  id: string;
  expertName: string;
  specialization: string;
  experience: number;
  rating: number;
  availability: 'available' | 'busy' | 'offline';
  consultationFee: number;
  languages: string[];
  profileImage: string;
}

// Mock data for disease detection results
const mockDiseaseResults: DiseaseDetectionResult[] = [
  {
    id: '1',
    diseaseName: 'Late Blight',
    confidence: 0.92,
    description: 'Late blight is a destructive disease that affects tomatoes and potatoes, caused by the fungus-like organism Phytophthora infestans.',
    symptoms: [
      'Dark brown or black lesions on leaves',
      'White fuzzy growth on leaf undersides',
      'Rapid wilting and death of plant parts',
      'Brown spots on fruits'
    ],
    causes: [
      'High humidity and cool temperatures',
      'Poor air circulation',
      'Overhead watering',
      'Infected plant debris'
    ],
    treatments: [
      {
        id: 't1',
        name: 'Copper Fungicide',
        type: 'chemical',
        description: 'Effective copper-based fungicide for late blight control',
        applicationMethod: 'Foliar spray',
        dosage: '2-3 grams per liter',
        frequency: 'Every 7-10 days',
        cost: 450
      },
      {
        id: 't2',
        name: 'Neem Oil',
        type: 'organic',
        description: 'Natural organic treatment with antifungal properties',
        applicationMethod: 'Foliar spray',
        dosage: '5ml per liter',
        frequency: 'Every 5-7 days',
        cost: 280
      }
    ],
    preventionTips: [
      'Ensure good air circulation',
      'Avoid overhead watering',
      'Remove infected plant debris',
      'Use resistant varieties',
      'Apply preventive fungicides'
    ],
    severity: 'high',
    affectedCrops: ['Tomato', 'Potato', 'Eggplant']
  },
  {
    id: '2',
    diseaseName: 'Powdery Mildew',
    confidence: 0.87,
    description: 'Powdery mildew is a fungal disease that appears as white powdery spots on leaves and stems.',
    symptoms: [
      'White powdery coating on leaves',
      'Yellowing of affected leaves',
      'Stunted growth',
      'Reduced fruit quality'
    ],
    causes: [
      'High humidity with dry conditions',
      'Poor air circulation',
      'Overcrowded plants',
      'Stress conditions'
    ],
    treatments: [
      {
        id: 't3',
        name: 'Sulfur Spray',
        type: 'organic',
        description: 'Organic sulfur-based treatment for powdery mildew',
        applicationMethod: 'Foliar spray',
        dosage: '3 grams per liter',
        frequency: 'Every 10-14 days',
        cost: 320
      }
    ],
    preventionTips: [
      'Improve air circulation',
      'Avoid overcrowding',
      'Water at soil level',
      'Remove affected leaves',
      'Use resistant varieties'
    ],
    severity: 'medium',
    affectedCrops: ['Cucumber', 'Zucchini', 'Pumpkin', 'Grapes']
  }
];

// Mock data for expert consultations
const mockExperts: ExpertConsultation[] = [
  {
    id: 'e1',
    expertName: 'Dr. Rajesh Patel',
    specialization: 'Plant Pathology',
    experience: 15,
    rating: 4.8,
    availability: 'available',
    consultationFee: 500,
    languages: ['English', 'Hindi', 'Gujarati'],
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200'
  },
  {
    id: 'e2',
    expertName: 'Dr. Priya Sharma',
    specialization: 'Crop Protection',
    experience: 12,
    rating: 4.9,
    availability: 'available',
    consultationFee: 600,
    languages: ['English', 'Hindi', 'Punjabi'],
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200'
  },
  {
    id: 'e3',
    expertName: 'Dr. Amit Kumar',
    specialization: 'Integrated Pest Management',
    experience: 18,
    rating: 4.7,
    availability: 'busy',
    consultationFee: 750,
    languages: ['English', 'Hindi', 'Bengali'],
    profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200'
  }
];

export const detectCropDisease = async (imageUri: string): Promise<DiseaseDetectionResult> => {
  try {
    console.log('Detecting crop disease for image:', imageUri);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, return a random disease result
    const randomResult = mockDiseaseResults[Math.floor(Math.random() * mockDiseaseResults.length)];
    
    console.log('Disease detection result:', randomResult.diseaseName);
    return randomResult;
    
    // In a real implementation, you would send the image to your API:
    // const formData = new FormData();
    // formData.append('image', {
    //   uri: imageUri,
    //   type: 'image/jpeg',
    //   name: 'crop_image.jpg',
    // } as any);
    
    // const response = await api.post('/crop-disease/detect', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    
    // return response.data;
  } catch (error) {
    console.error('Error detecting crop disease:', error);
    throw new Error('Failed to detect crop disease. Please try again.');
  }
};

export const getAvailableExperts = async (): Promise<ExpertConsultation[]> => {
  try {
    console.log('Fetching available experts');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Found experts:', mockExperts.length);
    return mockExperts;
    
    // In a real implementation:
    // const response = await api.get('/experts/available');
    // return response.data;
  } catch (error) {
    console.error('Error fetching experts:', error);
    throw new Error('Failed to fetch experts. Please try again.');
  }
};

export const scheduleConsultation = async (expertId: string, diseaseId: string): Promise<{ consultationId: string; scheduledTime: string }> => {
  try {
    console.log('Scheduling consultation with expert:', expertId, 'for disease:', diseaseId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const consultationId = `consultation_${Date.now()}`;
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    
    console.log('Consultation scheduled:', consultationId);
    return { consultationId, scheduledTime };
    
    // In a real implementation:
    // const response = await api.post('/consultations/schedule', {
    //   expertId,
    //   diseaseId,
    // });
    // return response.data;
  } catch (error) {
    console.error('Error scheduling consultation:', error);
    throw new Error('Failed to schedule consultation. Please try again.');
  }
};
