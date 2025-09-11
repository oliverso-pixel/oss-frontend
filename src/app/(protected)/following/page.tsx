// src/app/(protected)/following/page.tsx
"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFollowing } from '@/store/socialSlice';
import UserCard from '@/components/ui/UserCard';
import { Users } from 'lucide-react';

export default function FollowingPage() {
    const dispatch = useAppDispatch();
    const { following, status } = useAppSelector((state) => state.social);

    useEffect(() => {
        dispatch(fetchFollowing());
    }, [dispatch]);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">我正在關注</h1>
            {status === 'loading' && <p>正在載入...</p>}
            {status === 'succeeded' && following.length === 0 && (
                <div className="text-center py-12"><Users className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium">您尚未關注任何人</h3></div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((user) => <UserCard key={user.id} user={user} />)}
            </div>
        </div>
    );
}
