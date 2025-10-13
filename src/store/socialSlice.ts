// src/store/socialSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { UserPublicProfile, RelationshipStatus, FriendRequest, BlockedUser, SocialStats } from '@/types';

interface RejectedAction extends AnyAction { payload: unknown; }
function isRejectedAction(action: AnyAction): action is RejectedAction { return action.type.endsWith('/rejected'); }

interface SocialState {
  friends: UserPublicProfile[];
  friendRequests: FriendRequest[];
  followers: UserPublicProfile[];
  following: UserPublicProfile[];
  blockedUsers: BlockedUser[];
  stats: SocialStats | null;
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
  followers: [],
  following: [],
  blockedUsers: [],
  stats: null,
  searchResults: [],
  userProfile: {
    data: null,
    relationship: null,
  },
  status: 'idle',
  error: null,
};

// --- Thunks (好友相關) ---
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

// --- Thunks (關注相關) ---
export const followUser = createAsyncThunk('social/followUser', async (userId: number, { dispatch, rejectWithValue }) => {
    try {
        await apiClient.post(`/social/follow/${userId}`);
        dispatch(fetchUserProfile(userId)); // 成功後刷新關係
        return userId;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '關注用戶失敗'); }
});

export const unfollowUser = createAsyncThunk('social/unfollowUser', async (userId: number, { dispatch, rejectWithValue }) => {
    try {
        await apiClient.delete(`/social/follow/${userId}`);
        dispatch(fetchUserProfile(userId)); // 成功後刷新關係
        return userId;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '取消關注失敗'); }
});

// --- Thunks (封鎖相關) ---
export const blockUser = createAsyncThunk('social/blockUser', async (userId: number, { dispatch, rejectWithValue }) => {
    try {
        await apiClient.post(`/social/block/${userId}`);
        dispatch(fetchUserProfile(userId)); // 成功後刷新關係
        return userId;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '封鎖用戶失敗'); }
});

export const unblockUser = createAsyncThunk('social/unblockUser', async (userId: number, { dispatch, rejectWithValue }) => {
    try {
        await apiClient.delete(`/social/block/${userId}`);
        dispatch(fetchUserProfile(userId));
        dispatch(fetchBlockedUsers());
        return userId;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '解除封鎖失敗'); }
});

// ---  ---
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

export const fetchFollowers = createAsyncThunk('social/fetchFollowers', async (userId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/social/users/${userId}/followers`);
      return response.data.items;
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const fetchFollowing = createAsyncThunk('social/fetchFollowing', async (userId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/social/users/${userId}/following`);
      return response.data.items;
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const fetchBlockedUsers = createAsyncThunk('social/fetchBlockedUsers', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/social/blocked');
        return response.data.items;
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const fetchSocialStats = createAsyncThunk('social/fetchSocialStats', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/social/statistics');
        return response.data;
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});


const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.fulfilled, (state, action: PayloadAction<UserPublicProfile[]>) => { state.friends = action.payload; })
      .addCase(fetchFriendRequests.fulfilled, (state, action: PayloadAction<FriendRequest[]>) => { state.friendRequests = action.payload; })
      .addCase(searchUsers.fulfilled, (state, action) => { state.searchResults = action.payload; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => { 
        state.userProfile.data = action.payload.profile; 
        state.userProfile.relationship = action.payload.relationship;
      })
      .addCase(fetchFollowers.fulfilled, (state, action: PayloadAction<UserPublicProfile[]>) => { state.followers = action.payload; })
      .addCase(fetchFollowing.fulfilled, (state, action: PayloadAction<UserPublicProfile[]>) => { state.following = action.payload; })
      .addCase(fetchBlockedUsers.fulfilled, (state, action: PayloadAction<BlockedUser[]>) => { state.blockedUsers = action.payload; })
      .addCase(fetchSocialStats.fulfilled, (state, action: PayloadAction<SocialStats>) => { state.stats = action.payload; })
      .addMatcher((action) => action.type.startsWith('social/') && action.type.endsWith('/pending'), (state) => { 
        state.status = 'loading'; state.error = null; 
      })
      .addMatcher((action): action is RejectedAction => action.type.startsWith('social/') && isRejectedAction(action), (state, action) => {
        state.status = 'failed'; state.error = action.payload as string; 
      })
      .addMatcher((action) => action.type.startsWith('social/') && action.type.endsWith('/fulfilled'), (state) => { 
        state.status = 'succeeded'; 
      });
  },
});

export default socialSlice.reducer;
