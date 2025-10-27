'use client';

import { ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/useAuth';
import { DashboardLayoutBase } from './DashboardLayoutBase';

interface DashboardLayoutNextProps {
  children: ReactNode;
}

export function DashboardLayoutNext({ children }: DashboardLayoutNextProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '/dashboard';

  // ✅ Optimized navigation with minimal logging
  const handleNavigate = useCallback((path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = path;
    }
  }, [router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  // ✅ FIX: Wait for user data to load before rendering dashboard
  // This prevents showing incomplete navigation on first load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutBase
      user={user}
      currentPath={pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {children}
    </DashboardLayoutBase>
  );
}
