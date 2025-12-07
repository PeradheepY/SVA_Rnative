import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Field,
  FieldInput,
  FieldHealthMetrics,
  createField,
  getUserFields,
  getFieldById,
  updateField,
  updateFieldMetrics,
  deleteField,
  calculateFieldStatus,
  getMockFields,
} from '../../services/fieldService';

interface FieldState {
  fields: Field[];
  selectedField: Field | null;
  loading: boolean;
  error: string | null;
  useMockData: boolean;
}

const initialState: FieldState = {
  fields: [],
  selectedField: null,
  loading: false,
  error: null,
  useMockData: true, // Use mock data by default for development
};

// Async thunks
export const fetchUserFields = createAsyncThunk(
  'field/fetchUserFields',
  async (userId: string, { getState }) => {
    const state = getState() as { field: FieldState };
    
    if (state.field.useMockData) {
      return getMockFields(userId);
    }
    
    return await getUserFields(userId);
  }
);

export const fetchFieldById = createAsyncThunk(
  'field/fetchFieldById',
  async (fieldId: string, { getState }) => {
    const state = getState() as { field: FieldState };
    
    // If using mock data, find the field in already loaded fields
    if (state.field.useMockData) {
      const field = state.field.fields.find((f) => f.id === fieldId);
      if (field) {
        return field;
      }
      throw new Error('Field not found');
    }
    
    return await getFieldById(fieldId);
  }
);

export const addField = createAsyncThunk(
  'field/addField',
  async (fieldData: FieldInput) => {
    const fieldId = await createField(fieldData);
    return { id: fieldId, ...fieldData };
  }
);

export const modifyField = createAsyncThunk(
  'field/modifyField',
  async ({ fieldId, updates }: { fieldId: string; updates: Partial<Field> }) => {
    await updateField(fieldId, updates);
    return { fieldId, updates };
  }
);

export const modifyFieldMetrics = createAsyncThunk(
  'field/modifyFieldMetrics',
  async ({ fieldId, metrics }: { fieldId: string; metrics: Partial<FieldHealthMetrics> }) => {
    await updateFieldMetrics(fieldId, metrics);
    return { fieldId, metrics };
  }
);

export const removeField = createAsyncThunk(
  'field/removeField',
  async (fieldId: string) => {
    await deleteField(fieldId);
    return fieldId;
  }
);

const fieldSlice = createSlice({
  name: 'field',
  initialState,
  reducers: {
    setSelectedField: (state, action: PayloadAction<Field | null>) => {
      state.selectedField = action.payload;
    },
    clearFieldError: (state) => {
      state.error = null;
    },
    setUseMockData: (state, action: PayloadAction<boolean>) => {
      state.useMockData = action.payload;
    },
    updateLocalFieldMetrics: (state, action: PayloadAction<{ fieldId: string; metrics: Partial<FieldHealthMetrics> }>) => {
      const field = state.fields.find((f) => f.id === action.payload.fieldId);
      if (field) {
        field.healthMetrics = {
          ...field.healthMetrics,
          ...action.payload.metrics,
        };
        field.updatedAt = new Date().toISOString();
      }
      
      if (state.selectedField && state.selectedField.id === action.payload.fieldId) {
        state.selectedField.healthMetrics = {
          ...state.selectedField.healthMetrics,
          ...action.payload.metrics,
        };
        state.selectedField.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user fields
      .addCase(fetchUserFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload;
      })
      .addCase(fetchUserFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fields';
      })
      // Fetch field by ID
      .addCase(fetchFieldById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFieldById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedField = action.payload;
      })
      .addCase(fetchFieldById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch field';
      })
      // Add field
      .addCase(addField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addField.fulfilled, (state, action) => {
        state.loading = false;
        state.fields.push(action.payload as Field);
      })
      .addCase(addField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add field';
      })
      // Modify field
      .addCase(modifyField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyField.fulfilled, (state, action) => {
        state.loading = false;
        const { fieldId, updates } = action.payload;
        const index = state.fields.findIndex((f) => f.id === fieldId);
        if (index !== -1) {
          state.fields[index] = { ...state.fields[index], ...updates };
        }
        if (state.selectedField && state.selectedField.id === fieldId) {
          state.selectedField = { ...state.selectedField, ...updates };
        }
      })
      .addCase(modifyField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update field';
      })
      // Modify field metrics
      .addCase(modifyFieldMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyFieldMetrics.fulfilled, (state, action) => {
        state.loading = false;
        const { fieldId, metrics } = action.payload;
        const field = state.fields.find((f) => f.id === fieldId);
        if (field) {
          field.healthMetrics = { ...field.healthMetrics, ...metrics };
          field.updatedAt = new Date().toISOString();
        }
        if (state.selectedField && state.selectedField.id === fieldId) {
          state.selectedField.healthMetrics = { ...state.selectedField.healthMetrics, ...metrics };
          state.selectedField.updatedAt = new Date().toISOString();
        }
      })
      .addCase(modifyFieldMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update field metrics';
      })
      // Remove field
      .addCase(removeField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeField.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = state.fields.filter((f) => f.id !== action.payload);
        if (state.selectedField && state.selectedField.id === action.payload) {
          state.selectedField = null;
        }
      })
      .addCase(removeField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete field';
      });
  },
});

export const {
  setSelectedField,
  clearFieldError,
  setUseMockData,
  updateLocalFieldMetrics,
} = fieldSlice.actions;

export default fieldSlice.reducer;

// Selectors
export const selectAllFields = (state: { field: FieldState }) => state.field.fields;
export const selectSelectedField = (state: { field: FieldState }) => state.field.selectedField;
export const selectFieldLoading = (state: { field: FieldState }) => state.field.loading;
export const selectFieldError = (state: { field: FieldState }) => state.field.error;

export const selectFieldsWithStatus = (state: { field: FieldState }) => {
  return state.field.fields.map((field) => ({
    ...field,
    statusInfo: calculateFieldStatus(field.healthMetrics),
  }));
};

export const selectFieldById = (state: { field: FieldState }, fieldId: string) => {
  return state.field.fields.find((f) => f.id === fieldId);
};

export const selectFieldsNeedingAttention = (state: { field: FieldState }) => {
  return state.field.fields.filter((field) => {
    const status = calculateFieldStatus(field.healthMetrics);
    return status.needsAttention;
  });
};
