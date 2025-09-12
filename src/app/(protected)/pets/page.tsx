// src/app/(protected)/pets/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createPet, deletePet, fetchPets, updatePet, restorePet, fetchSpeciesList } from '@/store/petSlice';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Edit, Trash2, PawPrint, Dog, RotateCcw, Search } from 'lucide-react';
import Modal from '@/components/Modal';
import PetForm from '@/components/pets/PetForm';
import { Pet } from '@/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const PetCard = ({ pet, onEdit, onDelete, onRestore }: { pet: Pet; onEdit: () => void; onDelete: () => void; onRestore: () => void; }) => (
  <div className={`bg-white dark:bg-secondary rounded-lg shadow-sm overflow-hidden group transition-opacity ${!pet.is_active ? 'opacity-60' : ''}`}>
    <div className="p-5">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link href={`/pets/${pet.id}`} className="w-16 h-16 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
            {pet.avatar_url ? (
              <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <Dog size={32} className="text-muted-foreground" />
            )}
          </Link>
          <div>
            <Link href={`/pets/${pet.id}`}><h3 className="text-xl font-bold text-primary hover:underline">{pet.name}</h3></Link>
            <p className="text-sm text-muted-foreground capitalize">{pet.breed || pet.species}</p>
            {!pet.is_active && <p className="text-xs text-destructive font-bold mt-1">已刪除</p>}
          </div>
        </div>
        <div className="flex flex-col">
          {pet.is_active ? (
            <>
              <Button variant="ghost" size="sm" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={onRestore}><RotateCcw className="h-4 w-4 text-green-600" /> 恢復</Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function PetsPage() {
  const dispatch = useAppDispatch();
  const { pets, status, speciesList } = useAppSelector((state) => state.pets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [filter, setFilter] = useState<'active' | 'inactive'>('active');

  // useEffect(() => { dispatch(fetchPets(filter === 'inactive')); }, [dispatch, filter]);
  useEffect(() => { 
    dispatch(fetchPets(filter === 'inactive')); 
    // 如果物種列表是空的，就去 API 獲取一次
    if (speciesList.length === 0) {
      dispatch(fetchSpeciesList());
    }
  }, [dispatch, filter, speciesList.length]);

  const handleOpenModal = (pet: Pet | null = null) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (formData: any) => {
    if (editingPet) {
      dispatch(updatePet({ petId: editingPet.id, petData: formData }));
    } else {
      dispatch(createPet(formData));
    }
    handleCloseModal();
  };

  const handleDelete = (petId: number) => {
    if (window.confirm('您確定要刪除這隻寵物嗎？（此操作可恢復）')) {
      dispatch(deletePet(petId));
    }
  };

  const handleRestore = (petId: number) => { dispatch(restorePet(petId)); };

  const filteredPets = pets.filter(p => filter === 'active' ? p.is_active : !p.is_active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">我的寵物</h1>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/pets/search">
                    <Search className="mr-2 h-4 w-4" /> 搜尋寵物
                </Link>
            </Button>
            <Button onClick={() => handleOpenModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> 新增寵物
            </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="active">活躍的寵物</TabsTrigger>
          <TabsTrigger value="inactive">已刪除的寵物</TabsTrigger>
        </TabsList>
      </Tabs>

      {status === 'loading' && <p>正在載入寵物資料...</p>}

      {status === 'succeeded' && filteredPets.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有寵物</h3>
          <p className="mt-1 text-sm text-gray-500">{filter === 'active' ? '開始新增您的第一隻寵物吧！' : '這裡沒有已刪除的寵物。'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onEdit={() => handleOpenModal(pet)}
            onDelete={() => handleDelete(pet.id)}
            onRestore={() => handleRestore(pet.id)}
          />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPet ? '編輯寵物' : '新增寵物'}>
        <PetForm
          pet={editingPet}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={status === 'loading'}
          speciesList={speciesList}
        />
      </Modal>
    </div>
  );
}

