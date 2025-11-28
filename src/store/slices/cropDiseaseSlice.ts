
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiseaseDetectionResult, ExpertConsultation } from '../../services/cropDiseaseService';

interface CropDiseaseState {
  currentDetection: DiseaseDetectionResult | null;
  detectionHistory: DiseaseDetectionResult[];
  availableExperts: ExpertConsultation[];
  isDetecting: boolean;
  isLoadingExperts: boolean;
  error: string | null;
}

const initialState: CropDiseaseState = {
  currentDetection: null,
  detectionHistory: [],
  availableExperts: [],
  isDetecting: false,
  isLoadingExperts: false,
  error: null,
};

const cropDiseaseSlice = createSlice({
  name: 'cropDisease',
  initialState,
  reducers: {
    setDetecting: (state, action: PayloadAction<boolean>) => {
      state.isDetecting = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setLoadingExperts: (state, action: PayloadAction<boolean>) => {
      state.isLoadingExperts = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setCurrentDetection: (state, action: PayloadAction<DiseaseDetectionResult>) => {
      state.currentDetection = action.payload;
      state.detectionHistory.unshift(action.payload);
      state.isDetecting = false;
      state.error = null;
    },
    setAvailableExperts: (state, action: PayloadAction<ExpertConsultation[]>) => {
      state.availableExperts = action.payload;
      state.isLoadingExperts = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isDetecting = false;
      state.isLoadingExperts = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDetection: (state) => {
      state.currentDetection = null;
    },
  },
});

export const {
  setDetecting,
  setLoadingExperts,
  setCurrentDetection,
  setAvailableExperts,
  setError,
  clearError,
  clearCurrentDetection,
} = cropDiseaseSlice.actions;

export default cropDiseaseSlice.reducer;
