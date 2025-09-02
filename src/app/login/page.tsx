// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, setUser } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error, token } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ username, password }));

    if (loginUser.fulfilled.match(result)) {
      // 登入成功後，獲取用戶資訊並存儲
      try {
        const userResponse = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${result.payload.access_token}` },
        });
        // 使用新的 setUser action
        dispatch(setUser(userResponse.data));
        router.push('/dashboard');
      } catch (e) {
        console.error("Failed to fetch user data after login");
      }
    }
  };
  
  // 如果已經登入，直接跳轉到 dashboard
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);


  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        {error && status === 'failed' && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Username or Email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </button>
      </form>
       <p className="text-center mt-4">
        Don't have an account? <Link href="/register" className="text-blue-600">Register now</Link>
      </p>
    </div>
  );
}