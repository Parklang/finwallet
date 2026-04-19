'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Sidebar from './Sidebar';
import { useSocket } from '@/hooks/useSocket';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  useSocket();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-content animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
