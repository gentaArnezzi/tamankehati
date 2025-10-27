'use client';

import { DashboardLayoutNext } from '../../../components/DashboardLayoutNext';
import { RBACGuard } from '../../../components/RBACGuard';

export default function AnnouncementPage() {
  return (
    <RBACGuard allowedRoles={['super_admin']}>
      <DashboardLayoutNext>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
            <p className="text-gray-600">Kelola pengumuman untuk seluruh sistem</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Halaman Pengumuman</h3>
              <p className="text-gray-600 mb-4">
                Fitur pengumuman sedang dalam pengembangan. 
                Di sini Super Admin dapat membuat dan mengelola pengumuman untuk seluruh sistem.
              </p>
              <div className="text-sm text-gray-500">
                <p>Fitur yang akan tersedia:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Buat pengumuman baru</li>
                  <li>Edit pengumuman yang ada</li>
                  <li>Set status aktif/nonaktif</li>
                  <li>Target pengumuman berdasarkan wilayah</li>
                  <li>Riwayat pengumuman</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayoutNext>
    </RBACGuard>
  );
}
