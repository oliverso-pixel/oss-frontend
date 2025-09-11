// src/app/(protected)/settings/_components/AccountSettings.tsx
"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changePassword, logout } from "@/store/authSlice"; // 導入 logout
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useRouter } from "next/navigation"; // 導入 useRouter

export default function AccountSettings() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const router = useRouter(); // 初始化 router
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage("新密碼與確認密碼不符");
      return;
    }

    const result = await dispatch(changePassword({ old_password: passwordData.old_password, new_password: passwordData.new_password }));
    
    if (changePassword.fulfilled.match(result)) {
      setIsSuccess(true);
      setMessage("密碼已成功更新！為了安全起見，您將在 3 秒後被登出。");
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });

      // 等待 3 秒，讓用戶看到訊息，然後執行登出並跳轉
      setTimeout(() => {
        dispatch(logout());
        router.push('/login?reason=password_changed');
      }, 3000);

    } else {
      setIsSuccess(false);
      if (result.payload) {
        setMessage(result.payload as string);
      } else {
        setMessage("發生未知錯誤，修改密碼失敗");
      }
    }
  };

  return (
     <Card>
      <CardHeader>
        <CardTitle>帳戶安全</CardTitle>
        <CardDescription>修改您的登入密碼。</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {message && <p className={isSuccess ? "text-green-600" : "text-destructive"}>{message}</p>}
          <div className="space-y-2">
            <Label htmlFor="old_password">舊密碼</Label>
            <Input id="old_password" name="old_password" type="password" value={passwordData.old_password} onChange={handleChange} required/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">新密碼</Label>
            <Input id="new_password" name="new_password" type="password" value={passwordData.new_password} onChange={handleChange} required/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm_password">確認新密碼</Label>
            <Input id="confirm_password" name="confirm_password" type="password" value={passwordData.confirm_password} onChange={handleChange} required/>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={status === 'loading' || isSuccess}>
            {status === 'loading' ? "更新中..." : "更新密碼"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
