// src/app/(protected)/users/[userId]/page.tsx
"use client";

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, sendFriendRequest, removeFriend, followUser, unfollowUser, blockUser, unblockUser } from '@/store/socialSlice';
import { uploadAvatar, deleteAvatar, uploadBackgroundImage } from '@/store/authSlice';
import { Button } from '@/components/ui/Button';
import { User, Calendar, UserPlus, ArrowLeft, UserX, Heart, MoreHorizontal, ShieldOff, UserCheck, Lock, Upload, Trash2, Camera } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toaster';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.userId);
  const dispatch = useAppDispatch();
  const { userProfile, status } = useAppSelector((state) => state.social);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

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
  const handleFollow = () => dispatch(followUser(userId));
  const handleUnfollow = () => dispatch(unfollowUser(userId));
  const handleBlock = () => {
    if (window.confirm(`您確定要封鎖 ${userProfile.data?.display_name || userProfile.data?.username} 嗎？封鎖後將無法看到對方的任何動態。`)) {
      dispatch(blockUser(userId));
    }
  };
  const handleUnblock = () => dispatch(unblockUser(userId));

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 前端檔案類型檢查
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        addToast('檔案格式不支援。請選擇圖片檔。', 'error');
        return;
      }

      const result = await dispatch(uploadAvatar(file));
      if (uploadAvatar.fulfilled.match(result)) {
        addToast('頭像上傳成功！', 'success');
      } else {
        const errorMessage = result.payload as string;
        addToast(errorMessage || '上傳頭像時發生錯誤', 'error');
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (window.confirm('您確定要移除您的頭像嗎？')) {
      const result = await dispatch(deleteAvatar());
      if (deleteAvatar.fulfilled.match(result)) {
        addToast('頭像已成功移除。', 'success');
      } else {
        addToast(result.payload as string || '移除頭像時發生錯誤', 'error');
      }
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        addToast('檔案格式不支援。請選擇圖片檔。', 'error');
        return;
      }

      const result = await dispatch(uploadBackgroundImage(file));
      if (uploadBackgroundImage.fulfilled.match(result)) {
        addToast('背景圖片上傳成功！', 'success');
      } else {
        const errorMessage = result.payload as string;
        addToast(errorMessage || '上傳背景圖片時發生錯誤', 'error');
      }
    }
  };

  if (status === 'loading' && !userProfile.data) { return <div className="text-center p-10">正在載入個人資料...</div>; }
  
  if (status === 'failed' || !userProfile.data || userProfile.relationship?.is_blocked_by) { 
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-semibold">找不到此用戶</h2>
        <p className="text-muted-foreground mt-2">該用戶可能不存在或您沒有權限查看。</p>
        <Button onClick={() => router.back()} className="mt-4">返回</Button>
      </div>
    );
  }

  const { data: profile, relationship } = userProfile;
  const isSelf = currentUser?.id === profile.id;
  
  const canViewFullProfile = profile.privacy_level === 'public' || (profile.privacy_level === 'private' && relationship?.is_friend);

  const renderActionButtons = () => {
    if (!relationship) return null;
    if (relationship.is_blocked) {
      return <Button variant="outline" onClick={handleUnblock}><UserCheck className="mr-2 h-4 w-4" /> 解除封鎖</Button>;
    }

    return (
      <div className="flex gap-2 mt-2 sm:mt-0">
        {relationship.is_friend ? (
          <Button variant="secondary" onClick={handleRemoveFriend}><UserX className="mr-2 h-4 w-4" /> 已是好友</Button>
        ) : relationship.has_pending_request ? (
          <Button variant="secondary" disabled>好友請求已發送</Button>
        ) : (
          <Button onClick={handleAddFriend}><UserPlus className="mr-2 h-4 w-4" /> 加為好友</Button>
        )}

        {relationship.is_following ? (
          <Button variant="outline" onClick={handleUnfollow}>已關注</Button>
        ) : (
          <Button variant="secondary" onClick={handleFollow}><Heart className="mr-2 h-4 w-4" /> 關注</Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleBlock} className="text-destructive focus:text-destructive">
              <ShieldOff className="mr-2 h-4 w-4" />
              <span>封鎖用戶</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> 返回
      </button>
      <div className="bg-white dark:bg-secondary rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          {profile.background_image_url && (
            <img src={profile.background_image_url} alt="用戶背景圖" className="w-full h-full object-cover" />
          )}
          {isSelf && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2 bg-black/30 text-white hover:bg-black/50 hover:text-white border-white/50"
                onClick={() => backgroundFileInputRef.current?.click()}
              >
                <Camera size={16} className="mr-2" />
                更新背景圖
              </Button>
              <input
                type="file"
                ref={backgroundFileInputRef}
                onChange={handleBackgroundUpload}
                className="hidden"
                accept="image/jpeg, image/png, image/gif, image/webp"
              />
            </>
          )}
        </div>
        
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 -mt-20">
                <div className="relative w-32 h-32 flex-shrink-0">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} className="w-32 h-32 rounded-full object-cover border-4 border-background" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-background">
                            <User className="w-16 h-16 text-muted-foreground" />
                        </div>
                    )}
                    {isSelf && (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" className="absolute bottom-1 right-1 rounded-full w-8 h-8">
                                        <Upload size={16}/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => avatarFileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        <span>上傳新頭像</span>
                                    </DropdownMenuItem>
                                    {profile.avatar_url && (
                                        <DropdownMenuItem onSelect={handleDeleteAvatar} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>移除頭像</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <input
                                type="file"
                                ref={avatarFileInputRef}
                                onChange={handleAvatarUpload}
                                className="hidden"
                                accept="image/jpeg, image/png, image/gif, image/webp"
                            />
                        </>
                    )}
                </div>

                <div className="flex-1 pt-12 sm:pt-16 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                            <p className="text-muted-foreground">@{profile.username}</p>
                        </div>
                        {!isSelf && renderActionButtons()}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex items-center gap-6 text-sm text-foreground">
                    <div>
                        <span className="font-bold">{profile.total_posts || 0}</span>
                        <span className="ml-1 text-muted-foreground">帖文</span>
                    </div>
                    <Link href={`/users/${userId}/following`} className="hover:underline">
                        <span className="font-bold">{profile.total_following || 0}</span>
                        <span className="ml-1 text-muted-foreground">正在關注</span>
                    </Link>
                    <Link href={`/users/${userId}/followers`} className="hover:underline">
                        <span className="font-bold">{profile.total_followers || 0}</span>
                        <span className="ml-1 text-muted-foreground">關注者</span>
                    </Link>
                </div>

                {canViewFullProfile && (
                <>
                    <p className="mt-4 text-sm text-foreground/80">{profile.bio || '這位用戶很神秘，什麼都沒留下。'}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>註冊於 {format(new Date(profile.created_at), 'yyyy年 MM月')}</span>
                    </div>
                    </div>
                </>
                )}
            </div>
        </div>

        <div className="border-t p-6">
          {canViewFullProfile ? (
            <div className="text-center text-muted-foreground">
              {/* 未來可以在這裡顯示用戶的帖文、寵物列表等 */}
              用戶的公開內容會顯示在這裡。
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <Lock className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold">此帳號為不公開</h2>
              <p className="text-muted-foreground">成為好友後即可查看對方的詳細資訊。</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

