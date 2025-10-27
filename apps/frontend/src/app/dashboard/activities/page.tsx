'use client';

import React from 'react';
import { DashboardLayoutNext } from '../../../components/DashboardLayoutNext';
import { ActivitiesPage } from '../../../components/activities/ActivitiesPage';
import { RBACGuard } from '../../../components/RBACGuard';

export default function ActivitiesDashboardPage() {
  return (
    <RBACGuard allowedRoles={['regional_admin']}>
      <DashboardLayoutNext>
        <ActivitiesPage />
      </DashboardLayoutNext>
    </RBACGuard>
  );
}
