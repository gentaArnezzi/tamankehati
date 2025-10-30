import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { dashboardApi, DashboardStats } from "../lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import {
  TreePine,
  Bird,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ProductTour } from "./ProductTour";
import { Button } from "./ui/button";

type ActivityItem = {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
};

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (user?.role === "regional_admin") {
        // For regional admin, load only their submitted data
        await loadRegionalAdminData();
      } else {
        // For super admin and regular users, use general stats
        const statsData = await dashboardApi.getStats();
        setStats(statsData);

        // ✅ FIXED: Activity feed disabled (old adminApi.getRecentActivity() was from deleted api.ts)
        // TODO: Implement activity feed using api-client.ts or backend endpoint
        setActivity([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data dashboard",
      );
      setActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRegionalAdminData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://tamankehati-backend-pxnu.onrender.com";

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Load regional admin's submitted data
      const [tamanData, floraData, faunaData, activitiesData] =
        await Promise.all([
          // Get parks created by this regional admin
          fetch(`${apiUrl}/api/v1/parks?submitted_by=me`, { headers })
            .then((res) => res.json())
            .catch(() => ({ items: [] })),
          // Get flora submitted by this regional admin
          fetch(`${apiUrl}/api/v1/flora?submitted_by=me`, { headers })
            .then((res) => res.json())
            .catch(() => ({ items: [] })),
          // Get fauna submitted by this regional admin
          fetch(`${apiUrl}/api/v1/fauna?submitted_by=me`, { headers })
            .then((res) => res.json())
            .catch(() => ({ items: [] })),
          // Get activities submitted by this regional admin
          fetch(`${apiUrl}/api/v1/activities?submitted_by=me`, { headers })
            .then((res) => res.json())
            .catch(() => ({ items: [] })),
        ]);

      // Create custom stats for regional admin
      const customStats = {
        total_flora: floraData.items?.length || 0,
        total_fauna: faunaData.items?.length || 0,
        total_zones: tamanData.items?.length || 0,
        total_users: 0, // Not relevant for regional admin
        total_observasi: activitiesData.items?.length || 0,
        total_taman: tamanData.items?.length || 0,
        pending_approvals: 0, // Will be calculated from status
        pending_approval: 0,
        regional_breakdown: [],
      };

      setStats(customStats);
      setActivity([]); // Regional admin doesn't need activity feed
    } catch (err) {
      console.error("Failed to load regional admin data:", err);
      // Set default stats
      setStats({
        total_flora: 0,
        total_fauna: 0,
        total_zones: 0,
        total_users: 0,
        total_observasi: 0,
        total_taman: 0,
        pending_approvals: 0,
        pending_approval: 0,
        regional_breakdown: [],
      });
    }
  };

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return "-";
    const now = new Date();
    const time = new Date(timestamp);
    if (Number.isNaN(time.getTime())) return "-";
    const diffMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffMinutes < 1440)
      return `${Math.floor(diffMinutes / 60)} jam yang lalu`;
    return `${Math.floor(diffMinutes / 1440)} hari yang lalu`;
  };

  const formatNumber = (value?: number) =>
    typeof value === "number" ? value.toLocaleString("id-ID") : "0";

  const totalFlora = stats?.total_flora ?? 0;
  const totalFauna = stats?.total_fauna ?? 0;
  const totalObservasi = stats?.total_observasi ?? 0;
  const totalTaman = stats?.total_taman ?? stats?.total_zones ?? 0;
  const pendingApprovals =
    stats?.pending_approvals ?? stats?.pending_approval ?? 0;
  const totalUsers = stats?.total_users ?? 0;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Tour Component */}
      {user?.role === "regional_admin" && (
        <ProductTour run={runTour} onFinish={() => setRunTour(false)} />
      )}

      {/* Welcome Header - Improved Contrast */}
      <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 p-8 shadow-lg">
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Selamat Datang, {user?.nama}!
                </h1>
                <p className="text-gray-900 text-lg font-medium">
                  {user?.role === "super_admin"
                    ? "🎯 Super Admin Dashboard"
                    : "🌳 Regional Admin Dashboard"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Modern Dashboard Button */}
              <Button
                onClick={() => (window.location.href = "/dashboard/modern")}
                variant="outline"
                className="flex items-center gap-2 border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-600"
              >
                <BarChart3 className="h-4 w-4" />
                Modern Dashboard
              </Button>

              {/* Data-Driven Dashboard Button */}
              <Button
                onClick={() =>
                  (window.location.href = "/dashboard/data-driven")
                }
                variant="outline"
                className="flex items-center gap-2 border-green-500 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-600"
              >
                <Activity className="h-4 w-4" />
                Data Dashboard
              </Button>

              {/* Tamankehati Dashboard Button */}
              <Button
                onClick={() =>
                  (window.location.href = "/dashboard/tamankehati")
                }
                variant="outline"
                className="flex items-center gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-600"
              >
                <TreePine className="h-4 w-4" />
                Tamankehati Dashboard
              </Button>

              {/* Tour Button - Only for Regional Admin */}
              {user?.role === "regional_admin" && (
                <Button
                  onClick={() => setRunTour(true)}
                  variant="outline"
                  className="flex items-center gap-2 border-brand-500 text-brand-700 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-600"
                >
                  <HelpCircle className="h-4 w-4" />
                  Panduan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Role-based content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {user?.role === "super_admin" ? (
              // Super Admin Dashboard
              <>
                {/* Card 1 - Pending Approvals */}
                <Card className="relative overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-shadow duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Menunggu Persetujuan
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-orange-700">
                        {formatNumber(pendingApprovals)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Perlu ditinjau
                    </p>
                  </CardContent>
                </Card>

                {/* Card 2 - Total Users */}
                <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Total Pengguna
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-blue-700">
                        {formatNumber(totalUsers)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Pengguna aktif
                    </p>
                  </CardContent>
                </Card>

                {/* Card 3 - Total Articles */}
                <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Total Artikel
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-purple-700">
                        {formatNumber(stats?.total_flora ?? 0)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Artikel diterbitkan
                    </p>
                  </CardContent>
                </Card>

                {/* Card 4 - Announcements */}
                <Card className="relative overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-shadow duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Total Pengumuman
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-emerald-700">
                        {formatNumber(stats?.total_zones ?? 0)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Pengumuman aktif
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : user?.role === "regional_admin" ? (
              // Regional Admin Dashboard
              <>
                {/* Card 1 - Taman */}
                <Card
                  data-tour="stats-card-taman"
                  className="relative overflow-hidden border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-green-50 hover:shadow-xl transition-shadow duration-300 group"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Taman Saya
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-md">
                      <TreePine className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-brand-700">
                        {formatNumber(totalTaman)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Taman yang dikelola
                    </p>
                  </CardContent>
                </Card>

                {/* Card 2 - Flora */}
                <Card
                  data-tour="stats-card-flora"
                  className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow duration-300 group"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Flora Saya
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                      <TreePine className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-green-700">
                        {formatNumber(totalFlora)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Spesies flora
                    </p>
                  </CardContent>
                </Card>

                {/* Card 3 - Fauna */}
                <Card
                  data-tour="stats-card-fauna"
                  className="relative overflow-hidden border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 hover:shadow-xl transition-shadow duration-300 group"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Fauna Saya
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-md">
                      <Bird className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-sky-700">
                        {formatNumber(totalFauna)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Spesies fauna
                    </p>
                  </CardContent>
                </Card>

                {/* Card 4 - Activities */}
                <Card
                  data-tour="stats-card-kegiatan"
                  className="relative overflow-hidden border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 hover:shadow-xl transition-shadow duration-300 group"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900">
                      Kegiatan Saya
                    </CardTitle>
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-md">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-violet-700">
                        {formatNumber(totalObservasi)}
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-900 mt-2 flex items-center gap-1 font-medium">
                      <Activity className="h-4 w-4" />
                      Kegiatan lapangan
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Regular User Dashboard
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Observasi Saya</CardTitle>
                    <MapPin
                      className="h-4 w-4 text-muted-foreground"
                      style={{ color: "#356447" }}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">
                      {formatNumber(totalObservasi)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Laporan lapangan
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Total Flora</CardTitle>
                    <TreePine
                      className="h-4 w-4 text-muted-foreground"
                      style={{ color: "#356447" }}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{formatNumber(totalFlora)}</div>
                    <p className="text-xs text-muted-foreground">
                      Spesies terdokumentasi
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Total Fauna</CardTitle>
                    <Bird
                      className="h-4 w-4 text-muted-foreground"
                      style={{ color: "#356447" }}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{formatNumber(totalFauna)}</div>
                    <p className="text-xs text-muted-foreground">
                      Spesies terdokumentasi
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Taman Nasional</CardTitle>
                    <TreePine
                      className="h-4 w-4 text-muted-foreground"
                      style={{ color: "#356447" }}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{formatNumber(totalTaman)}</div>
                    <p className="text-xs text-muted-foreground">
                      Area konservasi
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>

      {/* Recent Activity - Modern Design */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-600" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>
                Perubahan dan pembaruan data terkini
              </CardDescription>
            </div>
            <button className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 group">
              Lihat Semua
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 text-sm font-medium">
                Belum ada aktivitas terbaru
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 group-hover:scale-110 transition-transform">
                    {item.type === "observasi" && (
                      <MapPin className="h-6 w-6 text-brand-600" />
                    )}
                    {item.type === "flora" && (
                      <TreePine className="h-6 w-6 text-brand-600" />
                    )}
                    {item.type === "fauna" && (
                      <Bird className="h-6 w-6 text-brand-600" />
                    )}
                    {item.type === "taman" && (
                      <TreePine className="h-6 w-6 text-brand-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{item.user}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{formatTimeAgo(item.timestamp)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Modern Grid */}
      {user?.role !== "regional_admin" && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" />
              Aksi Cepat
            </CardTitle>
            <CardDescription>Pintasan untuk tugas umum</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="group p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 dark:hover:border-green-700 hover:shadow-lg transition-all duration-300 text-left">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                  <TreePine className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900">Tambah Flora</p>
                <p className="text-xs text-gray-900 mt-1 font-medium">
                  Dokumentasi spesies baru
                </p>
              </button>
              <button className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 border-2 border-blue-200 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300 text-left">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Bird className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900">Tambah Fauna</p>
                <p className="text-xs text-gray-900 mt-1 font-medium">
                  Catat satwa liar
                </p>
              </button>
              <button className="group p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 hover:border-violet-400 dark:hover:border-violet-700 hover:shadow-lg transition-all duration-300 text-left">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900">
                  Catat Observasi
                </p>
                <p className="text-xs text-gray-900 mt-1 font-medium">
                  Laporan lapangan
                </p>
              </button>
              {user?.role === "super_admin" && (
                <button className="group p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:border-orange-400 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300 text-left">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    Tinjau Persetujuan
                  </p>
                  <p className="text-xs text-gray-900 mt-1 font-medium">
                    Review data pending
                  </p>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
