// src/app/(protected)/pets/[petId]/page.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPetById, uploadPetAvatar } from '@/store/petSlice';
import { requestPetTransfer, fetchPetTransferHistory } from '@/store/transferSlice';
import { ArrowLeft, Cake, PawPrint, Dog, Upload, Repeat, History, Heart, ShieldAlert } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/Modal';
import { Input } from '@/components/ui/Input';
import { PetTransferHistory } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const TransferForm = ({ onSubmit, onCancel }: { onSubmit: (data: { toUserId: number, reason: string }) => void, onCancel: () => void }) => {
    const [toUserId, setToUserId] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ toUserId: Number(toUserId), reason });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">接收方用戶 ID</label>
                <Input type="number" value={toUserId} onChange={(e) => setToUserId(e.target.value)} placeholder="請輸入對方的數字 ID" required />
            </div>
            <div>
                <label className="block text-sm font-medium">轉移原因</label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="例如：搬家無法繼續照顧" required />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
                <Button type="submit">送出請求</Button>
            </div>
        </form>
    );
};

const PetTimeline = ({ petId }: { petId: number }) => {
    const dispatch = useAppDispatch();
    const { petHistory, status, error } = useAppSelector((state) => state.transfer);
    const { selectedPet } = useAppSelector((state) => state.pets);
    
    useEffect(() => {
        if (petId) {
            dispatch(fetchPetTransferHistory(petId));
        }
    }, [dispatch, petId]);

    // 建立時間軸事件陣列，並過濾掉無效日期
    const timelineEvents = [
        // 1. 出生事件
        ...(selectedPet?.birth_date ? [{
            rawDate: selectedPet.birth_date,
            type: 'birth',
            Icon: Heart,
            title: `${selectedPet.name} 出生了！`,
            description: `一個可愛的小生命來到了這個世界。`
        }] : []),
        // 2. 轉移歷史事件
        ...(petHistory || []).map(h => ({
            rawDate: h.completed_at,
            type: 'transfer',
            Icon: Repeat,
            title: '更換了新主人',
            description: `由 ${h.from_user.display_name} 轉移給 ${h.to_user.display_name}。原因: ${h.notes || '未提供'}`
        }))
    ]
    .map(event => ({ ...event, date: new Date(event.rawDate) })) // 將日期字串轉換為 Date 物件
    .filter(event => !isNaN(event.date.getTime())) // 過濾掉無效的日期
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // 按日期排序

    return (
        <div className="mt-6">
            {status === 'loading' && <p>正在載入寵物足跡...</p>}
            
            {status === 'failed' && (
                <div className="text-destructive flex items-center gap-2 p-4 bg-destructive/10 rounded-md">
                    <ShieldAlert className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}
            
            {status === 'succeeded' && timelineEvents.length === 0 && <p className="text-muted-foreground">這隻寵物還沒有任何記錄。</p>}

            {status === 'succeeded' && timelineEvents.length > 0 && (
                <div className="relative pl-6 after:absolute after:inset-y-0 after:w-0.5 after:bg-border after:left-0">
                    {timelineEvents.map((event, index) => (
                        <div key={index} className="relative mb-8 grid grid-cols-[auto_1fr] items-start gap-x-4">
                            <div className="relative flex h-6 w-6 items-center justify-center">
                                <span className="absolute -left-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <event.Icon className="h-4 w-4" />
                                </span>
                            </div>
                            <div className="pt-1.5">
                                <p className="text-sm text-muted-foreground">{format(event.date, 'yyyy年 MM月 dd日')}</p>
                                <h4 className="font-semibold">{event.title}</h4>
                                <p className="text-sm text-foreground/80">{event.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = Number(params.petId);
  const dispatch = useAppDispatch();
  const { selectedPet, status: petStatus } = useAppSelector((state) => state.pets);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (petId) {
      dispatch(fetchPetById(petId));
    }
  }, [petId, dispatch]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(uploadPetAvatar({ petId, avatarFile: file }));
    }
  };

  const getAge = (birthDate: string) => {
    const now = new Date();
    const birth = new Date(birthDate);
    const years = differenceInYears(now, birth);
    if (years > 0) return `${years} 歲`;
    const months = differenceInMonths(now, birth);
    return `${months} 個月`;
  }

  const handleTransferRequest = async (data: { toUserId: number, reason: string }) => {
      const result = await dispatch(requestPetTransfer({ petId, ...data }));
      if (requestPetTransfer.fulfilled.match(result)) {
          alert("轉移請求已成功送出！");
          setIsTransferModalOpen(false);
      } else {
          alert(`錯誤: ${result.payload}`);
      }
  };

  const isOwner = currentUser?.id === selectedPet?.user_id;
  
  if (petStatus === 'loading' || !selectedPet) { return <div>正在載入寵物資料...</div>;}

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16}/> 返回
      </button>
      <div className="bg-white dark:bg-secondary rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-background">
                {selectedPet.avatar_url ? (
                <img src={selectedPet.avatar_url} alt={selectedPet.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                <Dog size={64} className="text-muted-foreground"/>
                )}
              </div>
                {isOwner && (
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16}/>
                </Button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*"/>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold">{selectedPet.name}</h1>
              <p className="text-muted-foreground capitalize">{selectedPet.breed || selectedPet.species}</p>
            </div>
          </div>
            {isOwner && (
            <div className="mt-4 border-t pt-4">
              <Button onClick={() => setIsTransferModalOpen(true)}>
                <Repeat size={16} className="mr-2"/> 轉移所有權
              </Button>
            </div>
            )}
        </div>
        
        <div className="p-6 border-t">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">詳細資料</TabsTrigger>
              <TabsTrigger value="pettimeline"><History size={16} className="mr-1"/> 寵物一生</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 mt-4">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><PawPrint size={16}/> 性別</dt>
                  <dd className="mt-1 text-lg text-foreground capitalize">{selectedPet.gender}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Cake size={16}/> 年齡</dt>
                  <dd className="mt-1 text-lg text-foreground">
                  {selectedPet.birth_date ? `${getAge(selectedPet.birth_date)} (生於 ${format(new Date(selectedPet.birth_date), 'yyyy/MM/dd')})` : '未知'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">描述</dt>
                  <dd className="mt-1 text-lg text-foreground">{selectedPet.description || '沒有描述'}</dd>
                </div>
              </dl>
            </TabsContent>
            <TabsContent value="pettimeline">
              <PetTimeline petId={petId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title={`轉移寵物 ${selectedPet.name}`}>
        <TransferForm onSubmit={handleTransferRequest} onCancel={() => setIsTransferModalOpen(false)} />
      </Modal>
    </div>
  );
}

