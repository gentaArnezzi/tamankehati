"use client";

import React, { useEffect } from "react";
import { CollapsibleDashboardLayout } from "../../../components/CollapsibleDashboardLayout";
import { useAuth } from "../../../lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  TreePine,
  Bird,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Package,
} from "lucide-react";

export default function DemoCollapsibleDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated (must be in useEffect, not during render)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return (
    <CollapsibleDashboardLayout
      user={user}
      currentPath={pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {/* Dashboard Content with Beautiful Stats */}
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                  <TreePine className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-bold mb-1">156</CardTitle>
              <CardDescription className="text-brand-600 dark:text-brand-400">
                Total Taman Kehati
              </CardDescription>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +12% bulan ini
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TreePine className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-bold mb-1">2,347</CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Spesies Flora
              </CardDescription>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +45 minggu ini
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Bird className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-bold mb-1">1,823</CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Spesies Fauna
              </CardDescription>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +32 minggu ini
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-bold mb-1">89</CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-400">
                Pengguna Aktif
              </CardDescription>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +3 bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  Perubahan dan pembaruan data terkini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      icon: TreePine,
                      title: "Taman baru ditambahkan",
                      desc: "Taman Kehati Jawa Barat",
                      time: "2 menit lalu",
                      color: "green",
                    },
                    {
                      icon: Users,
                      title: "Pengguna baru terdaftar",
                      desc: "regional@kehati.org bergabung",
                      time: "5 menit lalu",
                      color: "blue",
                    },
                    {
                      icon: Bird,
                      title: "Data fauna diperbarui",
                      desc: "Elang Jawa - status konservasi",
                      time: "10 menit lalu",
                      color: "purple",
                    },
                    {
                      icon: Activity,
                      title: "Backup sistem",
                      desc: "Backup otomatis selesai",
                      time: "1 jam lalu",
                      color: "orange",
                    },
                    {
                      icon: CheckCircle,
                      title: "Persetujuan data",
                      desc: "5 data flora disetujui",
                      time: "2 jam lalu",
                      color: "green",
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          activity.color === "green"
                            ? "bg-green-50 dark:bg-green-900/20"
                            : activity.color === "blue"
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : activity.color === "purple"
                                ? "bg-purple-50 dark:bg-purple-900/20"
                                : "bg-orange-50 dark:bg-orange-900/20"
                        }`}
                      >
                        <activity.icon
                          className={`h-4 w-4 ${
                            activity.color === "green"
                              ? "text-green-600 dark:text-green-400"
                              : activity.color === "blue"
                                ? "text-blue-600 dark:text-blue-400"
                                : activity.color === "purple"
                                  ? "text-purple-600 dark:text-purple-400"
                                  : "text-orange-600 dark:text-orange-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.desc}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader>
                <CardTitle>Statistik Cepat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tingkat Kelengkapan Data
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        87%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full"
                        style={{ width: "87%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Persetujuan Tertunda
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        12
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: "15%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Kegiatan Bulan Ini
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        234
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader>
                <CardTitle>Regional Teratas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Jawa Barat",
                    "Kalimantan Timur",
                    "Sulawesi Selatan",
                    "Sumatera Utara",
                  ].map((region, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {region}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {Math.floor(Math.random() * 50 + 20)} taman
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20">
          <CardHeader>
            <CardTitle className="text-brand-900 dark:text-brand-100">
              🎨 Demo Collapsible Sidebar
            </CardTitle>
            <CardDescription className="text-brand-700 dark:text-brand-300">
              Ini adalah halaman demo untuk mendemonstrasikan collapsible
              sidebar yang baru. Klik tombol di sidebar untuk collapse/expand
              menu. Dark mode juga tersedia!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-brand-600 dark:text-brand-400">
              <strong>Fitur:</strong> Smooth animations, dark mode support,
              role-based menu items, notification badges, dan fully responsive
              design.
            </p>
          </CardContent>
        </Card>
      </div>
    </CollapsibleDashboardLayout>
  );
}
