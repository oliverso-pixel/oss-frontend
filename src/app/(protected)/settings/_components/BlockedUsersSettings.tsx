// src/app/(protected)/settings/_components/BlockedUsersSettings.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBlockedUsers, unblockUser } from "@/store/socialSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, UserCheck } from "lucide-react";

export default function BlockedUsersSettings() {
    const dispatch = useAppDispatch();
    const { blockedUsers, status } = useAppSelector((state) => state.social);

    useEffect(() => {
        dispatch(fetchBlockedUsers());
    }, [dispatch]);

    const handleUnblock = (userId: number) => {
        dispatch(unblockUser(userId));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>封鎖名單</CardTitle>
                <CardDescription>您可以在此管理您已封鎖的用戶。</CardDescription>
            </CardHeader>
            <CardContent>
                {status === 'loading' && <p>正在載入名單...</p>}
                {status === 'succeeded' && blockedUsers.length === 0 && (
                    <p className="text-muted-foreground">您沒有封鎖任何用戶。</p>
                )}
                <div className="space-y-4">
                    {blockedUsers.map((blocked) => (
                        <div key={blocked.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {blocked.avatar_url ? (
                                    <img src={blocked.avatar_url} alt={blocked.username} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{blocked.display_name || blocked.username}</p>
                                    <p className="text-sm text-muted-foreground">@{blocked.username}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleUnblock(blocked.id)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                解除封鎖
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
