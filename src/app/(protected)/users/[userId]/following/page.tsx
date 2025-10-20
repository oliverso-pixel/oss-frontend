// src/app/(protected)/users/[userId]/following/page.tsx
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFollowing, fetchUserProfile } from '@/store/socialSlice';
import UserCard from '@/components/ui/UserCard';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UserFollowingPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.userId);

  const { following, status, userProfile } = useAppSelector((state) => state.social);
  
  useEffect(() => {
    if (userId) {
      dispatch(fetchFollowing(userId));
      if (!userProfile.data || userProfile.data.id !== userId) {
        dispatch(fetchUserProfile(userId));
      }
    }
  }, [dispatch, userId, userProfile.data]);

  const profileName = userProfile.data?.id === userId ? userProfile.data.display_name || userProfile.data.username : '用戶';

  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回
        </Button>
      <h1 className="text-3xl font-bold mb-6">{profileName}正在關注</h1>

      {status === 'loading' && <p className="text-center text-muted-foreground">正在載入列表...</p>}
      
      {status === 'succeeded' && following.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400"/>
            <h3 className="mt-2 text-sm font-medium">沒有正在關注的對象</h3>
            <p className="mt-1 text-sm text-gray-500">這位用戶目前沒有關注任何人。</p>
        </div>
      )}

      {status === 'succeeded' && following.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {following.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

       {status === 'failed' && <p className="text-center text-destructive">無法載入列表，請稍後再試。</p>}
    </div>
  );
}
