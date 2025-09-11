// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, setUser } from '@/store/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams(); // 使用 hook
  const { status, error, token } = useAppSelector((state) => state.auth);
  const [reasonMessage, setReasonMessage] = useState('');

  useEffect(() => {
    // 檢查 URL 中是否有 reason 參數
    const reason = searchParams.get('reason');
    if (reason === 'password_changed') {
      setReasonMessage('您的密碼已更新，請使用新密碼重新登入。');
    }
    // 如果已經登入，直接跳轉到 dashboard
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ username, password }));
    if (loginUser.fulfilled.match(result)) {
      try {
        const userResponse = await apiClient.get('/users/me', { headers: { Authorization: `Bearer ${result.payload.access_token}` } });
        dispatch(setUser(userResponse.data));
        router.push('/dashboard');
      } catch (e) {
        console.error("Failed to fetch user data after login");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        {reasonMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4 text-center">{reasonMessage}</p>}
        {error && status === 'failed' && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">用戶名稱或 Email</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">密碼</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300" disabled={status === 'loading'}>
          {status === 'loading' ? '登入中...' : '登入'}
        </button>
      </form>
       <p className="text-center mt-4">
        還沒有帳號嗎？ <Link href="/register" className="text-blue-600">立即註冊</Link>
      </p>
    </div>
  );
}