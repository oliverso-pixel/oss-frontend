// src/app/(protected)/followers/page.tsx
"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFollowers } from '@/store/socialSlice';
import UserCard from '@/components/ui/UserCard';
import { Users } from 'lucide-react';

export default function FollowersPage() {
    const dispatch = useAppDispatch();
    const { followers, status } = useAppSelector((state) => state.social);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(fetchFollowers(user.id));
        }
    }, [dispatch, user]);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">我的關注者</h1>
            {status === 'loading' && <p>正在載入...</p>}
            {status === 'succeeded' && followers.length === 0 && (
                <div className="text-center py-12"><Users className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium">還沒有人關注您</h3></div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((user) => <UserCard key={user.id} user={user} />)}
            </div>
        </div>
    );
}