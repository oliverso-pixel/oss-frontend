// src/app/(protected)/pets/[petId]/page.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPetById, uploadPetAvatar, fetchMedicalRecords, addMedicalRecord, fetchVaccinationRecords } from '@/store/petSlice';
import { requestPetTransfer, fetchPetTransferHistory } from '@/store/transferSlice';
import { ArrowLeft, Cake, PawPrint, Dog, Upload, Repeat, History, Heart, PlusCircle, HeartPulse, Syringe, Lock, Building, Phone } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/Modal';
import { Input } from '@/components/ui/Input';
import { MedicalRecord, PetTransferHistory, VaccinationRecord } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toaster';

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

// --- 元件：醫療記錄表單 ---
const MedicalRecordForm = ({ petId, onSubmit, onCancel }: { petId: number, onSubmit: (data: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({ pet_id: petId, visit_date: '', visit_type: 'routine_checkup', chief_complaint: '', diagnosis: '', weight: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>就診日期</label><Input type="date" name="visit_date" value={formData.visit_date} onChange={handleChange} required /></div>
            <div><label>就診類型</label><select name="visit_type" value={formData.visit_type} onChange={handleChange} className="w-full mt-1 block px-3 py-2 border rounded-md"><option value="routine_checkup">健康檢查</option><option value="vaccination">疫苗接種</option><option value="emergency">緊急就診</option><option value="other">其他</option></select></div>
            <div><label>主訴</label><Input name="chief_complaint" value={formData.chief_complaint} onChange={handleChange} required /></div>
            <div><label>診斷</label><textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full mt-1 min-h-[80px] px-3 py-2 border rounded-md" required /></div>
            <div><label>體重 (kg)</label><Input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>取消</Button><Button type="submit">儲存</Button></div>
        </form>
    );
};

// --- 元件：醫療記錄頁籤 ---
const MedicalRecordsTab = ({ petId }: { petId: number }) => {
    const dispatch = useAppDispatch();
    const { medicalRecords, status } = useAppSelector((state) => state.pets);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { dispatch(fetchMedicalRecords(petId)) }, [dispatch, petId]);
    const handleSubmit = async (data: any) => { await dispatch(addMedicalRecord(data)); setIsModalOpen(false); };

    return (
        <Card className="mt-4">
            <CardHeader className="flex-row justify-between items-center">
                <CardTitle>就診記錄</CardTitle>
                <Button size="sm" onClick={() => setIsModalOpen(true)}><PlusCircle className="h-4 w-4 mr-2" />新增記錄</Button>
            </CardHeader>
            <CardContent>
                {status === 'loading' && <p>載入中...</p>}
                {status === 'succeeded' && medicalRecords && medicalRecords.length === 0 && <p className="text-muted-foreground">沒有就診記錄。</p>}
                <div className="space-y-4">
                    {medicalRecords && medicalRecords.map(record => (
                        <div key={record.id} className="p-4 border rounded-lg">
                            <p className="font-bold text-lg">{format(new Date(record.visit_date), 'yyyy-MM-dd')} - {record.chief_complaint}</p>
                            <p className="text-sm font-semibold mt-2">診斷結果:</p>
                            <p className="text-sm">{record.diagnosis}</p>
                            {record.clinic && (
                                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground space-y-1">
                                    <p className="flex items-center gap-2"><Building size={12} /> {record.clinic.name}</p>
                                    <p className="flex items-center gap-2"><Phone size={12} /> {record.clinic.phone}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增就診記錄">
                <MedicalRecordForm petId={petId} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </Card>
    );
};

// --- 元件：疫苗記錄 (針卡) ---
const VaccinationCard = ({ petId }: { petId: number }) => {
    const dispatch = useAppDispatch();
    const { vaccinationRecords, status } = useAppSelector((state) => state.pets);

    useEffect(() => { dispatch(fetchVaccinationRecords(petId)) }, [dispatch, petId]);

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Syringe size={20} />疫苗注射記錄 (針卡)</CardTitle>
                <CardDescription>此處顯示所有已記錄的疫苗注射。新增疫苗請至「醫療記錄」中新增一筆「疫苗接種」類型的就診記錄。</CardDescription>
            </CardHeader>
            <CardContent>
                {status === 'loading' && <p>載入中...</p>}
                {status === 'succeeded' && vaccinationRecords && vaccinationRecords.length === 0 && <p className="text-muted-foreground">沒有疫苗注射記錄。</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vaccinationRecords && vaccinationRecords.map(record => (
                        <div key={record.id} className="p-3 border rounded-md bg-background">
                            <p className="font-bold">{record.vaccine_name}</p>
                            <p className="text-sm">注射於: {format(new Date(record.vaccination_date), 'yyyy-MM-dd')}</p>
                            {record.next_due_date && <p className="text-sm text-amber-600">下次到期: {format(new Date(record.next_due_date), 'yyyy-MM-dd')}</p>}
                            {record.batch_number && <p className="text-xs text-muted-foreground mt-1">批號: {record.batch_number}</p>}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// --- 元件：寵物一生時間軸 ---
const PetTimeline = ({ petId }: { petId: number }) => {
    const dispatch = useAppDispatch();
    const { petHistory, status: transferStatus } = useAppSelector((state) => state.transfer);
    const { medicalRecords, status: petInfoStatus } = useAppSelector((state) => state.pets);
    const { selectedPet } = useAppSelector((state) => state.pets);

    useEffect(() => {
        dispatch(fetchPetTransferHistory(petId));
        dispatch(fetchMedicalRecords(petId));
    }, [dispatch, petId]);

    const timelineEvents = [];
    if (selectedPet?.birth_date) {
        timelineEvents.push({ date: selectedPet.birth_date, Icon: Heart, title: `${selectedPet.name} 出生了！` });
    }
    (petHistory || []).forEach(h => {
        timelineEvents.push({ date: h.completed_at, Icon: Repeat, title: '更換了新主人' });
    });
    (medicalRecords || []).forEach(record => {
        const title = record.visit_type === 'vaccination' ? '進行了疫苗接種' : '去看了醫生';
        const Icon = record.visit_type === 'vaccination' ? Syringe : HeartPulse;
        timelineEvents.push({ date: record.visit_date, Icon, title });
    });

    const validEvents = timelineEvents
        .map(event => ({ ...event, dateObj: new Date(event.date) }))
        .filter(event => event.date && !isNaN(event.dateObj.getTime()));

    validEvents.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const isLoading = transferStatus === 'loading' || petInfoStatus === 'loading';

    return (
        <div className="mt-6">
            {isLoading && <p>載入中...</p>}
            {!isLoading && validEvents.length === 0 && <p className="text-muted-foreground">這隻寵物還沒有任何記錄。</p>}
            <div className="relative pl-6 after:absolute after:inset-y-0 after:w-0.5 after:bg-border after:left-0">
                {validEvents.map((event, index) => (
                    <div key={index} className="relative mb-8 grid grid-cols-[auto_1fr] items-start gap-x-4">
                        <div className="relative flex h-6 w-6 items-center justify-center"><span className="absolute -left-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><event.Icon className="h-4 w-4" /></span></div>
                        <div className="pt-1.5">
                            <p className="text-sm text-muted-foreground">{format(event.dateObj, 'yyyy年 MM月 dd日')}</p>
                            <h4 className="font-semibold">{event.title}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 主頁面元件 ---
export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = Number(params.petId);
  const dispatch = useAppDispatch();
  const { selectedPet, status: petStatus } = useAppSelector((state) => state.pets);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => { if (petId) { dispatch(fetchPetById(petId)); } }, [petId, dispatch]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        addToast('檔案格式不支援。請選擇圖片檔。', 'error');
        return;
      }
      const result = await dispatch(uploadPetAvatar({ petId, avatarFile: file }));
      if (uploadPetAvatar.fulfilled.match(result)) {
        addToast('寵物頭像更新成功！', 'success');
      } else {
        addToast(result.payload as string || '更新頭像失敗', 'error');
      }
    }
  };

  const getAge = (birthDate: string) => {
    const years = differenceInYears(new Date(), new Date(birthDate));
    return years > 0 ? `${years} 歲` : `${differenceInMonths(new Date(), new Date(birthDate))} 個月`;
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
  
  if (!selectedPet) { return <div>正在載入寵物資料...</div>;}

  const isOwner = currentUser?.id === selectedPet?.user_id;
  const isAdmin = currentUser?.linked_roles.includes('admin');
  const canViewMedical = isOwner || isAdmin;
//   const canViewMedical = isOwner;
  const isPrivateAndNotOwner = selectedPet.privacy_level === 'private' && !isOwner;

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/> 返回</button>
      <div className="bg-background rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-background">
                {selectedPet.avatar_url ? <img src={selectedPet.avatar_url} alt={selectedPet.name} className="w-full h-full object-cover rounded-full" /> : <Dog size={64} className="text-muted-foreground"/>}
              </div>
              {isOwner && <Button size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={() => fileInputRef.current?.click()}><Upload size={16}/></Button>}
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/jpeg, image/png, image/gif, image/webp"/>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold">{selectedPet.name}</h1>
              <p className="text-muted-foreground capitalize">{selectedPet.breed || selectedPet.species}</p>
              {isPrivateAndNotOwner && <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-muted-foreground"><Lock size={14}/> 這是一隻不公開的寵物</div>}
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
          {isPrivateAndNotOwner ? (
             <div className="text-center py-10"><Lock className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium">這是隻不公開的寵物</h3><p className="mt-1 text-sm text-gray-500">只有飼主才能查看詳細資料與醫療記錄。</p></div>
          ) : (
            <Tabs defaultValue="details">
              <TabsList className={cn("grid w-full", canViewMedical ? "grid-cols-4" : "grid-cols-2")}>
                <TabsTrigger value="details">詳細資料</TabsTrigger>
                <TabsTrigger value="timeline"><History size={16} className="mr-1"/> 寵物一生</TabsTrigger>
                {canViewMedical && <TabsTrigger value="vaccination"><Syringe size={16} className="mr-1"/> 疫苗記錄</TabsTrigger>}
                {canViewMedical && <TabsTrigger value="medical"><HeartPulse size={16} className="mr-1"/> 就診記錄</TabsTrigger>}
              </TabsList>
              <TabsContent value="details">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 mt-4">
                  <div className="sm:col-span-1"><dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><PawPrint size={16}/> 性別</dt><dd className="mt-1 text-lg text-foreground capitalize">{selectedPet.gender}</dd></div>
                  <div className="sm:col-span-1"><dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Cake size={16}/> 年齡</dt><dd className="mt-1 text-lg text-foreground">{selectedPet.birth_date ? `${getAge(selectedPet.birth_date)} (生於 ${format(new Date(selectedPet.birth_date), 'yyyy/MM/dd')})` : '未知'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-sm font-medium text-muted-foreground">描述</dt><dd className="mt-1 text-lg text-foreground">{selectedPet.description || '沒有描述'}</dd></div>
                </dl>
              </TabsContent>
              <TabsContent value="timeline"><PetTimeline petId={petId} /></TabsContent>
              {canViewMedical && <TabsContent value="vaccination"><VaccinationCard petId={petId} /></TabsContent>}
              {canViewMedical && <TabsContent value="medical"><MedicalRecordsTab petId={petId} /></TabsContent>}
            </Tabs>
          )}
        </div>
      </div>
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title={`轉移寵物 ${selectedPet.name}`}>
        <TransferForm onSubmit={handleTransferRequest} onCancel={() => setIsTransferModalOpen(false)} />
      </Modal>
    </div>
  );
}


