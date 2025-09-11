// src/app/(protected)/transfer-center/_components/ReceivedTransfers.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchReceivedRequests, acceptTransfer, rejectTransfer } from "@/store/transferSlice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dog, Check, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ReceivedTransfers() {
  const dispatch = useAppDispatch();
  const { receivedRequests, status } = useAppSelector((state) => state.transfer);

  useEffect(() => {
    dispatch(fetchReceivedRequests());
  }, [dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>我收到的請求</CardTitle>
        <CardDescription>以下是用戶向您發起的寵物轉移請求。請及時處理。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'loading' && <p>正在載入請求...</p>}
        {status === 'succeeded' && receivedRequests.length === 0 && <p className="text-muted-foreground">目前沒有收到任何轉移請求。</p>}
        {receivedRequests.map(req => (
          <div key={req.id} className="p-4 border rounded-md flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Dog size={32} />
                <div>
                    <p>來自 <Link href={`/users/${req.from_user.id}`} className="font-bold text-primary hover:underline">{req.from_user.display_name || req.from_user.username}</Link></p>
                    <p>希望轉移 <Link href={`/pets/${req.pet.id}`} className="font-bold text-primary hover:underline">{req.pet.name}</Link> 給您</p>
                    <p className="text-xs text-muted-foreground">請求時間: {format(new Date(req.created_at), 'yyyy-MM-dd HH:mm')}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" onClick={() => dispatch(acceptTransfer(req.id))}><Check className="h-4 w-4 mr-1"/>接受</Button>
                <Button size="sm" variant="outline" onClick={() => dispatch(rejectTransfer(req.id))}><X className="h-4 w-4 mr-1"/>拒絕</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}