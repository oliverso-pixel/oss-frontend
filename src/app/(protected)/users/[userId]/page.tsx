// src/app/(protected)/users/[userId]/page.tsx
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, sendFriendRequest, removeFriend } from '@/store/socialSlice'; // 導入 removeFriend
import { Button } from '@/components/ui/Button';
import { User, Calendar, UserPlus, ArrowLeft, UserX } from 'lucide-react'; // 導入 UserX
import { format } from 'date-fns';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.userId);
  const dispatch = useAppDispatch();
  const { userProfile, status } = useAppSelector((state) => state.social);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [userId, dispatch]);

  const handleAddFriend = () => dispatch(sendFriendRequest(userId));

  const handleRemoveFriend = () => {
    if (window.confirm(`您確定要移除好友 ${userProfile.data?.display_name || userProfile.data?.username} 嗎？`)) {
      dispatch(removeFriend(userId));
    }
  };


  if (status === 'loading' && !userProfile.data) {
    return <div className="text-center p-10">正在載入個人資料...</div>;
  }

  if (status === 'failed' || !userProfile.data) {
    return <div className="text-center p-10">無法載入此用戶資料。</div>;
  }

  const { data: profile, relationship } = userProfile;
  const isSelf = currentUser?.id === profile.id;

  const renderFriendButton = () => {
    if (!relationship) return null;

    if (relationship.is_friend) {
      return (
        <Button variant="destructive" onClick={handleRemoveFriend}>
          <UserX className="mr-2 h-4 w-4" /> 移除好友
        </Button>
      );
    }
    if (relationship.has_pending_request) {
      return <Button variant="secondary" disabled>好友請求已發送</Button>;
    }
    return (
      <Button onClick={handleAddFriend}>
        <UserPlus className="mr-2 h-4 w-4" /> 加為好友
      </Button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> 返回
      </button>
      <div className="bg-white dark:bg-secondary rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-32 h-32 rounded-full object-cover border-4 border-background" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-background">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              {!isSelf && (
                <div className="flex gap-2 mt-2 sm:mt-0">
                  {renderFriendButton()}
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-foreground/80">{profile.bio || '這位用戶很神秘，什麼都沒留下。'}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>註冊於 {format(new Date(profile.created_at), 'yyyy年 MM月')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

