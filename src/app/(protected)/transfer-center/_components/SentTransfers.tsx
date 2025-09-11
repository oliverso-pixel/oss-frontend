// src/app/(protected)/transfer-center/_components/SentTransfers.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSentRequests, cancelTransfer } from "@/store/transferSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dog, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function SentTransfers() {
  const dispatch = useAppDispatch();
  const { sentRequests, status } = useAppSelector((state) => state.transfer);

  useEffect(() => {
    dispatch(fetchSentRequests());
  }, [dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>我送出的請求</CardTitle>
        <CardDescription>以下是您已發起但對方尚未處理的轉移請求。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'loading' && <p>正在載入請求...</p>}
        {status === 'succeeded' && sentRequests.length === 0 && <p className="text-muted-foreground">您沒有待處理的送出請求。</p>}
        {sentRequests.map(req => (
          <div key={req.id} className="p-4 border rounded-md flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Dog size={32} />
                <div>
                    <p>請求轉移 <Link href={`/pets/${req.pet.id}`} className="font-bold text-primary hover:underline">{req.pet.name}</Link> 給 <Link href={`/users/${req.to_user.id}`} className="font-bold text-primary hover:underline">{req.to_user.display_name || req.to_user.username}</Link></p>
                    <p className="text-xs text-muted-foreground">請求時間: {format(new Date(req.created_at), 'yyyy-MM-dd HH:mm')}</p>
                </div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => dispatch(cancelTransfer(req.id))}><XCircle className="h-4 w-4 mr-1"/>取消請求</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}