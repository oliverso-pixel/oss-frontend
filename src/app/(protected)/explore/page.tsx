// src/app/(protected)/explore/page.tsx
"use client";

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchUsers } from '@/store/socialSlice';
import { Button } from '@/components/ui/Button';
import UserCard from '@/components/ui/UserCard';
import { Search } from 'lucide-react';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const { searchResults, status } = useAppSelector((state) => state.social);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(searchUsers(query.trim()));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">探索用戶</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="依用戶名稱搜索..."
          className="flex-grow px-4 py-2 border rounded-md bg-background"
        />
        <Button type="submit" disabled={status === 'loading'}>
          <Search className="h-4 w-4 mr-2" />
          {status === 'loading' ? '搜索中...' : '搜索'}
        </Button>
      </form>

      {status === 'loading' && <p className="text-center text-muted-foreground">正在搜索...</p>}

      {status === 'succeeded' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.length > 0 ? (
            searchResults.map((user) => <UserCard key={user.id} user={user} />)
          ) : (
            <p className="col-span-full text-center text-muted-foreground">找不到用戶。嘗試換個關鍵字吧！</p>
          )}
        </div>
      )}
    </div>
  );
}

