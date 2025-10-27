'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  TreePine, 
  Bird,
  MapPin,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  PieChart as PieChartIcon,
  RefreshCw,
  Download,
  Activity,
  Sparkles
} from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

type DashboardData = {
  user_role: string;
  user_id: number;
  park_id?: number | null;
  time_range: string;
  date_range: {
    start: string;
    end: string;
  };
  analytics: {
    biodiversity: {
      flora: {
        total: number;
        endemic: number;
        approved: number;
      };
      fauna: {
        total: number;
        endemic: number;
        approved: number;
      };
      summary: {
        total_species: number;
        total_endemic: number;
        total_approved: number;
        approval_rate: number;
        endemic_rate: number;
      };
      monthly_discoveries?: Array<{
        month: string;
        discoveries: number;
        month_num: number;
      }>;
      regional_distribution?: Array<{
        region: string;
        parks: number;
        flora: number;
        fauna: number;
      }>;
      park_distribution?: Array<{
        name: string;
        area: number;
        species: number;
      }>;
    };
    conservation: {
      parks: {
        total: number;
        total_area_ha: number;
        avg_area_ha: number;
      };
    };
    activities: {
      total: number;
    };
  };
  generated_at: string;
};

export function DashboardWithAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('yearly');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(
        `${apiUrl}/api/v1/dashboard/comprehensive-simple?time_range=${timeRange}`,
        {
        headers: {
          'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data || !data.analytics || !data.analytics.biodiversity) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Data dashboard tidak tersedia. Silakan refresh halaman atau hubungi administrator.
        </AlertDescription>
      </Alert>
    );
  }

  const biodiversityData = [
    { 
      name: 'Flora', 
      total: data.analytics.biodiversity.flora?.total ?? 0,
      endemic: data.analytics.biodiversity.flora?.endemic ?? 0,
      approved: data.analytics.biodiversity.flora?.approved ?? 0
    },
    { 
      name: 'Fauna', 
      total: data.analytics.biodiversity.fauna?.total ?? 0,
      endemic: data.analytics.biodiversity.fauna?.endemic ?? 0,
      approved: data.analytics.biodiversity.fauna?.approved ?? 0
    }
  ];

  const statusDistribution = [
    { 
      status: 'Terverifikasi', 
      count: data.analytics.biodiversity.summary?.total_approved ?? 0,
      percentage: data.analytics.biodiversity.summary?.approval_rate ?? 0
    },
    { 
      status: 'Menunggu', 
      count: (data.analytics.biodiversity.summary?.total_species ?? 0) - (data.analytics.biodiversity.summary?.total_approved ?? 0),
      percentage: 100 - (data.analytics.biodiversity.summary?.approval_rate ?? 0)
    }
  ];

  const conservationStatusData = [
    { status: 'Endemik', count: data.analytics.biodiversity.summary?.total_endemic ?? 0, color: '#8B5CF6' },
    { status: 'Non-Endemik', count: (data.analytics.biodiversity.summary?.total_species ?? 0) - (data.analytics.biodiversity.summary?.total_endemic ?? 0), color: '#10B981' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'super_admin' 
              ? 'Visualisasi data keanekaragaman hayati seluruh Indonesia' 
              : 'Visualisasi data yang Anda kelola'}
          </p>
          <Badge variant="outline" className="mt-2">
            {user?.role === 'super_admin' ? '👑 Super Admin - Semua Data' : '🛡️ Regional Admin - Data Anda'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
              <SelectItem value="five_years">5 Tahun</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spesies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.analytics.biodiversity.summary.total_species.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {data.analytics.biodiversity.summary.total_approved} terverifikasi
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
                        </div>
                      </CardContent>
                    </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kawasan Konservasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.analytics.conservation.parks.total}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {data.analytics.conservation.parks.total_area_ha.toLocaleString()} ha
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
                        </div>
                      </CardContent>
                    </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spesies Endemik</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.analytics.biodiversity.summary.total_endemic}
                </p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  {data.analytics.biodiversity.summary.endemic_rate.toFixed(1)}% dari total
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
                        </div>
                      </CardContent>
                    </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kegiatan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.analytics.activities.total}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  Aktivitas terdokumentasi
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
                        </div>
                      </CardContent>
                    </Card>
                        </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="biodiversity">Biodiversitas</TabsTrigger>
          <TabsTrigger value="conservation">Konservasi</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Species Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribusi Flora & Fauna
                        </CardTitle>
                <CardDescription>
                  Total spesies, endemik, dan yang terverifikasi
                </CardDescription>
                      </CardHeader>
                      <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={biodiversityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#10B981" name="Total" />
                    <Bar dataKey="endemic" fill="#8B5CF6" name="Endemik" />
                    <Bar dataKey="approved" fill="#3B82F6" name="Terverifikasi" />
                  </BarChart>
                </ResponsiveContainer>
                      </CardContent>
                    </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Status Verifikasi
                        </CardTitle>
                <CardDescription>
                  Distribusi data berdasarkan status verifikasi
                </CardDescription>
                      </CardHeader>
                      <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                      </CardContent>
                    </Card>
          </div>

          {/* Monthly Discoveries Trend */}
          {data.analytics.biodiversity.monthly_discoveries && data.analytics.biodiversity.monthly_discoveries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Penemuan Spesies Bulanan
              </CardTitle>
                <CardDescription>
                  Trend penemuan spesies baru per bulan
              </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.analytics.biodiversity.monthly_discoveries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="discoveries" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      name="Penemuan Spesies"
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
          )}

          {/* Regional Distribution */}
          {data.analytics.biodiversity.regional_distribution && data.analytics.biodiversity.regional_distribution.length > 0 && (
            <Card>
                  <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Distribusi Spesies per {data.user_role === 'super_admin' ? 'Wilayah' : 'Taman'}
                </CardTitle>
                <CardDescription>
                  {data.user_role === 'super_admin' 
                    ? 'Flora dan fauna berdasarkan provinsi di Indonesia'
                    : 'Flora dan fauna di taman yang Anda kelola'}
                </CardDescription>
                  </CardHeader>
                  <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.analytics.biodiversity.regional_distribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                    <Bar dataKey="flora" fill="#10B981" name="Flora" />
                    <Bar dataKey="fauna" fill="#3B82F6" name="Fauna" />
                        </BarChart>
                      </ResponsiveContainer>
                  </CardContent>
                </Card>
          )}
        </TabsContent>

        {/* Biodiversity Tab */}
        <TabsContent value="biodiversity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Endemic vs Non-Endemic */}
            <Card>
                  <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Status Konservasi
                </CardTitle>
                <CardDescription>
                  Distribusi spesies endemik vs non-endemik
                </CardDescription>
                  </CardHeader>
                  <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                      data={conservationStatusData}
                            cx="50%"
                            cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {conservationStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Flora vs Fauna Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Komposisi Flora & Fauna
                </CardTitle>
                <CardDescription>
                  Perbandingan jumlah flora dan fauna
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={biodiversityData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#10B981" name="Total Spesies" />
                  </BarChart>
                </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
        </TabsContent>

        {/* Conservation Tab */}
        <TabsContent value="conservation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
                  <CardHeader>
                <CardTitle>Total Kawasan</CardTitle>
                  </CardHeader>
                  <CardContent>
                <div className="text-4xl font-bold text-blue-600">
                  {data.analytics.conservation.parks.total}
                      </div>
                <p className="text-sm text-gray-600 mt-2">Kawasan konservasi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Luas Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {data.analytics.conservation.parks.total_area_ha.toLocaleString()}
                      </div>
                <p className="text-sm text-gray-600 mt-2">Hektar (ha)</p>
                  </CardContent>
                </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rata-rata Luas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">
                  {Math.round(data.analytics.conservation.parks.avg_area_ha).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-2">Hektar per kawasan</p>
              </CardContent>
            </Card>
          </div>

          {/* Park Distribution with Species Count */}
          {data.analytics.biodiversity.park_distribution && data.analytics.biodiversity.park_distribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Distribusi Taman & Kekayaan Spesies
                </CardTitle>
                <CardDescription>
                  Luas area dan jumlah spesies di setiap taman konservasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={data.analytics.biodiversity.park_distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="area" fill="#3B82F6" name="Luas Area (ha)" />
                    <Line yAxisId="right" type="monotone" dataKey="species" stroke="#10B981" strokeWidth={2} name="Jumlah Spesies" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
                  <CardHeader>
              <CardTitle>Informasi Data</CardTitle>
              <CardDescription>
                Detail teknis mengenai data yang ditampilkan
              </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <Badge variant="outline">
                    {data.user_role === 'super_admin' ? '👑 Super Admin' : '🛡️ Regional Admin'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rentang Waktu:</span>
                  <span className="font-semibold">{timeRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dari:</span>
                  <span className="font-mono text-sm">{new Date(data.date_range.start).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sampai:</span>
                  <span className="font-mono text-sm">{new Date(data.date_range.end).toLocaleDateString('id-ID')}</span>
                      </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Terakhir Diperbarui:</span>
                  <span className="font-mono text-sm">{new Date(data.generated_at).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Data Terakhir Diperbarui</h3>
                <p className="text-sm text-gray-600">
                  {new Date(data.generated_at).toLocaleString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Data Terverifikasi
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-600" />
                Real-time
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
