// src/app/(protected)/friends/requests/page.tsx
"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFriendRequests, acceptFriendRequest, rejectFriendRequest } from '@/store/socialSlice';
import { Button } from '@/components/ui/Button';
import { UserPlus, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function FriendRequestsPage() {
    const dispatch = useAppDispatch();
    const { friendRequests, status } = useAppSelector((state) => state.social);

    useEffect(() => {
        dispatch(fetchFriendRequests());
    }, [dispatch]);

    const handleAccept = (requestId: number) => {
        dispatch(acceptFriendRequest(requestId));
    };

    const handleReject = (requestId: number) => {
        dispatch(rejectFriendRequest(requestId));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">好友請求</h1>

            {status === 'loading' && <p className="text-center text-muted-foreground">正在載入好友請求...</p>}

            {status === 'succeeded' && friendRequests.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">沒有新的好友請求</h3>
                    <p className="mt-1 text-sm text-gray-500">當有人向您發送好友請求時，會顯示在這裡。</p>
                </div>
            )}

            {status === 'succeeded' && friendRequests.length > 0 && (
                <div className="space-y-4">
                    {friendRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg flex items-center justify-between bg-background">
                            <Link href={`/users/${request.user.id}`} className="flex items-center gap-4 group">
                                {request.user.avatar_url ? (
                                    <img src={request.user.avatar_url} alt={request.user.username} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                        <UserPlus className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold group-hover:underline">{request.user.display_name || request.user.username}</p>
                                    <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                                </div>
                            </Link>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleAccept(request.id)}>
                                    <Check className="h-4 w-4 mr-1" /> 接受
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                                    <X className="h-4 w-4 mr-1" /> 拒絕
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {status === 'failed' && <p className="text-center text-destructive">無法載入好友請求，請稍後再試。</p>}
        </div>
    );
}
