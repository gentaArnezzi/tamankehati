"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  TreePine,
  Bird,
  Leaf,
  MapPin,
  TrendingUp,
  Users,
  Calendar,
  Shield,
  Database,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  Award,
  Info,
  TreePine as Tree,
} from "lucide-react";
import {
  LineChart,
  Line,
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
} from "recharts";

interface ConservationStatus {
  status: string;
  count: number;
  percentage: number;
}

interface TopFamily {
  family: string;
  count: number;
}

interface ProvinceDistribution {
  provinsi: string;
  total_taman: number;
  total_flora: number;
  total_fauna: number;
}

interface GrowthData {
  month: string;
  flora_count: number;
  fauna_count: number;
  taman_count: number;
}

interface DashboardInsights {
  total_flora: number;
  total_fauna: number;
  total_taman: number;
  total_species: number;
  flora_by_iucn: ConservationStatus[];
  fauna_by_iucn: ConservationStatus[];
  endemic_flora: number;
  endemic_fauna: number;
  endemic_percentage: number;
  top_flora_families: TopFamily[];
  top_fauna_families: TopFamily[];
  province_distribution: ProvinceDistribution[];
  growth_trends: GrowthData[];
  flora_with_images: number;
  fauna_with_images: number;
  flora_with_complete_data: number;
  fauna_with_complete_data: number;
  species_with_images: number;
  species_with_complete_data: number;
  last_month_growth: number;
}

const IUCN_STATUS_LABELS: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  CR: { label: "Kritis", color: "text-red-700", bgColor: "bg-red-100" },
  EN: { label: "Genting", color: "text-orange-700", bgColor: "bg-orange-100" },
  VU: { label: "Rentan", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  NT: {
    label: "Hampir Terancam",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  LC: {
    label: "Risiko Rendah",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  DD: { label: "Data Kurang", color: "text-gray-700", bgColor: "bg-gray-100" },
  NE: {
    label: "Belum Dievaluasi",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
  },
};

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};

export default function TentangPage() {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/public/dashboard/insights`,
      );
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Taman Kehati",
      value: insights?.total_taman || 0,
      icon: TreePine,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Spesies Flora",
      value: insights?.total_flora || 0,
      icon: Leaf,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      title: "Spesies Fauna",
      value: insights?.total_fauna || 0,
      icon: Bird,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Total Spesies",
      value: insights?.total_species || 0,
      icon: Database,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 pt-20">
      {/* Compact Header - Tableau Style */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Indeks Kehati Indonesia
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Dashboard Keanekaragaman Hayati
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Real-time Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards - Compact Tableau Style */}
      <section className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse bg-white border-gray-200"
                >
                  <CardContent className="p-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            : statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={index}
                    className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-gray-50`}>
                          <Icon className="h-4 w-4 text-gray-700" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold text-gray-900">
                            {card.value.toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {card.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </section>

      {/* Main Dashboard Grid - Tableau Style */}
      <section className="container mx-auto px-6 pb-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Endemic Species Card - Compact */}
          <Card className="col-span-12 md:col-span-4 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                Spesies Endemik Indonesia
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-center py-2">
                <div className="text-4xl font-bold text-amber-600">
                  {(
                    (insights?.endemic_flora || 0) +
                    (insights?.endemic_fauna || 0)
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Total Spesies Endemik
                </div>
                <div className="mt-3 text-xs font-medium text-amber-700">
                  {insights?.endemic_percentage.toFixed(1)}% dari total
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold text-emerald-600">
                    {insights?.endemic_flora || 0}
                  </div>
                  <div className="text-[10px] text-gray-600">Flora</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold text-blue-600">
                    {insights?.endemic_fauna || 0}
                  </div>
                  <div className="text-[10px] text-gray-600">Fauna</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conservation Status - Compact */}
          <Card className="col-span-12 md:col-span-8 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-700" />
                Status Konservasi IUCN
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-3">
                {loading ? (
                  <div className="col-span-2 text-center py-4 text-gray-500 text-xs">
                    Memuat...
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Flora
                      </h4>
                      <div className="space-y-1.5">
                        {insights?.flora_by_iucn &&
                          insights.flora_by_iucn.slice(0, 3).map((item) => {
                            const statusInfo = IUCN_STATUS_LABELS[
                              item.status
                            ] || {
                              label: item.status,
                              color: "text-gray-700",
                              bgColor: "bg-gray-100",
                            };
                            return (
                              <div
                                key={item.status}
                                className="flex items-center justify-between text-xs"
                              >
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                                >
                                  {item.status}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {item.count}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Fauna
                      </h4>
                      <div className="space-y-1.5">
                        {insights?.fauna_by_iucn &&
                          insights.fauna_by_iucn.slice(0, 3).map((item) => {
                            const statusInfo = IUCN_STATUS_LABELS[
                              item.status
                            ] || {
                              label: item.status,
                              color: "text-gray-700",
                              bgColor: "bg-gray-100",
                            };
                            return (
                              <div
                                key={item.status}
                                className="flex items-center justify-between text-xs"
                              >
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                                >
                                  {item.status}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {item.count}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Growth Trends - Full Width */}
          <Card className="col-span-12 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-700" />
                Tren Pertumbuhan Data (6 Bulan Terakhir)
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Memuat...
                </div>
              ) : insights?.growth_trends &&
                insights.growth_trends.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insights.growth_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        stroke="#6b7280"
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                        labelFormatter={formatMonth}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                        iconType="circle"
                      />
                      <Line
                        type="monotone"
                        dataKey="flora_count"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Flora"
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fauna_count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Fauna"
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="taman_count"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Taman"
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Belum ada data
                </div>
              )}
            </CardContent>
          </Card>

          {/* IUCN Pie Charts - Side by Side */}
          <Card className="col-span-12 md:col-span-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-600" />
                Status IUCN Flora
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Memuat...
                </div>
              ) : insights?.flora_by_iucn &&
                insights.flora_by_iucn.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={insights.flora_by_iucn}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) =>
                          `${status} (${percentage.toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {insights.flora_by_iucn.map((entry, index) => {
                          const colors: Record<string, string> = {
                            CR: "#dc2626",
                            EN: "#ea580c",
                            VU: "#facc15",
                            NT: "#3b82f6",
                            LC: "#10b981",
                            DD: "#6b7280",
                            NE: "#475569",
                          };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[entry.status] || "#94a3b8"}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Belum ada data
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-12 md:col-span-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Bird className="h-4 w-4 text-blue-600" />
                Status IUCN Fauna
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Memuat...
                </div>
              ) : insights?.fauna_by_iucn &&
                insights.fauna_by_iucn.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={insights.fauna_by_iucn}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) =>
                          `${status} (${percentage.toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {insights.fauna_by_iucn.map((entry, index) => {
                          const colors: Record<string, string> = {
                            CR: "#dc2626",
                            EN: "#ea580c",
                            VU: "#facc15",
                            NT: "#3b82f6",
                            LC: "#10b981",
                            DD: "#6b7280",
                            NE: "#475569",
                          };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[entry.status] || "#94a3b8"}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Belum ada data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Families Bar Charts - Side by Side */}
          <Card className="col-span-12 md:col-span-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-600" />
                Top 5 Famili Flora
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Memuat...
                </div>
              ) : insights?.top_flora_families &&
                insights.top_flora_families.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={insights.top_flora_families}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        stroke="#6b7280"
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="family"
                        stroke="#6b7280"
                        style={{ fontSize: "11px" }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Belum ada data
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-12 md:col-span-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Bird className="h-4 w-4 text-blue-600" />
                Top 5 Famili Fauna
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Memuat...
                </div>
              ) : insights?.top_fauna_families &&
                insights.top_fauna_families.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={insights.top_fauna_families}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        stroke="#6b7280"
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="family"
                        stroke="#6b7280"
                        style={{ fontSize: "11px" }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Belum ada data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="col-span-12 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-700" />
                Distribusi Geografis - Top 10 Provinsi
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2.5">
                {loading ? (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    Memuat...
                  </div>
                ) : insights?.province_distribution &&
                  insights.province_distribution.length > 0 ? (
                  insights.province_distribution.map((province, index) => (
                    <div key={province.provinsi} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-medium text-[10px]">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {province.provinsi}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-purple-700 font-medium">
                            <TreePine className="h-2.5 w-2.5 inline mr-0.5" />
                            {province.total_taman}
                          </span>
                          <span className="text-emerald-700 font-medium">
                            <Leaf className="h-2.5 w-2.5 inline mr-0.5" />
                            {province.total_flora}
                          </span>
                          <span className="text-blue-700 font-medium">
                            <Bird className="h-2.5 w-2.5 inline mr-0.5" />
                            {province.total_fauna}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                          style={{
                            width: `${(province.total_taman / (insights.province_distribution[0]?.total_taman || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    Belum ada data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Metrics */}
          <Card className="col-span-12 md:col-span-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-700" />
                Kualitas Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Spesies dengan Gambar</span>
                  <span className="font-semibold text-gray-900">
                    {insights?.species_with_images || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Data Lengkap</span>
                  <span className="font-semibold text-gray-900">
                    {insights?.species_with_complete_data || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Pertumbuhan Bulan Ini</span>
                  <span className="font-semibold text-emerald-600">
                    +{insights?.last_month_growth || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-12 md:col-span-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-700" />
                Tentang Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Data ini mencakup informasi keanekaragaman hayati Indonesia dari
                berbagai taman kehati yang telah terverifikasi dan disetujui
                oleh tim kurasi kami.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Compact CTA */}
      <section className="container mx-auto px-6 py-8 pb-12">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-3">
              Jelajahi Data Lengkap
            </h2>
            <p className="text-gray-300 mb-6 text-sm">
              Akses informasi detail tentang keanekaragaman hayati Indonesia
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="/taman"
                className="px-6 py-2.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-all text-sm"
              >
                Taman Kehati
              </a>
              <a
                href="/flora"
                className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all text-sm"
              >
                Flora
              </a>
              <a
                href="/fauna"
                className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all text-sm"
              >
                Fauna
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
