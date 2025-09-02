// src/app/(protected)/layout.tsx
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-1" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <Sidebar />
        <main className="flex-1 p-6 bg-secondary/20 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );return (
    <AuthGuard>
      <div className="flex flex-1" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <Sidebar />
        <main className="flex-1 p-6 bg-secondary/20 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}