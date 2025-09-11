// src/store/transferSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { PetTransferRequest, PetTransferHistory } from '@/types';

interface RejectedAction extends AnyAction { payload: unknown; }
function isRejectedAction(action: AnyAction): action is RejectedAction { return action.type.endsWith('/rejected'); }

interface TransferState {
  receivedRequests: PetTransferRequest[];
  sentRequests: PetTransferRequest[];
  petHistory: PetTransferHistory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransferState = {
  receivedRequests: [],
  sentRequests: [],
  petHistory: [],
  status: 'idle',
  error: null,
};

// --- Thunks ---
export const fetchReceivedRequests = createAsyncThunk('transfer/fetchReceived', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/pet-transfer/transfer/requests/received?status=pending');
    return response.data.items;
  } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const fetchSentRequests = createAsyncThunk('transfer/fetchSent', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/pet-transfer/transfer/requests/sent?status=pending');
    return response.data.items;
  } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const requestPetTransfer = createAsyncThunk('transfer/request', async (data: { petId: number, toUserId: number, reason: string }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(`/pet-transfer/pets/${data.petId}/transfer/request`, {
      to_user_id: data.toUserId,
      transfer_type: 'gift', // 暫時寫死為 gift
      transfer_reason: data.reason,
    });
    return response.data;
  } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const acceptTransfer = createAsyncThunk('transfer/accept', async (requestId: number, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post(`/pet-transfer/transfer/${requestId}/accept`);
    dispatch(fetchReceivedRequests()); // 成功後刷新列表
    return requestId;
  } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const rejectTransfer = createAsyncThunk('transfer/reject', async (requestId: number, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post(`/pet-transfer/transfer/${requestId}/reject`);
    dispatch(fetchReceivedRequests()); // 成功後刷新列表
    return requestId;
  } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const cancelTransfer = createAsyncThunk('transfer/cancel', async (requestId: number, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post(`/pet-transfer/transfer/${requestId}/cancel`);
    dispatch(fetchSentRequests()); // 成功後刷新列表
    return requestId;
  } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const fetchPetTransferHistory = createAsyncThunk('transfer/fetchHistory', async (petId: number, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/pet-transfer/pets/${petId}/transfer/history`);
        // return response.data.items;
        return response.data;
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail || '獲取轉移歷史失敗'); }
});


const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceivedRequests.fulfilled, (state, action: PayloadAction<PetTransferRequest[]>) => {
        state.receivedRequests = action.payload;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action: PayloadAction<PetTransferRequest[]>) => {
        state.sentRequests = action.payload;
      })
      .addCase(fetchPetTransferHistory.fulfilled, (state, action: PayloadAction<PetTransferHistory[]>) => {
          state.petHistory = action.payload;
      })
      .addMatcher((action) => action.type.startsWith('transfer/') && action.type.endsWith('/pending'), (state) => { 
        state.status = 'loading'; state.error = null; 
      })
      .addMatcher((action): action is RejectedAction => action.type.startsWith('transfer/') && isRejectedAction(action), (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addMatcher((action) => action.type.startsWith('transfer/') && action.type.endsWith('/fulfilled'), (state) => { 
        state.status = 'succeeded'; 
      });
  },
});

export default transferSlice.reducer;
