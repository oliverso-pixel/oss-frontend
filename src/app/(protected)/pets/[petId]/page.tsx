// src/app/(protected)/pets/[petId]/page.tsx
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPetById } from '@/store/petSlice';
import { ArrowLeft, Cake, PawPrint, Dog } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = Number(params.petId);
  const dispatch = useAppDispatch();
  const { selectedPet, status } = useAppSelector((state) => state.pets);

  useEffect(() => {
    if (petId) {
      dispatch(fetchPetById(petId));
    }
  }, [petId, dispatch]);

  const getAge = (birthDate: string) => {
    const now = new Date();
    const birth = new Date(birthDate);
    const years = differenceInYears(now, birth);
    if (years > 0) return `${years} 歲`;
    const months = differenceInMonths(now, birth);
    return `${months} 個月`;
  }

  if (status === 'loading' || !selectedPet) {
    return <div>正在載入寵物資料...</div>;
  }

  return (
    <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16}/> 返回列表
        </button>
        <div className="bg-white dark:bg-secondary rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                 <div className="w-32 h-32 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center border-4 border-background">
                    <Dog size={64} className="text-muted-foreground"/>
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-4xl font-bold">{selectedPet.name}</h1>
                    <p className="text-muted-foreground capitalize">{selectedPet.breed || selectedPet.species}</p>
                </div>
            </div>
            <div className="mt-6 border-t pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
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
            </div>
        </div>
    </div>
  );
}

