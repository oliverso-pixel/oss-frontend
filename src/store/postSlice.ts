// src/store/postSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { Post, Comment } from '@/types';

interface RejectedAction extends AnyAction {
  payload: unknown;
}

function isRejectedAction(action: AnyAction): action is RejectedAction {
  return action.type.endsWith('/rejected');
}

interface PostState {
  feed: Post[];
  activePost: Post | null;
  activePostComments: Comment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PostState = {
  feed: [],
  activePost: null,
  activePostComments: [],
  status: 'idle',
  error: null,
};

// --- Thunks ---
export const fetchFeed = createAsyncThunk('posts/fetchFeed', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/posts/feed');
    return response.data.items;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.detail);
  }
});

export const fetchPostById = createAsyncThunk('posts/fetchPostById', async (postId: number, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/posts/${postId}`);
        return response.data;
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const createPost = createAsyncThunk('posts/createPost', async (postData: { content: string, visibility: 'public' | 'friends' | 'private', tags: string[], media_ids?: number[] }, { dispatch, rejectWithValue }) => {
  try {
    const response = await apiClient.post('/posts', postData);
    dispatch(fetchFeed());
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.detail);
  }
});

export const uploadMedia = createAsyncThunk('posts/uploadMedia', async (file: File, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/posts/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail || "上傳失敗"); }
});

export const likePost = createAsyncThunk('posts/likePost', async (postId: number, { rejectWithValue }) => {
  try {
    await apiClient.post(`/posts/${postId}/like`);
    return postId;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.detail);
  }
});

export const unlikePost = createAsyncThunk('posts/unlikePost', async (postId: number, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/posts/${postId}/like`);
    return postId;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.detail);
  }
});

export const fetchComments = createAsyncThunk('posts/fetchComments', async (postId: number, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/posts/${postId}/comments`);
        return response.data.items;
    } catch(e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const addComment = createAsyncThunk('posts/addComment', async ({ postId, content, parentId }: { postId: number, content: string, parentId?: number | null }, { dispatch, rejectWithValue }) => {
    try {
        const response = await apiClient.post(`/posts/${postId}/comments`, { content, parent_id: parentId });
        dispatch(fetchComments(postId)); // Refresh comments after adding
        return response.data;
    } catch(e: any) { return rejectWithValue(e.response?.data?.detail); }
});


const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.feed = action.payload;
      })
      .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<Post>) => {
        state.activePost = action.payload;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.activePostComments = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action: PayloadAction<number>) => {
        const postId = action.payload;
        const post = state.feed.find(p => p.id === postId) || (state.activePost?.id === postId ? state.activePost : null);
        if (post) {
          post.is_liked_by_user = true;
          post.statistics.likes_count += 1;
        }
      })
      .addCase(unlikePost.fulfilled, (state, action: PayloadAction<number>) => {
        const postId = action.payload;
        const post = state.feed.find(p => p.id === postId) || (state.activePost?.id === postId ? state.activePost : null);
        if (post) {
          post.is_liked_by_user = false;
          post.statistics.likes_count -= 1;
        }
      })
      .addMatcher((action) => action.type.startsWith('posts/') && action.type.endsWith('/pending'), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher((action): action is RejectedAction => action.type.startsWith('posts/') && isRejectedAction(action), (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addMatcher((action) => action.type.startsWith('posts/') && action.type.endsWith('/fulfilled'), (state) => {
        state.status = 'succeeded';
      });
  },
});

export default postSlice.reducer;

