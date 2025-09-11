// src/app/(protected)/pets/search/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchPets, fetchSpeciesList, clearSearchResults } from '@/store/petSlice';
import { Button } from '@/components/ui/Button';
import { Pet } from '@/types';
import Link from 'next/link';
import { Dog, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

const PetSearchResultCard = ({ pet }: { pet: Pet }) => (
    <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
         <Link href={`/pets/${pet.id}`} className="w-16 h-16 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
            {pet.avatar_url ? (
                <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover rounded-full" />
            ) : (
                <Dog size={32} className="text-muted-foreground"/>
            )}
        </Link>
        <div>
            <Link href={`/pets/${pet.id}`}><h3 className="font-bold text-primary hover:underline">{pet.name}</h3></Link>
            <p className="text-sm text-muted-foreground capitalize">{pet.breed || pet.species}</p>
            {pet.owner_username && <p className="text-xs text-muted-foreground mt-1">主人: {pet.owner_username}</p>}
        </div>
    </Card>
);

export default function PetSearchPage() {
  const dispatch = useAppDispatch();
  const { searchResults, speciesList, status } = useAppSelector((state) => state.pets);
  const [query, setQuery] = useState('');
  const [species, setSpecies] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    dispatch(fetchSpeciesList());
    // 當用戶離開此頁面時，清空搜尋結果
    return () => {
        dispatch(clearSearchResults());
    }
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    dispatch(searchPets({ query, species }));
  };
  
  const handleClear = () => {
    setQuery('');
    setSpecies('');
    setHasSearched(false);
    dispatch(clearSearchResults());
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">搜尋寵物</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-muted p-4 rounded-lg mb-8">
        <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">名稱關鍵字</label>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：Max, Luna..."
            />
        </div>
        <div className="md:col-span-1">
             <label className="block text-sm font-medium mb-1">物種</label>
             <Select value={species} onChange={(e) => setSpecies(e.target.value)}>
                <option value="">所有物種</option>
                {speciesList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
             </Select>
        </div>
        <div className="flex gap-2">
            <Button type="submit" className="w-full" disabled={status === 'loading'}>
              <Search className="h-4 w-4 mr-2" />
              {status === 'loading' ? '搜尋中...' : '搜尋'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear} className="w-1/3">
                <X className="h-4 w-4"/>
            </Button>
        </div>
      </form>

      {status === 'succeeded' && hasSearched && (
        <div>
            <h2 className="text-xl font-semibold mb-4">搜尋結果 ({searchResults.length})</h2>
            {searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((pet) => <PetSearchResultCard key={pet.id} pet={pet} />)}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-10">找不到符合條件的寵物。</p>
            )}
        </div>
      )}
    </div>
  );
}