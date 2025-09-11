// src/app/(protected)/settings/_components/ProfileSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUserProfile } from "@/store/authSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ProfileSettings() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || "",
        bio: user.bio || "",
        phone: user.phone || "",
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      dispatch(updateUserProfile({ userId: user.id, data: formData }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>個人資料</CardTitle>
        <CardDescription>更新您的公開資訊。</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">顯示名稱</Label>
            <Input id="display_name" name="display_name" value={formData.display_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">個人簡介</Label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="phone">電話</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? "儲存中..." : "儲存變更"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
