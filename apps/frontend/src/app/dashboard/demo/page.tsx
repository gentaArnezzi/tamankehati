'use client';

import React, { useState, useEffect } from 'react';
import { CollapsibleDashboardLayout } from '@/components/CollapsibleDashboardLayout';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { useAuth } from '@/lib/useAuth';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  TreePine, 
  Activity,
  Calendar,
  MapPin,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  PieChart as PieChartIcon,
  Globe,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Layers,
  Target,
  Zap,
  Database,
  FileText,
  Image,
  Search
} from 'lucide-react';
import { InteractiveMap } from '@/components/maps/InteractiveMapWithSatellite';

// Mock data untuk demo
const mockData = {
  biodiversity: {
    floraByRegion: [
      { region: 'Sumatra', flora: 1250, fauna: 890, endemic: 45 },
      { region: 'Jawa', flora: 980, fauna: 650, endemic: 28 },
      { region: 'Kalimantan', flora: 2100, fauna: 1200, endemic: 67 },
      { region: 'Sulawesi', flora: 1800, fauna: 950, endemic: 89 },
      { region: 'Papua', flora: 3200, fauna: 1800, endemic: 156 },
      { region: 'Bali', flora: 450, fauna: 320, endemic: 12 },
      { region: 'Nusa Tenggara', flora: 680, fauna: 480, endemic: 23 }
    ],
    conservationStatus: [
      { status: 'Least Concern', count: 1250, percentage: 35 },
      { status: 'Near Threatened', count: 890, percentage: 25 },
      { status: 'Vulnerable', count: 650, percentage: 18 },
      { status: 'Endangered', count: 420, percentage: 12 },
      { status: 'Critically Endangered', count: 280, percentage: 8 },
      { status: 'Data Deficient', count: 120, percentage: 2 }
    ],
    monthlyDiscoveries: [
      { month: 'Jan', discoveries: 45, publications: 12 },
      { month: 'Feb', discoveries: 52, publications: 15 },
      { month: 'Mar', discoveries: 38, publications: 18 },
      { month: 'Apr', discoveries: 67, publications: 22 },
      { month: 'May', discoveries: 73, publications: 19 },
      { month: 'Jun', discoveries: 58, publications: 25 },
      { month: 'Jul', discoveries: 82, publications: 28 },
      { month: 'Aug', discoveries: 91, publications: 31 },
      { month: 'Sep', discoveries: 76, publications: 24 },
      { month: 'Oct', discoveries: 64, publications: 20 },
      { month: 'Nov', discoveries: 59, publications: 17 },
      { month: 'Dec', discoveries: 48, publications: 14 }
    ],
    parkDistribution: [
      { name: 'Taman Nasional Gunung Leuser', area: 7927, species: 450, visitors: 125000 },
      { name: 'Taman Nasional Kerinci Seblat', area: 13750, species: 380, visitors: 98000 },
      { name: 'Taman Nasional Bukit Barisan Selatan', area: 3568, species: 290, visitors: 75000 },
      { name: 'Taman Nasional Way Kambas', area: 1300, species: 180, visitors: 45000 },
      { name: 'Taman Nasional Ujung Kulon', area: 1206, species: 220, visitors: 32000 },
      { name: 'Taman Nasional Bromo Tengger Semeru', area: 503, species: 150, visitors: 280000 },
      { name: 'Taman Nasional Komodo', area: 1731, species: 200, visitors: 180000 },
      { name: 'Taman Nasional Lorentz', area: 25056, species: 650, visitors: 12000 }
    ],
    researchActivity: [
      { year: 2020, studies: 45, publications: 120, collaborations: 25 },
      { year: 2021, studies: 52, publications: 145, collaborations: 32 },
      { year: 2022, studies: 67, publications: 180, collaborations: 41 },
      { year: 2023, studies: 73, publications: 195, collaborations: 48 },
      { year: 2024, studies: 89, publications: 220, collaborations: 56 }
    ]
  },
  analytics: {
    totalSpecies: 15420,
    totalParks: 54,
    totalArea: 1250000,
    totalResearchers: 1250,
    endemicSpecies: 890,
    threatenedSpecies: 1250,
    recentDiscoveries: 45,
    activeStudies: 89
  }
};

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

export default function DashboardDemoPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('yearly');
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
    // Implement export functionality
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CollapsibleDashboardLayout
      user={user}
      currentPath={pathname}
      onNavigate={(path) => router.push(path)}
      onLogout={() => router.push('/login')}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Demo - Tableau Style</h1>
            <p className="text-gray-600 mt-2">Visualisasi data keanekaragaman hayati Indonesia</p>
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
                  <p className="text-2xl font-bold text-gray-900">{mockData.analytics.totalSpecies.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% dari tahun lalu
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TreePine className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taman Konservasi</p>
                  <p className="text-2xl font-bold text-gray-900">{mockData.analytics.totalParks}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {mockData.analytics.totalArea.toLocaleString()} ha
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
                  <p className="text-2xl font-bold text-gray-900">{mockData.analytics.endemicSpecies}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    {((mockData.analytics.endemicSpecies / mockData.analytics.totalSpecies) * 100).toFixed(1)}% dari total
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
                  <p className="text-sm font-medium text-gray-600">Peneliti Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{mockData.analytics.totalResearchers}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    {mockData.analytics.activeStudies} studi aktif
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="biodiversity">Biodiversitas</TabsTrigger>
            <TabsTrigger value="conservation">Konservasi</TabsTrigger>
            <TabsTrigger value="research">Riset</TabsTrigger>
            <TabsTrigger value="geographic">Geografis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Species Distribution by Region */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribusi Spesies per Wilayah
                  </CardTitle>
                  <CardDescription>
                    Flora dan fauna berdasarkan pulau/wilayah di Indonesia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockData.biodiversity.floraByRegion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="flora" fill="#10B981" name="Flora" />
                      <Bar dataKey="fauna" fill="#3B82F6" name="Fauna" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conservation Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Status Konservasi IUCN
                  </CardTitle>
                  <CardDescription>
                    Distribusi spesies berdasarkan status konservasi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockData.biodiversity.conservationStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {mockData.biodiversity.conservationStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Discoveries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Penemuan Spesies Bulanan
                </CardTitle>
                <CardDescription>
                  Trend penemuan spesies baru dan publikasi penelitian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={mockData.biodiversity.monthlyDiscoveries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="discoveries" fill="#10B981" name="Penemuan Spesies" />
                    <Line yAxisId="right" type="monotone" dataKey="publications" stroke="#3B82F6" name="Publikasi" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Biodiversity Tab */}
          <TabsContent value="biodiversity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endemic Species by Region */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Spesies Endemik per Wilayah
                  </CardTitle>
                  <CardDescription>
                    Distribusi spesies endemik Indonesia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockData.biodiversity.floraByRegion} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="region" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="endemic" fill="#8B5CF6" name="Spesies Endemik" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Species Density Scatter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Kepadatan Spesies vs Luas Area
                  </CardTitle>
                  <CardDescription>
                    Hubungan antara luas taman dan jumlah spesies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={mockData.biodiversity.parkDistribution}>
                      <CartesianGrid />
                      <XAxis dataKey="area" name="Luas Area (ha)" />
                      <YAxis dataKey="species" name="Jumlah Spesies" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter dataKey="species" fill="#F59E0B" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Radial Chart for Conservation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                    Status Konservasi Radial
                </CardTitle>
                <CardDescription>
                  Visualisasi radial status konservasi spesies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={mockData.biodiversity.conservationStatus}>
                    <RadialBar dataKey="count" cornerRadius={10} fill="#10B981" />
                    <Tooltip />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conservation Tab */}
          <TabsContent value="conservation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Park Area Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Distribusi Luas Taman Nasional
                  </CardTitle>
                  <CardDescription>
                    Luas area dan jumlah spesies di setiap taman
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockData.biodiversity.parkDistribution.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="area" fill="#3B82F6" name="Luas Area (ha)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Visitor vs Species */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pengunjung vs Spesies
                  </CardTitle>
                  <CardDescription>
                    Hubungan antara jumlah pengunjung dan keragaman spesies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={mockData.biodiversity.parkDistribution}>
                      <CartesianGrid />
                      <XAxis dataKey="visitors" name="Pengunjung" />
                      <YAxis dataKey="species" name="Spesies" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter dataKey="species" fill="#EF4444" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Treemap for Park Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Distribusi Taman Nasional (Treemap)
                </CardTitle>
                <CardDescription>
                  Visualisasi hierarkis luas area taman nasional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <Treemap
                    width={400}
                    height={200}
                    data={mockData.biodiversity.parkDistribution.map(park => ({
                      name: park.name.split(' ').slice(0, 2).join(' '),
                      size: park.area,
                      species: park.species
                    }))}
                    dataKey="size"
                    stroke="#fff"
                    fill="#8884d8"
                  />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Research Activity Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Aktivitas Riset Tahunan
                  </CardTitle>
                  <CardDescription>
                    Trend studi, publikasi, dan kolaborasi penelitian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockData.biodiversity.researchActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="studies" stackId="1" stroke="#10B981" fill="#10B981" name="Studi" />
                      <Area type="monotone" dataKey="publications" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Publikasi" />
                      <Area type="monotone" dataKey="collaborations" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Kolaborasi" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Research Output Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Output Riset (Funnel)
                  </CardTitle>
                  <CardDescription>
                    Konversi dari studi ke publikasi dan kolaborasi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <FunnelChart>
                      <Funnel
                        dataKey="value"
                        data={[
                          { name: 'Studi Dimulai', value: 100, fill: '#10B981' },
                          { name: 'Studi Selesai', value: 75, fill: '#3B82F6' },
                          { name: 'Publikasi', value: 45, fill: '#F59E0B' },
                          { name: 'Kolaborasi', value: 25, fill: '#EF4444' }
                        ]}
                        isAnimationActive
                      >
                        <LabelList position="center" fill="#fff" stroke="none" />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geographic Tab */}
          <TabsContent value="geographic" className="space-y-6">
            <InteractiveMap />
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Discovery Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trend Penemuan Spesies
                  </CardTitle>
                  <CardDescription>
                    Analisis trend penemuan spesies baru
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockData.biodiversity.monthlyDiscoveries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="discoveries" stroke="#10B981" strokeWidth={3} name="Penemuan" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Research Growth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Pertumbuhan Riset
                  </CardTitle>
                  <CardDescription>
                    Pertumbuhan aktivitas penelitian tahunan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockData.biodiversity.researchActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="studies" stroke="#3B82F6" fill="#3B82F6" name="Studi" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Database className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Data Terakhir Diperbarui</h3>
                  <p className="text-sm text-gray-600">26 Januari 2025, 14:30 WIB</p>
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
    </CollapsibleDashboardLayout>
  );
}
