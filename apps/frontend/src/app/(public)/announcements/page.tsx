'use client';

import { PublicAnnouncements } from '../../../components/announcements/PublicAnnouncements';

export default function AnnouncementsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pengumuman & Informasi</h1>
        <p className="text-muted-foreground">
          Informasi terkini dan pengumuman penting dari Taman Kehati
        </p>
      </div>
      
      <PublicAnnouncements />
    </div>
  );
}
