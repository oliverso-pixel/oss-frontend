// src/app/(protected)/settings/_components/PrivacySettings.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPrivacySettings, updatePrivacySettings } from "@/store/authSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { PrivacySettings } from "@/types";

export default function PrivacySettingsComponent() {
  const dispatch = useAppDispatch();
  const { user, privacySettings, status } = useAppSelector((state) => state.auth);
  // 明確指定 settings 的類型
  const [settings, setSettings] = useState<PrivacySettings | null>(null);

  useEffect(() => {
    if (user && !privacySettings) {
      dispatch(fetchPrivacySettings(user.id));
    }
    if (privacySettings) {
      setSettings(privacySettings);
    }
  }, [user, privacySettings, dispatch]);

  const handleChange = (key: keyof PrivacySettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(user && settings) {
        dispatch(updatePrivacySettings({ userId: user.id, data: settings }));
    }
  };
  
  if (!settings) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>隱私設定</CardTitle>
            </CardHeader>
            <CardContent>
                <p>正在載入隱私設定...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>隱私設定</CardTitle>
        <CardDescription>管理您的資訊對他人的可見度。</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          {/* --- 新增：個人資料可見度 --- */}
          <div className="space-y-2">
            <Label htmlFor="privacy_level">個人資料可見度</Label>
            <Select 
              id="privacy_level"
              value={settings.privacy_level}
              onChange={(e) => handleChange('privacy_level', e.target.value)}
            >
              <option value="public">公開 (所有人可見詳細資料)</option>
              <option value="private">不公開 (他人僅可見關注數)</option>
            </Select>
            <p className="text-sm text-muted-foreground">
              控制誰可以看到您的完整個人資料。所有用戶都可以在平台上被搜尋到。
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show_email" className="flex flex-col space-y-1 flex-grow pr-4">
              <span>公開 Email</span>
              <span className="font-normal leading-snug text-muted-foreground">允許其他用戶在您的個人資料頁看到您的電子郵件地址。</span>
            </Label>
            <Switch id="show_email" checked={settings.show_email} onCheckedChange={(checked) => handleChange('show_email', checked)} />
          </div>

           <div className="flex items-center justify-between">
            <Label htmlFor="show_phone" className="flex flex-col space-y-1 flex-grow pr-4">
              <span>公開電話</span>
              <span className="font-normal leading-snug text-muted-foreground">允許其他用戶在您的個人資料頁看到您的電話號碼。</span>
            </Label>
            <Switch id="show_phone" checked={settings.show_phone} onCheckedChange={(checked) => handleChange('show_phone', checked)} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show_online_status" className="flex flex-col space-y-1 flex-grow pr-4">
              <span>顯示在線狀態</span>
              <span className="font-normal leading-snug text-muted-foreground">允許好友看到您目前是否在線上。</span>
            </Label>
            <Switch id="show_online_status" checked={settings.show_online_status} onCheckedChange={(checked) => handleChange('show_online_status', checked)} />
          </div>

           <div className="flex items-center justify-between">
            <Label htmlFor="show_last_seen" className="flex flex-col space-y-1 flex-grow pr-4">
              <span>顯示最後上線時間</span>
              <span className="font-normal leading-snug text-muted-foreground">允許好友看到您上次的登入時間。</span>
            </Label>
            <Switch id="show_last_seen" checked={settings.show_last_seen} onCheckedChange={(checked) => handleChange('show_last_seen', checked)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? "儲存中..." : "儲存隱私設定"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}