// src/store/petSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { Pet, SpeciesOption, MedicalRecord, VaccinationRecord } from '@/types';

interface RejectedAction extends AnyAction { payload: unknown; }
function isRejectedAction(action: AnyAction): action is RejectedAction { return action.type.endsWith('/rejected'); }

interface PetState {
  pets: Pet[];
  searchResults: Pet[];
  speciesList: SpeciesOption[];
  selectedPet: Pet | null;
  medicalRecords: MedicalRecord[];
  vaccinationRecords: VaccinationRecord[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PetState = {
  pets: [],
  searchResults: [],
  speciesList: [],
  selectedPet: null,
  medicalRecords: [],
  vaccinationRecords: [],
  status: 'idle',
  error: null,
};

// --- Pet Thunks ---
export const fetchPets = createAsyncThunk('pets/fetchPets', async (includeInactive: boolean = false, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/pets/?include_inactive=${includeInactive}`);
        return response.data.items;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail); }
});

export const fetchPetById = createAsyncThunk('pets/fetchPetById', async (petId: number, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/pets/${petId}`);
        return response.data;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail); }
});

export const createPet = createAsyncThunk('pets/createPet', async (petData: any, { rejectWithValue }) => {
    try {
        const response = await apiClient.post('/pets', petData);
        return response.data;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail); }
});

export const updatePet = createAsyncThunk('pets/updatePet', async ({ petId, petData }: { petId: number, petData: Partial<Pet> }, { rejectWithValue }) => {
    try {
        const response = await apiClient.put(`/pets/${petId}`, petData);
        return response.data;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail); }
});

export const deletePet = createAsyncThunk('pets/deletePet', async (petId: number, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/pets/${petId}`);
    return petId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || '刪除寵物失敗');
  }
});

export const restorePet = createAsyncThunk('pets/restorePet', async (petId: number, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/pets/${petId}/restore`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || '恢復寵物失敗');
  }
});

export const uploadPetAvatar = createAsyncThunk('pets/uploadPetAvatar', async ({ petId, avatarFile }: { petId: number, avatarFile: File }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const response = await apiClient.post(`/pets/${petId}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return response.data;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail); }
});

export const fetchSpeciesList = createAsyncThunk('pets/fetchSpeciesList', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/pets/species');
        return response.data;
    } catch (error: any) { return rejectWithValue('獲取物種列表失敗'); }
});

export const searchPets = createAsyncThunk('pets/searchPets', async (params: { query?: string; species?: string }, { rejectWithValue }) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('q', params.query);
        if (params.species) queryParams.append('species', params.species);
        const response = await apiClient.get(`/pets/search?${queryParams.toString()}`);
        return response.data.items;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail); }
});

// --- Medical & Vaccination Thunks (根據新的 API 端點更新) ---
export const fetchMedicalRecords = createAsyncThunk(
  'pets/fetchMedicalRecords',
  async (petId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/medical/pets/${petId}/records`);
      return response.data;
    } catch (error: any) { return rejectWithValue('獲取醫療記錄失敗'); }
  }
);

export const addMedicalRecord = createAsyncThunk(
  'pets/addMedicalRecord',
  async (recordData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/medical/records`, recordData);
      return response.data;
    } catch (error: any) { return rejectWithValue('新增醫療記錄失敗'); }
  }
);

export const fetchVaccinationRecords = createAsyncThunk(
  'pets/fetchVaccinationRecords',
  async (petId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/medical/pets/${petId}/vaccinations`);
      return response.data;
    } catch (error: any) { return rejectWithValue('獲取疫苗記錄失敗'); }
  }
);

// 注意：新增疫苗是透過新增醫療記錄的 API，並在其中包含 vaccinations 陣列
// 這裏我們保留 addMedicalRecord 即可

const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearSearchResults: (state) => { state.searchResults = []; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPets.fulfilled, (state, action: PayloadAction<Pet[]>) => { state.pets = action.payload; })
      .addCase(fetchPetById.fulfilled, (state, action: PayloadAction<Pet>) => { state.selectedPet = action.payload; })
      .addCase(createPet.fulfilled, (state, action: PayloadAction<Pet>) => { state.pets.unshift(action.payload); })
      .addCase(updatePet.fulfilled, (state, action: PayloadAction<Pet>) => {
        const index = state.pets.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.pets[index] = action.payload;
        if (state.selectedPet?.id === action.payload.id) state.selectedPet = action.payload;
      })
      .addCase(deletePet.fulfilled, (state, action: PayloadAction<number>) => {
        const pet = state.pets.find(p => p.id === action.payload);
        if (pet) {
          pet.is_active = false;
        }
      })
      .addCase(restorePet.fulfilled, (state, action: PayloadAction<Pet>) => {
        const pet = state.pets.find(p => p.id === action.payload.id);
        if (pet) {
          pet.is_active = true;
        }
      })
      .addCase(uploadPetAvatar.fulfilled, (state, action: PayloadAction<Pet>) => {
        const index = state.pets.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.pets[index].avatar_url = action.payload.avatar_url;
        if (state.selectedPet?.id === action.payload.id) state.selectedPet.avatar_url = action.payload.avatar_url;
      })
      .addCase(fetchSpeciesList.fulfilled, (state, action: PayloadAction<SpeciesOption[]>) => { state.speciesList = action.payload; })
      .addCase(searchPets.fulfilled, (state, action: PayloadAction<Pet[]>) => { state.searchResults = action.payload; })
      .addCase(fetchMedicalRecords.fulfilled, (state, action: PayloadAction<MedicalRecord[]>) => { state.medicalRecords = action.payload; })
      .addCase(addMedicalRecord.fulfilled, (state, action: PayloadAction<MedicalRecord>) => { state.medicalRecords.unshift(action.payload); })
      .addCase(fetchVaccinationRecords.fulfilled, (state, action: PayloadAction<VaccinationRecord[]>) => { state.vaccinationRecords = action.payload; })
      .addMatcher((action) => action.type.startsWith('pets/') && action.type.endsWith('/pending'), (state) => { 
        state.status = 'loading'; state.error = null; 
      })
      .addMatcher((action): action is RejectedAction => action.type.startsWith('pets/') && isRejectedAction(action), (state, action) => { 
        state.status = 'failed'; state.error = action.payload as string; 
      })
      .addMatcher((action) => action.type.startsWith('pets/') && action.type.endsWith('/fulfilled'), (state) => { 
        state.status = 'succeeded'; 
      });
  }
});

export const { clearSearchResults } = petSlice.actions;
export default petSlice.reducer;

