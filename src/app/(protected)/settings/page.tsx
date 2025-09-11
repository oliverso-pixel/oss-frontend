// src/app/(protected)/settings/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import ProfileSettings from "./_components/ProfileSettings";
import AccountSettings from "./_components/AccountSettings";
import PrivacySettingsComponent from "./_components/PrivacySettings";
import BlockedUsersSettings from "./_components/BlockedUsersSettings";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">設定</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">個人資料</TabsTrigger>
          <TabsTrigger value="account">帳戶安全</TabsTrigger>
          <TabsTrigger value="privacy">隱私設定</TabsTrigger>
          <TabsTrigger value="blocking">封鎖名單</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacySettingsComponent />
        </TabsContent>
        <TabsContent value="blocking">
          <BlockedUsersSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}