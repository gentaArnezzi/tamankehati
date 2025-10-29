'use client';

import React from 'react';
import { CollapsibleDashboardLayout } from '../../../components/CollapsibleDashboardLayout';
import { ActivitiesPage } from '../../../components/activities/ActivitiesPage';
import { RBACGuard } from '../../../components/RBACGuard';
import { useAuth } from '../../../lib/useAuth';
import { useRouter, usePathname } from 'next/navigation';

export default function ActivitiesDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <RBACGuard allowedRoles={['regional_admin']}>
      <CollapsibleDashboardLayout
        user={user}
        currentPath={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <ActivitiesPage />
      </CollapsibleDashboardLayout>
    </RBACGuard>
  );
}
