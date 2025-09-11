// src/app/(protected)/transfer-center/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import ReceivedTransfers from "./_components/ReceivedTransfers";
import SentTransfers from "./_components/SentTransfers";

export default function TransferCenterPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">寵物轉移中心</h1>
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">我收到的請求</TabsTrigger>
          <TabsTrigger value="sent">我送出的請求</TabsTrigger>
        </TabsList>
        <TabsContent value="received">
          <ReceivedTransfers />
        </TabsContent>
        <TabsContent value="sent">
          <SentTransfers />
        </TabsContent>
      </Tabs>
    </div>
  );
}