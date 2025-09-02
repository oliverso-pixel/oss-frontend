// src/store/petSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { Pet } from '@/types';

interface PetState {
  pets: Pet[];
  selectedPet: Pet | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PetState = {
  pets: [],
  selectedPet: null,
  status: 'idle',
  error: null,
};

export const fetchPets = createAsyncThunk('pets/fetchPets', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/pets');
    return response.data.items;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch pets');
  }
});

export const fetchPetById = createAsyncThunk('pets/fetchPetById', async (petId: number, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/pets/${petId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch pet details');
  }
});

export const createPet = createAsyncThunk('pets/createPet', async (petData: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/pets', petData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create pet');
  }
});

export const updatePet = createAsyncThunk('pets/updatePet', async ({ petId, petData }: { petId: number, petData: Partial<Pet> }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/pets/${petId}`, petData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to update pet');
  }
});

export const deletePet = createAsyncThunk('pets/deletePet', async (petId: number, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/pets/${petId}`);
    return petId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to delete pet');
  }
});


const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPets.fulfilled, (state, action: PayloadAction<Pet[]>) => {
        state.status = 'succeeded';
        state.pets = action.payload;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPetById.fulfilled, (state, action: PayloadAction<Pet>) => {
        state.selectedPet = action.payload;
      })
      .addCase(createPet.fulfilled, (state, action: PayloadAction<Pet>) => {
        state.pets.push(action.payload);
      })
      .addCase(updatePet.fulfilled, (state, action: PayloadAction<Pet>) => {
        const index = state.pets.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        if (state.selectedPet?.id === action.payload.id) {
          state.selectedPet = action.payload;
        }
      })
      .addCase(deletePet.fulfilled, (state, action: PayloadAction<number>) => {
        state.pets = state.pets.filter(p => p.id !== action.payload);
      });
  }
});

export default petSlice.reducer;

