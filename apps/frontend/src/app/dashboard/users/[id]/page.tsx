'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield, Activity, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserDetail {
  id: number;
  nama: string;
  email: string;
  role: string;
  phone?: string;
  region?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  status: string;
}

interface UserActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
}

interface UserStats {
  total_parks: number;
  total_activities: number;
  total_announcements: number;
  last_activity: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadUserData();
    }
  }, [params.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Simulate API calls - in real implementation, these would be actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      setUser({
        id: Number(params.id),
        nama: "Dr. Ahmad Wijaya",
        email: "ahmad.wijaya@kehati.go.id",
        role: "regional_admin",
        phone: "+62 812-3456-7890",
        region: "Sumatera Utara",
        status: "active",
        created_at: "2023-01-15T00:00:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        last_login: "2024-01-15T08:30:00Z"
      });

      setStats({
        total_parks: 5,
        total_activities: 12,
        total_announcements: 3,
        last_activity: "2024-01-15T10:30:00Z"
      });

      setActivities([
        {
          id: 1,
          action: "Login",
          description: "User berhasil login ke sistem",
          timestamp: "2024-01-15T08:30:00Z",
          ip_address: "192.168.1.100"
        },
        {
          id: 2,
          action: "Create Park",
          description: "Membuat taman baru: Taman Nasional Batang Gadis",
          timestamp: "2024-01-14T14:20:00Z",
          ip_address: "192.168.1.100"
        },
        {
          id: 3,
          action: "Update Activity",
          description: "Memperbarui kegiatan monitoring flora",
          timestamp: "2024-01-13T16:45:00Z",
          ip_address: "192.168.1.100"
        },
        {
          id: 4,
          action: "Create Announcement",
          description: "Membuat pengumuman tentang kegiatan konservasi",
          timestamp: "2024-01-12T09:15:00Z",
          ip_address: "192.168.1.100"
        },
        {
          id: 5,
          action: "View Dashboard",
          description: "Mengakses dashboard regional",
          timestamp: "2024-01-11T11:30:00Z",
          ip_address: "192.168.1.100"
        }
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      'active': { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      'inactive': { label: 'Tidak Aktif', className: 'bg-red-100 text-red-800' },
      'suspended': { label: 'Ditangguhkan', className: 'bg-yellow-100 text-yellow-800' },
      'super_admin': { label: 'Super Admin', className: 'bg-purple-100 text-purple-800' },
      'regional_admin': { label: 'Admin Regional', className: 'bg-blue-100 text-blue-800' }
    };
    const config = variants[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Pengguna tidak ditemukan</p>
        <Button onClick={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  {user.nama}
                </h1>
                <p className="text-gray-600 mt-1">Detail Pengguna</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(user.status)}
              {getStatusBadge(user.role)}
              <div className="text-right">
                <p className="text-sm text-gray-500">Terakhir Login</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Tidak ada'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Taman</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">{stats?.total_parks || 0}</p>
                    <p className="text-xs text-green-600">Taman Dikelola</p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <MapPin className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Aktivitas</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{stats?.total_activities || 0}</p>
                    <p className="text-xs text-blue-600">Kegiatan Dilakukan</p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <Activity className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Pengumuman</p>
                    <p className="text-3xl font-bold text-purple-700 mt-2">{stats?.total_announcements || 0}</p>
                    <p className="text-xs text-purple-600">Pengumuman Dibuat</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Shield className="h-6 w-6 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Terakhir Aktif</p>
                    <p className="text-lg font-bold text-orange-700 mt-2">
                      {stats?.last_activity ? new Date(stats.last_activity).toLocaleDateString('id-ID') : 'Tidak ada'}
                    </p>
                    <p className="text-xs text-orange-600">Aktivitas Terakhir</p>
                  </div>
                  <div className="p-3 bg-orange-200 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-blue-600" />
                    Informasi Pengguna
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </h5>
                        <p className="text-sm text-gray-700">{user.email}</p>
                      </div>
                      {user.phone && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Telepon
                          </h5>
                          <p className="text-sm text-gray-700">{user.phone}</p>
                        </div>
                      )}
                      {user.region && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Wilayah
                          </h5>
                          <p className="text-sm text-gray-700">{user.region}</p>
                        </div>
                      )}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Bergabung Sejak
                        </h5>
                        <p className="text-sm text-gray-700">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'Tidak diketahui'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h5 className="font-medium text-blue-900 mb-1">Peran dalam Sistem</h5>
                      <p className="text-sm text-blue-800">
                        {user.role === 'super_admin' && 'Super Administrator - Memiliki akses penuh ke semua fitur sistem'}
                        {user.role === 'regional_admin' && 'Admin Regional - Mengelola taman dan aktivitas di wilayah tertentu'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-lg">Statistik Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Taman</span>
                      <span className="font-semibold text-green-600">{stats?.total_parks || 0} taman</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Aktivitas</span>
                      <span className="font-semibold text-blue-600">{stats?.total_activities || 0} kegiatan</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pengumuman</span>
                      <span className="font-semibold text-purple-600">{stats?.total_announcements || 0} pengumuman</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Terakhir Aktif</span>
                      <span className="font-semibold text-orange-600">
                        {stats?.last_activity ? new Date(stats.last_activity).toLocaleDateString('id-ID') : 'Tidak ada'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-lg">Status Akun</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    {getStatusBadge(user.status)}
                    {getStatusBadge(user.role)}
                    <p className="text-sm text-gray-600 mt-2">Akun Pengguna</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="text-lg">Aksi</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Pengguna
                    </Button>
                    <Button className="w-full" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Pengguna
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* User Activities Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-6 w-6 text-purple-600" />
                Aktivitas Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-white border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">{activity.action}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 leading-relaxed">{activity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>IP: {activity.ip_address}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
