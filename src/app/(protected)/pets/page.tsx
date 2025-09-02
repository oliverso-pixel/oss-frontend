// src/app/(protected)/pets/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createPet, deletePet, fetchPets, updatePet } from '@/store/petSlice';
import { Button } from '@/components/ui/Button';
import { PlusCircle, MoreHorizontal, Edit, Trash2, PawPrint, Dog } from 'lucide-react';
import Modal from '@/components/Modal';
import PetForm from '@/components/pets/PetForm';
import { Pet } from '@/types';
import Link from 'next/link';

export default function PetsPage() {
  const dispatch = useAppDispatch();
  const { pets, status } = useAppSelector((state) => state.pets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  useEffect(() => {
    dispatch(fetchPets());
  }, [dispatch]);

  const handleOpenModal = (pet: Pet | null = null) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPet(null);
  };

  const handleSubmit = (formData: any) => {
    if (editingPet) {
      dispatch(updatePet({ petId: editingPet.id, petData: formData }));
    } else {
      dispatch(createPet(formData));
    }
    handleCloseModal();
  };

  const handleDelete = (petId: number) => {
    if (window.confirm('您確定要刪除這隻寵物嗎？')) {
        dispatch(deletePet(petId));
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">我的寵物</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" /> 新增寵物
        </Button>
      </div>

      {status === 'loading' && <p>正在載入寵物資料...</p>}
      
      {status === 'succeeded' && pets.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <PawPrint className="mx-auto h-12 w-12 text-gray-400"/>
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有寵物</h3>
            <p className="mt-1 text-sm text-gray-500">開始新增您的第一隻寵物吧！</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white dark:bg-secondary rounded-lg shadow-sm overflow-hidden group">
            <div className="p-5">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
                        <Dog size={32} className="text-muted-foreground"/>
                    </div>
                    <div>
                        <Link href={`/pets/${pet.id}`}><h3 className="text-xl font-bold text-primary hover:underline">{pet.name}</h3></Link>
                        <p className="text-sm text-muted-foreground capitalize">{pet.breed || pet.species}</p>
                    </div>
                  </div>
                  <div className="relative">
                     {/* 編輯與刪除按鈕 */}
                     <Button variant="ghost" size="sm" onClick={() => handleOpenModal(pet)}><Edit className="h-4 w-4"/></Button>
                     <Button variant="ghost" size="sm" onClick={() => handleDelete(pet.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPet ? '編輯寵物' : '新增寵物'}>
        <PetForm 
          pet={editingPet} 
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal}
          isLoading={status === 'loading'}
        />
      </Modal>
    </div>
  );
}

