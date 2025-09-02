// src/lib/apiInterceptor.ts
import apiClient from './apiClient';
import { store } from '@/store/store';
import { refreshToken, logout } from '@/store/authSlice';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const setupAxiosInterceptors = () => {
    // 請求攔截器
    apiClient.interceptors.request.use(
        (config) => {
            const token = store.getState().auth.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    `[API Request] ==> ${config.method?.toUpperCase()} ${config.url}`,
                    config.data || config.params || ''
                );
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // 回應攔截器
    apiClient.interceptors.response.use(
        (response) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[API Response] <== ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
            }
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
        
            // 檢查是否是 Token 過期的 401 錯誤，且不是重試請求
            if (error.response?.status === 401 && error.response.data.detail === 'Token has expired' && !originalRequest._retry) {
                
                originalRequest._retry = true; // 標記為重試請求
                console.log('[API Interceptor] Access token expired. Attempting to refresh...');

                try {
                const resultAction = await store.dispatch(refreshToken());
                
                if (refreshToken.fulfilled.match(resultAction)) {
                    const newAccessToken = resultAction.payload.access_token;
                    console.log('[API Interceptor] Token refreshed successfully. Retrying original request.');
                    
                    // 更新原始請求的 header
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    // 重新發送原始請求
                    return apiClient(originalRequest);
                } else {
                    // 如果 Redux thunk 返回 rejected，代表刷新失敗
                    console.error('[API Interceptor] Failed to refresh token. Logging out.');
                    store.dispatch(logout());
                    // 可選：可以將頁面重定向到登入頁
                    // window.location.href = '/login'; 
                    return Promise.reject(error);
                }
                } catch (refreshError) {
                console.error('[API Interceptor] An error occurred during token refresh. Logging out.', refreshError);
                store.dispatch(logout());
                return Promise.reject(refreshError);
                }
            }

            // 對於其他所有錯誤，正常印出日誌並拒絕
            if (process.env.NODE_ENV === 'development') {
                console.error(`[API Error] <== ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
            }

            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;
