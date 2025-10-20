// src/store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { UserResponse, PrivacySettings } from '@/types';

// 類型防護，確保 rejected action 有 payload
interface RejectedAction extends AnyAction { payload: unknown; }
function isRejectedAction(action: AnyAction): action is RejectedAction { return action.type.endsWith('/rejected'); }

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  refreshToken: string | null;
  privacySettings: PrivacySettings | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  privacySettings: null,
  status: 'idle',
  error: null,
};

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    const currentRefreshToken = auth.refreshToken;
    if (!currentRefreshToken) return rejectWithValue('No refresh token available');
    try {
      const response = await apiClient.post('/auth/refresh', { refresh_token: currentRefreshToken });
      return response.data;
    } catch (error: any) { return rejectWithValue('Failed to refresh token'); }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return rejectWithValue(error.response.data.detail || '註冊失敗');
      return rejectWithValue('網路錯誤或無法連接到伺服器。');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('username', credentials.username);
      params.append('password', credentials.password);
      const response = await apiClient.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return rejectWithValue(error.response.data.detail || '登入失敗');
      return rejectWithValue('網路錯誤或無法連接到伺服器。');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error: any) { return rejectWithValue('無法獲取用戶資料'); }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, data }: { userId: number, data: Partial<UserResponse> }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, data);
      dispatch(fetchUser()); // 成功後刷新用戶資料
      return response.data;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '更新資料失敗'); }
  }
);

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (avatarFile: File, { dispatch, rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', avatarFile);
    // 新增 crop_data (可選，此處為範例)
    const cropData = JSON.stringify({ x: 0, y: 0, width: 200, height: 200 });
    formData.append('crop_data', cropData);

    // 更新 API 端點
    const response = await apiClient.post('/media/upload/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch(fetchUser()); // 上傳成功後，刷新用戶資料以獲取新的頭像 URL
    return response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '上傳頭像失敗'); }
});

export const deleteAvatar = createAsyncThunk('auth/deleteAvatar', async (_, { dispatch, rejectWithValue }) => {
  try {
    // 更新 API 端點
    const response = await apiClient.delete('/users/me/avatar');
      dispatch(fetchUser()); // 刪除成功後，刷新用戶資料
      return response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '移除頭像失敗'); }
});

export const uploadBackgroundImage = createAsyncThunk('auth/uploadBackgroundImage', async (backgroundImageFile: File, { dispatch, rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('file', backgroundImageFile);
        const response = await apiClient.post('/media/upload/user/background', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        dispatch(fetchUser());
        return response.data;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '上傳背景圖失敗'); }
});

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) { return rejectWithValue(error.response?.data?.detail || '修改密碼失敗'); }
  }
);

export const fetchPrivacySettings = createAsyncThunk(
  'auth/fetchPrivacySettings',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}/privacy`);
      return response.data;
    } catch (error: any) { return rejectWithValue('無法獲取隱私設定'); }
  }
);

export const updatePrivacySettings = createAsyncThunk(
  'auth/updatePrivacySettings',
  async ({ userId, data }: { userId: number, data: PrivacySettings }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/users/${userId}/privacy`, data);
      dispatch(fetchPrivacySettings(userId));
      return response.data;
    } catch (error: any) { return rejectWithValue('更新隱私設定失敗'); }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    // logout 現在是一個純粹的狀態更新函式
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchPrivacySettings.fulfilled, (state, action: PayloadAction<PrivacySettings>) => {
        state.privacySettings = action.payload;
      })
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state) => {
        state.status = 'succeeded';
      })
      .addMatcher(
        (action): action is RejectedAction => isRejectedAction(action) && !action.type.startsWith('auth/refreshToken'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload as string;
        }
      );
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
