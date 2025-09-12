// src/components/pets/PetForm.tsx
import { Pet, SpeciesOption } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

interface PetFormProps {
  pet?: Pet | null;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  speciesList: SpeciesOption[];
}

export default function PetForm({ pet, onSubmit, onCancel, isLoading, speciesList }: PetFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    species: speciesList[0]?.value || 'dog',
    breed: '',
    gender: 'unknown',
    birth_date: '',
    description: '',
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || speciesList[0]?.value || 'dog',
        breed: pet.breed || '',
        gender: pet.gender || 'unknown',
        birth_date: pet.birth_date ? pet.birth_date.split('T')[0] : '',
        description: pet.description || '',
      });
    } else {
      // setFormData({
      //   name: '', species: 'dog', breed: '', gender: 'unknown', birth_date: '', description: '',
      // });
      setFormData({
        name: '', 
        species: speciesList[0]?.value || 'dog', 
        breed: '', 
        gender: 'unknown', 
        birth_date: '', 
        description: '',
      });
    }
  }, [pet, speciesList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">寵物名字</label>
          <input name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">物種</label>
          <select name="species" value={formData.species} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md">
            {speciesList.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">品種</label>
          <input name="breed" value={formData.breed} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">性別</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md">
            <option value="male">公</option>
            <option value="female">母</option>
            <option value="unknown">未知</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">生日</label>
          <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">描述</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? '儲存中...' : '儲存'}</Button>
      </div>
    </form>
  );
}