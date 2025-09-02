// src/store/socialSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { UserPublicProfile, RelationshipStatus, FriendRequest } from '@/types';

// --- 開始：新增類型防護 ---
// 這個函式是一個類型防護，它向 TypeScript 證明
// 任何匹配此條件的 action 都會有一個 payload 屬性。
interface RejectedAction extends AnyAction {
  payload: unknown;
}

function isRejectedAction(action: AnyAction): action is RejectedAction {
  return action.type.endsWith('/rejected');
}
// --- 結束：新增類型防護 ---

interface SocialState {
  friends: UserPublicProfile[];
  friendRequests: FriendRequest[];
  searchResults: UserPublicProfile[];
  userProfile: {
    data: UserPublicProfile | null;
    relationship: RelationshipStatus | null;
  }
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SocialState = {
  friends: [],
  friendRequests: [],
  searchResults: [],
  userProfile: {
    data: null,
    relationship: null,
  },
  status: 'idle',
  error: null,
};

// --- Thunks ---
export const fetchFriends = createAsyncThunk('social/fetchFriends', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/social/friends');
    return response.data.items;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '獲取好友列表失敗'); }
});

export const fetchFriendRequests = createAsyncThunk('social/fetchFriendRequests', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/social/friends/requests?type=received&status=pending');
    return response.data.items;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '獲取好友請求失敗'); }
});

export const acceptFriendRequest = createAsyncThunk('social/acceptFriendRequest', async (requestId: number, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post(`/social/friends/requests/${requestId}/accept`);
    dispatch(fetchFriendRequests());
    return requestId;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '接受好友請求失敗'); }
});

export const rejectFriendRequest = createAsyncThunk('social/rejectFriendRequest', async (requestId: number, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post(`/social/friends/requests/${requestId}/reject`);
    dispatch(fetchFriendRequests());
    return requestId;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '拒絕好友請求失敗'); }
});

export const removeFriend = createAsyncThunk('social/removeFriend', async (friendId: number, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.delete(`/social/friends/${friendId}`);
    dispatch(fetchUserProfile(friendId));
    dispatch(fetchFriends());
    return friendId;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '移除好友失敗'); }
});

export const searchUsers = createAsyncThunk('social/searchUsers', async (query: string, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/users/search/public?q=${query}`);
    return response.data.items;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '用戶搜索失敗'); }
});

export const fetchUserProfile = createAsyncThunk('social/fetchUserProfile', async (userId: number, { rejectWithValue }) => {
  try {
    const [profileRes, relationshipRes] = await Promise.all([
      apiClient.get(`/users/${userId}`),
      apiClient.get(`/social/relationship/${userId}`)
    ]);
    return { profile: profileRes.data, relationship: relationshipRes.data };
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '獲取用戶資料失敗'); }
});

export const sendFriendRequest = createAsyncThunk('social/sendFriendRequest', async (userId: number, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.post(`/social/friends/request/${userId}`);
    dispatch(fetchUserProfile(userId));
    return userId;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '發送好友請求失敗'); }
});


const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.fulfilled, (state, action: PayloadAction<UserPublicProfile[]>) => {
        state.friends = action.payload;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action: PayloadAction<FriendRequest[]>) => {
        state.friendRequests = action.payload;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.userProfile.data = action.payload.profile;
        state.userProfile.relationship = action.payload.relationship;
      })
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // --- 開始：使用類型防護修正 addMatcher ---
      .addMatcher(
        isRejectedAction, // 使用我們的類型防護函式
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload as string;
        }
      )
      // --- 結束：使用類型防護修正 addMatcher ---
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state) => {
        state.status = 'succeeded';
      });
  },
});

export default socialSlice.reducer;
