'use client';

import React from 'react';
import { MediumStyleArtikelPage } from '../../../../../components/artikel/MediumStyleArtikelPage';

export default function CreateArtikelPage() {
  // Medium-style editor is full-page, no need for DashboardLayout wrapper
  return <MediumStyleArtikelPage mode="create" />;
}
