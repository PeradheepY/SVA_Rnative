
import api from './api';
import * as FileSystem from 'expo-file-system';

// Google Gemini API Configuration
// Get your free API key from: https://aistudio.google.com/apikey
// Set it in your .env file as EXPO_PUBLIC_GEMINI_API_KEY
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkbphnjpb';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sva_agromart';

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
  imageUri?: string;
  isHealthy?: boolean;
  scientificName?: string;
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

// Upload image to Cloudinary
const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    console.log('📤 Uploading image to Cloudinary...');
    const formData = new FormData();
    
    // Get file extension
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `plant_disease_${Date.now()}.${fileType}`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'plant_disease');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('Cloudinary upload error:', data.error);
      throw new Error(data.error.message);
    }
    
    console.log('✅ Image uploaded to Cloudinary:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    // Return local URI as fallback
    return imageUri;
  }
};

// Convert image to base64
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Parse Gemini response to extract disease info
const parseGeminiResponse = (responseText: string): Partial<DiseaseDetectionResult> => {
  try {
    // Try to parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (e) {
    console.log('Could not parse as JSON, extracting from text');
  }
  
  // Fallback: extract info from text
  const lines = responseText.split('\n');
  let diseaseName = 'Unknown Disease';
  let isHealthy = false;
  let description = responseText.substring(0, 300);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('disease:') || lowerLine.includes('disease name:')) {
      diseaseName = line.split(':')[1]?.trim() || diseaseName;
    }
    if (lowerLine.includes('healthy') && !lowerLine.includes('not healthy') && !lowerLine.includes('unhealthy')) {
      isHealthy = true;
      diseaseName = 'Healthy Plant';
    }
  }
  
  return { diseaseName, description, isHealthy };
};

export const detectCropDisease = async (imageUri: string): Promise<DiseaseDetectionResult> => {
  try {
    console.log('🔬 Detecting crop disease for image:', imageUri);
    
    // Check if API key is configured
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      console.log('⚠️ Gemini API key not configured, using mock data');
      return await detectCropDiseaseMock(imageUri);
    }
    
    // Upload image to Cloudinary first
    const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
    console.log('🖼️ Using image URL:', cloudinaryUrl);
    
    // Convert image to base64 for Gemini API
    const base64Image = await imageToBase64(imageUri);
    
    // Create prompt for Gemini
    const prompt = `You are an expert plant pathologist. Analyze this plant image and provide a disease diagnosis.

Please respond in this exact JSON format:
{
  "diseaseName": "Name of the disease or 'Healthy Plant' if no disease",
  "isHealthy": true or false,
  "confidence": 0.0 to 1.0,
  "severity": "low", "medium", or "high",
  "description": "Brief description of the disease",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "causes": ["cause 1", "cause 2"],
  "treatments": [
    {
      "name": "Treatment name",
      "type": "organic" or "chemical" or "biological",
      "description": "How it works",
      "applicationMethod": "How to apply",
      "dosage": "Amount to use",
      "frequency": "How often",
      "cost": estimated cost in INR as number
    }
  ],
  "preventionTips": ["tip 1", "tip 2", "tip 3"],
  "affectedCrops": ["crop1", "crop2"]
}

Analyze the plant in the image carefully. If it's healthy, set isHealthy to true. If diseased, provide detailed treatment information relevant to Indian farmers.`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return await detectCropDiseaseMock(imageUri);
    }
    
    const data = await response.json();
    console.log('Gemini API response received');
    
    // Extract text from response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini response:', responseText.substring(0, 500));
    
    // Parse the response
    const parsed = parseGeminiResponse(responseText);
    
    // If healthy plant
    if (parsed.isHealthy) {
      return {
        id: `detection_${Date.now()}`,
        diseaseName: 'Healthy Plant',
        confidence: parsed.confidence || 0.9,
        description: parsed.description || 'Your plant appears to be healthy with no visible signs of disease.',
        symptoms: [],
        causes: [],
        treatments: [],
        preventionTips: [
          'Continue regular watering schedule',
          'Maintain proper nutrition with balanced fertilizer',
          'Monitor for any changes in leaf color or texture',
          'Ensure adequate sunlight exposure',
          'Keep good air circulation around plants'
        ],
        severity: 'low',
        affectedCrops: [],
        imageUri: cloudinaryUrl, // Use Cloudinary URL
        isHealthy: true,
      };
    }
    
    // Get treatment info for the detected disease
    const treatmentInfo = getTreatmentInfo(parsed.diseaseName || 'unknown');
    
    return {
      id: `detection_${Date.now()}`,
      diseaseName: parsed.diseaseName || 'Unknown Disease',
      confidence: parsed.confidence || 0.75,
      description: parsed.description || `${parsed.diseaseName} has been detected. Treatment is recommended.`,
      symptoms: parsed.symptoms || extractSymptoms(parsed.diseaseName || ''),
      causes: parsed.causes || treatmentInfo.causes,
      treatments: parsed.treatments?.map((t: any, i: number) => ({
        id: `t${i}`,
        name: t.name,
        type: t.type || 'organic',
        description: t.description,
        applicationMethod: t.applicationMethod,
        dosage: t.dosage,
        frequency: t.frequency,
        cost: t.cost || 300
      })) || treatmentInfo.treatments,
      preventionTips: parsed.preventionTips || treatmentInfo.preventionTips,
      severity: parsed.severity || 'medium',
      affectedCrops: parsed.affectedCrops || ['Various crops'],
      imageUri: cloudinaryUrl, // Use Cloudinary URL
      isHealthy: false,
    };
    
  } catch (error) {
    console.error('❌ Error detecting crop disease:', error);
    // Upload image even on error, then return mock
    const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
    const mockResult = await detectCropDiseaseMock(imageUri);
    return {
      ...mockResult,
      imageUri: cloudinaryUrl, // Use Cloudinary URL even for mock
    };
  }
};

// Disease treatment database
const treatmentDatabase: Record<string, { treatments: Treatment[], preventionTips: string[], causes: string[] }> = {
  'late blight': {
    causes: [
      'High humidity and cool temperatures (10-25°C)',
      'Poor air circulation between plants',
      'Overhead watering or heavy rainfall',
      'Infected plant debris or nearby infected plants'
    ],
    treatments: [
      {
        id: 't1',
        name: 'Copper Fungicide (Bordeaux Mixture)',
        type: 'chemical',
        description: 'Effective copper-based fungicide that creates protective barrier on leaves',
        applicationMethod: 'Foliar spray - cover all leaf surfaces thoroughly',
        dosage: '2-3 grams per liter of water',
        frequency: 'Every 7-10 days, or after heavy rain',
        cost: 450
      },
      {
        id: 't2',
        name: 'Mancozeb 75% WP',
        type: 'chemical',
        description: 'Broad-spectrum fungicide for late blight control',
        applicationMethod: 'Foliar spray',
        dosage: '2.5 grams per liter',
        frequency: 'Every 7 days during disease pressure',
        cost: 380
      },
      {
        id: 't3',
        name: 'Neem Oil Spray',
        type: 'organic',
        description: 'Natural organic treatment with antifungal properties',
        applicationMethod: 'Foliar spray early morning or evening',
        dosage: '5ml neem oil + 2ml liquid soap per liter',
        frequency: 'Every 5-7 days',
        cost: 280
      }
    ],
    preventionTips: [
      'Ensure good air circulation by proper spacing (60-90cm apart)',
      'Water at soil level, avoid wetting leaves',
      'Remove and destroy infected plant debris immediately',
      'Use disease-resistant varieties',
      'Apply preventive fungicide before rainy season',
      'Rotate crops - don\'t plant in same spot for 3 years'
    ]
  },
  'powdery mildew': {
    causes: [
      'High humidity (50-90%) with moderate temperatures',
      'Poor air circulation and overcrowded plants',
      'Shaded conditions with limited sunlight',
      'Excessive nitrogen fertilization'
    ],
    treatments: [
      {
        id: 't4',
        name: 'Sulfur Dust/Spray',
        type: 'organic',
        description: 'Organic sulfur-based treatment, highly effective',
        applicationMethod: 'Dust or spray on affected areas',
        dosage: '3 grams per liter for spray',
        frequency: 'Every 10-14 days',
        cost: 320
      },
      {
        id: 't5',
        name: 'Baking Soda Solution',
        type: 'organic',
        description: 'Home remedy that changes leaf pH to inhibit fungal growth',
        applicationMethod: 'Spray on leaves',
        dosage: '1 tablespoon baking soda + 1/2 teaspoon liquid soap per gallon water',
        frequency: 'Weekly',
        cost: 50
      }
    ],
    preventionTips: [
      'Improve air circulation by proper pruning and spacing',
      'Plant in full sun locations',
      'Water in morning so leaves dry during day',
      'Remove affected leaves immediately',
      'Avoid excessive nitrogen fertilizers'
    ]
  },
  'default': {
    causes: [
      'Environmental stress factors',
      'Pathogen infection (fungal, bacterial, or viral)',
      'Poor growing conditions',
      'Nutrient deficiency or toxicity'
    ],
    treatments: [
      {
        id: 'td1',
        name: 'Broad-Spectrum Fungicide',
        type: 'chemical',
        description: 'General purpose fungicide for multiple diseases',
        applicationMethod: 'Foliar spray',
        dosage: 'As per label instructions',
        frequency: 'Every 7-14 days',
        cost: 400
      },
      {
        id: 'td2',
        name: 'Neem Oil Treatment',
        type: 'organic',
        description: 'Natural broad-spectrum treatment',
        applicationMethod: 'Foliar spray',
        dosage: '5ml per liter',
        frequency: 'Weekly',
        cost: 280
      },
      {
        id: 'td3',
        name: 'Trichoderma viride',
        type: 'biological',
        description: 'Beneficial microorganism for soil and plant health',
        applicationMethod: 'Soil application or seed treatment',
        dosage: '5g per liter or 10g per kg seed',
        frequency: 'Once at planting, repeat monthly',
        cost: 350
      }
    ],
    preventionTips: [
      'Maintain proper plant spacing for air circulation',
      'Water at soil level, avoid wetting foliage',
      'Remove dead or infected plant material promptly',
      'Practice crop rotation',
      'Use disease-free seeds and transplants',
      'Keep garden tools clean and sanitized'
    ]
  }
};

// Get treatment info based on disease name
const getTreatmentInfo = (diseaseName: string) => {
  const lowerName = diseaseName.toLowerCase();
  for (const [key, value] of Object.entries(treatmentDatabase)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  return treatmentDatabase['default'];
};

// Extract symptoms from disease name
const extractSymptoms = (diseaseName: string): string[] => {
  const lowerName = diseaseName.toLowerCase();
  
  if (lowerName.includes('blight')) {
    return [
      'Dark brown or black lesions on leaves',
      'Rapid wilting of plant parts',
      'Water-soaked spots that enlarge quickly',
      'White fuzzy growth in humid conditions'
    ];
  } else if (lowerName.includes('mildew')) {
    return [
      'White or gray powdery coating on leaves',
      'Yellowing of affected leaves',
      'Curling or distortion of leaves',
      'Reduced plant vigor'
    ];
  } else if (lowerName.includes('spot')) {
    return [
      'Circular spots on leaves',
      'Yellow halos around spots',
      'Premature leaf drop',
      'Spots may merge to form larger lesions'
    ];
  } else if (lowerName.includes('rust')) {
    return [
      'Orange or reddish-brown pustules on leaves',
      'Powdery spores when touched',
      'Yellowing around infected areas',
      'Premature leaf drop'
    ];
  }
  
  return [
    'Visible lesions or spots on plant tissue',
    'Discoloration of leaves or stems',
    'Abnormal growth patterns',
    'Reduced plant health'
  ];
};

// Mock detection for testing
const detectCropDiseaseMock = async (imageUri: string): Promise<DiseaseDetectionResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockDiseases = [
    {
      name: 'Late Blight',
      confidence: 0.89,
      description: 'Late blight is a serious disease caused by Phytophthora infestans. It can destroy entire crops within days.',
      severity: 'high' as const,
      affectedCrops: ['Tomato', 'Potato', 'Eggplant']
    },
    {
      name: 'Powdery Mildew',
      confidence: 0.85,
      description: 'Powdery mildew appears as white powdery spots on leaves, reducing photosynthesis.',
      severity: 'medium' as const,
      affectedCrops: ['Cucumber', 'Squash', 'Grapes']
    },
    {
      name: 'Bacterial Leaf Spot',
      confidence: 0.78,
      description: 'Causes water-soaked lesions that turn brown with yellow halos.',
      severity: 'medium' as const,
      affectedCrops: ['Pepper', 'Tomato', 'Lettuce']
    }
  ];
  
  const selected = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
  const treatmentInfo = getTreatmentInfo(selected.name);
  
  return {
    id: `detection_${Date.now()}`,
    diseaseName: selected.name,
    confidence: selected.confidence,
    description: selected.description,
    symptoms: extractSymptoms(selected.name),
    causes: treatmentInfo.causes,
    treatments: treatmentInfo.treatments,
    preventionTips: treatmentInfo.preventionTips,
    severity: selected.severity,
    affectedCrops: selected.affectedCrops,
    imageUri,
    isHealthy: false,
  };
};

// Expert consultations
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
  }
];

export const getAvailableExperts = async (): Promise<ExpertConsultation[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockExperts;
};

export const scheduleConsultation = async (expertId: string, diseaseId: string): Promise<{ consultationId: string; scheduledTime: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    consultationId: `consultation_${Date.now()}`,
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
};
