// src/store/postSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';
import { Post, Comment, Media } from '@/types';

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

interface CreatePostPayload {
  content: string;
  visibility: 'public' | 'friends' | 'private';
  tags?: string[];
  pet_id?: number | null;
  media_ids?: number[];
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

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

export const createPost = createAsyncThunk('posts/createPost', async (postData: CreatePostPayload, { dispatch, rejectWithValue }) => {
  try {
    const response = await apiClient.post('/posts', postData);
    dispatch(fetchFeed());
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.detail);
  }
});

export const uploadPostMedia = createAsyncThunk('posts/uploadPostMedia', async (files: File[], { rejectWithValue }) => {
    try {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });
        const response = await apiClient.post('/media/upload/post', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.success as Media[];
    } catch (e: any) { return rejectWithValue(e.response?.data?.detail || "上傳失敗"); }
});

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }: { postId: number, postData: Partial<Post> }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/posts/${postId}`, postData);
      // 同時更新 feed 和 activePost
      dispatch(fetchFeed());
      dispatch(fetchPostById(postId));
      return response.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.detail);
    }
  }
);

export const toggleComments = createAsyncThunk(
    'posts/toggleComments',
    async ({ postId, enabled }: { postId: number, enabled: boolean }, { dispatch, rejectWithValue }) => {
        try {
            await apiClient.post(`/posts/${postId}/comments/toggle?enabled=${enabled}`);
            dispatch(fetchPostById(postId)); 
            return { postId, enabled };
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.detail);
        }
    }
);

// export const uploadMedia = createAsyncThunk('posts/uploadMedia', async (file: File, { rejectWithValue }) => {
//     try {
//         const formData = new FormData();
//         formData.append('file', file);
//         const response = await apiClient.post('/posts/media/upload', formData, {
//             headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         return response.data;
//     } catch (e: any) { return rejectWithValue(e.response?.data?.detail || "上傳失敗"); }
// });

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

export const fetchComments = createAsyncThunk('posts/fetchComments', async ({ postId, sortBy }: { postId: number, sortBy?: string }, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/posts/${postId}/comments`, { params: { sort_by: sortBy } });
        return response.data;
    } catch(e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const addComment = createAsyncThunk('posts/addComment', async ({ postId, content, parent_id, quoted_comment_id }: { postId: number, content: string, parent_id?: number | null, quoted_comment_id?: number | null }, { dispatch, rejectWithValue }) => {
    try {
        const response = await apiClient.post(`/posts/${postId}/comments`, { content, parent_id, quoted_comment_id });
        dispatch(fetchComments({ postId })); 
        dispatch(fetchPostById(postId));
        return response.data;
    } catch(e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const likeComment = createAsyncThunk('posts/likeComment', async (commentId: number, { rejectWithValue }) => {
    try {
        await apiClient.post(`/posts/comments/${commentId}/like`);
        return commentId;
    } catch(e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const unlikeComment = createAsyncThunk('posts/unlikeComment', async (commentId: number, { rejectWithValue }) => {
    try {
        await apiClient.delete(`/posts/comments/${commentId}/like`);
        return commentId;
    } catch(e: any) { return rejectWithValue(e.response?.data?.detail); }
});

export const deleteComment = createAsyncThunk('posts/deleteComment', async ({ commentId, reason }: { commentId: number, reason?: string }, { dispatch, rejectWithValue }) => {
    try {
        const response = await apiClient.delete(`/posts/comments/${commentId}`, { params: { reason }});
        // After deleting, we need to refresh the comments of the post the comment belonged to.
        // This assumes we have access to postId, which we might need to adjust how we call this.
        // For now, the component will be responsible for refreshing.
        return { commentId, deletedComment: response.data };
    } catch(e: any) { return rejectWithValue(e.response?.data?.detail); }
});


const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const findAndUpdateComment = (comments: Comment[], commentId: number, updateFn: (comment: Comment) => void): Comment[] => {
        return comments.map(comment => {
            if (comment.id === commentId) {
                const newComment = { ...comment };
                updateFn(newComment);
                return newComment;
            }
            if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: findAndUpdateComment(comment.replies, commentId, updateFn) };
            }
            return comment;
        });
    };

    builder
      .addCase(fetchFeed.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.feed = action.payload;
      })
      .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<Post>) => {
        state.activePost = action.payload;
        state.activePostComments = action.payload.comments || [];
      })
      .addCase(updatePost.fulfilled, (state, action: PayloadAction<Post>) => {
        if (state.activePost && state.activePost.id === action.payload.id) {
            state.activePost = action.payload;
        }
        const index = state.feed.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
            state.feed[index] = action.payload;
        }
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.activePostComments = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action: PayloadAction<number>) => {
        const postId = action.payload;
        const post = state.feed.find(p => p.id === postId) || (state.activePost?.id === postId ? state.activePost : null);
        if (post) {
          post.is_liked = true;
          post.like_count += 1;
        }
      })
      .addCase(unlikePost.fulfilled, (state, action: PayloadAction<number>) => {
        const postId = action.payload;
        const post = state.feed.find(p => p.id === postId) || (state.activePost?.id === postId ? state.activePost : null);
        if (post) {
          post.is_liked = false;
          post.like_count -= 1;
        }
      })
      .addCase(likeComment.fulfilled, (state, action: PayloadAction<number>) => {
          state.activePostComments = findAndUpdateComment(state.activePostComments, action.payload, (comment) => {
              comment.is_liked = true;
              comment.like_count += 1;
          });
      })
      .addCase(unlikeComment.fulfilled, (state, action: PayloadAction<number>) => {
          state.activePostComments = findAndUpdateComment(state.activePostComments, action.payload, (comment) => {
              comment.is_liked = false;
              comment.like_count -= 1;
          });
      })
       .addCase(deleteComment.fulfilled, (state, action: PayloadAction<{ commentId: number, deletedComment: Comment }>) => {
           const { commentId, deletedComment } = action.payload;
           state.activePostComments = findAndUpdateComment(state.activePostComments, commentId, (comment) => {
               comment.is_deleted = true;
               comment.content = deletedComment.content; // API returns "[此評論已被刪除]"
           });
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

