// src/app/page.tsx
"use client";

import { useAppSelector } from '@/store/hooks';

export default function HomePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-bold">Welcome to Pet Social Platform!</h1>
      {user ? (
        <p className="mt-4 text-lg">
          You are logged in as {user.username}. Go to your dashboard to manage your pets.
        </p>
      ) : (
        <p className="mt-4 text-lg">
          Please log in or register to continue.
        </p>
      )}
    </div>
  );
}