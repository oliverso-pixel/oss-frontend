// src/app/(protected)/friends/page.tsx
"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFriends } from '@/store/socialSlice';
import UserCard from '@/components/ui/UserCard';
import { Users } from 'lucide-react';

export default function FriendsPage() {
  const dispatch = useAppDispatch();
  const { friends, status } = useAppSelector((state) => state.social);

  useEffect(() => {
    // 當組件掛載時，從後端獲取好友列表
    dispatch(fetchFriends());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">我的好友</h1>

      {status === 'loading' && <p className="text-center text-muted-foreground">正在載入好友列表...</p>}
      
      {status === 'succeeded' && friends.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400"/>
            <h3 className="mt-2 text-sm font-medium text-gray-900">尚無好友</h3>
            <p className="mt-1 text-sm text-gray-500">快去「探索用戶」頁面，尋找志同道合的新朋友吧！</p>
        </div>
      )}

      {status === 'succeeded' && friends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

       {status === 'failed' && <p className="text-center text-destructive">無法載入好友列表，請稍後再試。</p>}
    </div>
  );
}
