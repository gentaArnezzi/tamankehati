"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  TreePine,
  Bird,
  MapPin,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Shield,
  FileText,
  Image,
  Globe,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Bell,
  Settings,
  Search,
  Menu,
  ChevronDown,
  Star,
  DollarSign,
  CreditCard,
  PiggyBank,
  Plus,
  ArrowUpDown,
  Grid,
  MessageCircle,
  User,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus as PlusIcon,
} from "lucide-react";

interface TamankehatiDashboardProps {
  user?: any;
}

interface DashboardData {
  user_role: string;
  user_id: number;
  park_id?: number;
  time_range: string;
  date_range: {
    start: string;
    end: string;
  };
  analytics: {
    biodiversity: any;
    conservation: any;
    activities: any;
    users: any;
    geographic: any;
    temporal: any;
    performance: any;
  };
  generated_at: string;
}

const TamankehatiDashboard: React.FC<TamankehatiDashboardProps> = ({
  user,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("yearly");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/v1/dashboard-modern/?time_range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          window.location.href = "/login";
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error memuat dashboard
        </h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Tidak ada data tersedia
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Tidak dapat memuat data dashboard.
        </p>
      </div>
    );
  }

  const { analytics } = data;

  // Prepare chart data
  const biodiversityChartData = [
    {
      name: "Flora",
      total: analytics.biodiversity.flora.total,
      endemic: analytics.biodiversity.flora.endemic,
      approved: analytics.biodiversity.flora.approved,
    },
    {
      name: "Fauna",
      total: analytics.biodiversity.fauna.total,
      endemic: analytics.biodiversity.fauna.endemic,
      approved: analytics.biodiversity.fauna.approved,
    },
  ];

  const iucnData = [
    {
      name: "Critically Endangered",
      value:
        analytics.biodiversity.flora.iucn_status.critically_endangered +
        analytics.biodiversity.fauna.iucn_status.critically_endangered,
      color: "#dc2626",
    },
    {
      name: "Endangered",
      value:
        analytics.biodiversity.flora.iucn_status.endangered +
        analytics.biodiversity.fauna.iucn_status.endangered,
      color: "#ea580c",
    },
    {
      name: "Vulnerable",
      value:
        analytics.biodiversity.flora.iucn_status.vulnerable +
        analytics.biodiversity.fauna.iucn_status.vulnerable,
      color: "#d97706",
    },
    {
      name: "Near Threatened",
      value:
        analytics.biodiversity.flora.iucn_status.near_threatened +
        analytics.biodiversity.fauna.iucn_status.near_threatened,
      color: "#eab308",
    },
    {
      name: "Least Concern",
      value:
        analytics.biodiversity.flora.iucn_status.least_concern +
        analytics.biodiversity.fauna.iucn_status.least_concern,
      color: "#22c55e",
    },
    {
      name: "Data Deficient",
      value:
        analytics.biodiversity.flora.iucn_status.data_deficient +
        analytics.biodiversity.fauna.iucn_status.data_deficient,
      color: "#6b7280",
    },
  ];

  const approvalData = analytics.performance.approval_rates.map(
    (rate: any) => ({
      name: rate.entity_type,
      value: rate.approval_rate,
      color:
        rate.approval_rate > 80
          ? "#22c55e"
          : rate.approval_rate > 60
            ? "#eab308"
            : "#ef4444",
    }),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-16 items-center px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <TreePine className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Tamankehati Dashboard
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center gap-8">
              {[
                { name: "Dashboard", id: "dashboard" },
                { name: "Keanekaragaman Hayati", id: "biodiversity" },
                { name: "Konservasi", id: "conservation" },
                { name: "Kegiatan", id: "activities" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
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

            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                {user?.name || "User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
          {/* Time Range Selector */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Rentang Waktu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tab-specific Sidebar Content */}
          {activeTab === "dashboard" && (
            <>
              {/* Biodiversity Overview */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Ringkasan Keanekaragaman Hayati
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* IUCN Status Chart */}
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={iucnData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={50}
                          dataKey="value"
                        >
                          {iucnData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">
                        Disetujui
                      </span>
                      <span className="text-sm font-semibold text-green-800">
                        {analytics.biodiversity.summary.total_approved}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">
                        Menunggu
                      </span>
                      <span className="text-sm font-semibold text-yellow-800">
                        {analytics.biodiversity.summary.total_pending}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-800">
                        Ditolak
                      </span>
                      <span className="text-sm font-semibold text-red-800">
                        {analytics.biodiversity.summary.total_rejected}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Distribution */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Distribusi Regional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.geographic.regional_distribution
                      .slice(0, 5)
                      .map((region: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium">
                                {region.provinsi}
                              </div>
                              <div className="text-xs text-gray-500">
                                {region.kota_kabupaten}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {region.park_count}
                            </div>
                            <div className="text-xs text-gray-500">
                              {region.total_area_ha.toFixed(0)} ha
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "biodiversity" && (
            <>
              {/* Flora vs Fauna Summary */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Ringkasan Spesies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <TreePine className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-800">
                        {analytics.biodiversity.flora.total}
                      </div>
                      <div className="text-sm text-green-600">Flora</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Bird className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-800">
                        {analytics.biodiversity.fauna.total}
                      </div>
                      <div className="text-sm text-blue-600">Fauna</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Flora Endemik</span>
                      <span className="font-semibold">
                        {analytics.biodiversity.flora.endemic}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fauna Endemik</span>
                      <span className="font-semibold">
                        {analytics.biodiversity.fauna.endemic}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Endemik</span>
                      <span className="font-semibold text-green-600">
                        {analytics.biodiversity.summary.total_endemic}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* IUCN Status Breakdown */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Status IUCN
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {iucnData.map((status, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          ></div>
                          <span className="text-sm">{status.name}</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {status.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "conservation" && (
            <>
              {/* Parks Summary */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Kawasan Lindung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.conservation.parks.total}
                    </div>
                    <div className="text-sm text-gray-600">Total Taman</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Luas</span>
                      <span className="font-semibold">
                        {analytics.conservation.parks.total_area_ha.toFixed(0)}{" "}
                        ha
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Luas Rata-rata</span>
                      <span className="font-semibold">
                        {analytics.conservation.parks.avg_area_ha.toFixed(0)} ha
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taman Terbesar</span>
                      <span className="font-semibold">
                        {analytics.conservation.parks.max_area_ha.toFixed(0)} ha
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conservation Status */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Distribusi Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.conservation.conservation_status.map(
                      (status: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                status.status === "approved"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {status.status}
                            </Badge>
                            <span className="text-sm">
                              {status.count} parks
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {status.total_area_ha.toFixed(0)} ha
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "activities" && (
            <>
              {/* Activities Summary */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Ringkasan Kegiatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {analytics.activities.total}
                    </div>
                    <div className="text-sm text-gray-600">Total Kegiatan</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disetujui</span>
                      <span className="font-semibold text-green-600">
                        {analytics.activities.approved}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dalam Review</span>
                      <span className="font-semibold text-yellow-600">
                        {analytics.activities.in_review}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ditolak</span>
                      <span className="font-semibold text-red-600">
                        {analytics.activities.rejected}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activities by Status */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Berdasarkan Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.activities.by_status.map(
                      (status: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                status.status === "approved"
                                  ? "bg-green-500"
                                  : status.status === "in_review"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            ></div>
                            <span className="text-sm capitalize">
                              {status.status.replace("_", " ")}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            {status.count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Central Content */}
        <div className="flex-1 p-6 space-y-6">
          {activeTab === "dashboard" && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">
                        Total Spesies
                      </span>
                      <TreePine className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold">
                      {analytics.biodiversity.summary.total_species}
                    </div>
                    <div className="text-xs opacity-90">Flora & Fauna</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">
                        Spesies Endemik
                      </span>
                      <Bird className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold">
                      {analytics.biodiversity.summary.total_endemic}
                    </div>
                    <div className="text-xs opacity-90">Unik untuk Wilayah</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">
                        Kawasan Lindung
                      </span>
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold">
                      {analytics.conservation.parks.total}
                    </div>
                    <div className="text-xs opacity-90">Taman & Cagar Alam</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">
                        Kegiatan
                      </span>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold">
                      {analytics.activities.total}
                    </div>
                    <div className="text-xs opacity-90">Aksi Konservasi</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Biodiversity Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribusi Spesies</CardTitle>
                    <CardDescription>
                      Perbandingan Flora vs Fauna
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={biodiversityChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="total"
                            name="Total"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="endemic"
                            name="Endemik"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="approved"
                            name="Disetujui"
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Approval Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tingkat Persetujuan</CardTitle>
                    <CardDescription>
                      Performa berdasarkan jenis entitas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={approvalData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) =>
                              `${name}: ${value.toFixed(1)}%`
                            }
                          >
                            {approvalData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Patterns */}
              {analytics.temporal.monthly_patterns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pola Penemuan Bulanan</CardTitle>
                    <CardDescription>
                      Tren penemuan spesies berdasarkan bulan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.temporal.monthly_patterns}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis dataKey="month" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="species_count"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                            name="Jumlah Spesies"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === "biodiversity" && (
            <>
              {/* Biodiversity Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Analisis Keanekaragaman Hayati
                  </h2>
                  <p className="text-gray-600">
                    Analisis komprehensif spesies flora dan fauna
                  </p>
                </div>
                <Button onClick={fetchDashboardData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Perbarui Data
                </Button>
              </div>

              {/* Species Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TreePine className="h-5 w-5 text-green-600" />
                      Flora Species
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.biodiversity.flora.total}
                        </div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics.biodiversity.flora.endemic}
                        </div>
                        <div className="text-sm text-gray-600">Endemic</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Disetujui</span>
                        <span className="font-semibold text-green-600">
                          {analytics.biodiversity.flora.approved}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Menunggu</span>
                        <span className="font-semibold text-yellow-600">
                          {analytics.biodiversity.flora.pending}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ditolak</span>
                        <span className="font-semibold text-red-600">
                          {analytics.biodiversity.flora.rejected}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bird className="h-5 w-5 text-blue-600" />
                      Fauna Species
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics.biodiversity.fauna.total}
                        </div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analytics.biodiversity.fauna.endemic}
                        </div>
                        <div className="text-sm text-gray-600">Endemic</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Disetujui</span>
                        <span className="font-semibold text-green-600">
                          {analytics.biodiversity.fauna.approved}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Menunggu</span>
                        <span className="font-semibold text-yellow-600">
                          {analytics.biodiversity.fauna.pending}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ditolak</span>
                        <span className="font-semibold text-red-600">
                          {analytics.biodiversity.fauna.rejected}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* IUCN Status Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Konservasi IUCN</CardTitle>
                  <CardDescription>
                    Distribusi spesies berdasarkan status konservasi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={iucnData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {iucnData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "conservation" && (
            <>
              {/* Conservation Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Analisis Konservasi
                  </h2>
                  <p className="text-gray-600">
                    Kawasan lindung dan manajemen konservasi
                  </p>
                </div>
                <Button onClick={fetchDashboardData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Perbarui Data
                </Button>
              </div>

              {/* Parks Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Total Taman
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {analytics.conservation.parks.total}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Kawasan lindung
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Total Luas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.conservation.parks.total_area_ha.toFixed(0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Hektar terlindungi
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Luas Rata-rata
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.conservation.parks.avg_area_ha.toFixed(0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Hektar per taman
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Regional Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Regional</CardTitle>
                  <CardDescription>
                    Taman dan kawasan lindung berdasarkan wilayah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.geographic.regional_distribution.slice(
                          0,
                          10,
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="provinsi" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="park_count"
                          name="Jumlah Taman"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "activities" && (
            <>
              {/* Activities Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Analisis Kegiatan
                  </h2>
                  <p className="text-gray-600">
                    Kegiatan konservasi dan manajemen
                  </p>
                </div>
                <Button onClick={fetchDashboardData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Perbarui Data
                </Button>
              </div>

              {/* Activities Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      Total Kegiatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {analytics.activities.total}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Aksi konservasi
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Disetujui
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.activities.approved}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Kegiatan selesai
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      Dalam Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {analytics.activities.in_review}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Menunggu persetujuan
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Ditolak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {analytics.activities.rejected}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Kegiatan ditolak
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Activities Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Status Kegiatan</CardTitle>
                  <CardDescription>
                    Breakdown kegiatan berdasarkan status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.activities.by_status.map(
                            (status: any) => ({
                              name: status.status
                                .replace("_", " ")
                                .toUpperCase(),
                              value: status.count,
                              color:
                                status.status === "approved"
                                  ? "#10b981"
                                  : status.status === "in_review"
                                    ? "#eab308"
                                    : "#ef4444",
                            }),
                          )}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {analytics.activities.by_status.map(
                            (status: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  status.status === "approved"
                                    ? "#10b981"
                                    : status.status === "in_review"
                                      ? "#eab308"
                                      : "#ef4444"
                                }
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6">
          {/* Conservation Performance */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Ringkasan Performa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">
                    Total Spesies
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-900">
                  {analytics.biodiversity.summary.total_species}
                </div>
                <div className="text-sm text-green-700">+5.3%</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Kawasan Lindung
                  </span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {analytics.conservation.parks.total_area_ha.toFixed(0)} ha
                </div>
                <div className="text-sm text-blue-700">0.58%</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800">
                    Kegiatan
                  </span>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-purple-900">
                  {analytics.activities.total}
                </div>
                <div className="text-sm text-purple-700">0.18%</div>
              </div>
            </CardContent>
          </Card>

          {/* User Overview */}
          {analytics.users.by_role && analytics.users.by_role.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Ringkasan Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.users.by_role.map((role: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium capitalize">
                            {role.role.replace("_", " ")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {role.active} active
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {role.total}
                        </div>
                        <div className="text-xs text-gray-500">total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Metrik Persetujuan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performance.approval_rates.map(
                  (rate: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">
                          {rate.entity_type}
                        </span>
                        <span>{rate.approval_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={rate.approval_rate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{rate.approved} disetujui</span>
                        <span>{rate.pending} menunggu</span>
                        <span>{rate.rejected} ditolak</span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TamankehatiDashboard;
