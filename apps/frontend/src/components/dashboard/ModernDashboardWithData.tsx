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

interface ModernDashboardWithDataProps {
  user?: any;
}

interface DashboardData {
  user_role: string;
  user_id: number;
  park_id?: number;
  time_range: string;
  chart_type: string;
  date_range: {
    start: string;
    end: string;
  };
  analytics: {
    biodiversity: any;
    conservation: any;
    activities: any;
    content: any;
    users: any;
    geographic: any;
    temporal: any;
    performance: any;
  };
  generated_at: string;
}

const ModernDashboardWithData: React.FC<ModernDashboardWithDataProps> = ({
  user,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("yearly");

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

  // Sample data for demonstration (fallback)
  const sampleData = {
    visitors: {
      unique: 18600,
      totalPageviews: 55900,
      bounceRate: 54,
      visitDuration: "2m 56s",
      chartData: [
        { period: 1, visitors: 120, pageviews: 340 },
        { period: 2, visitors: 190, pageviews: 280 },
        { period: 3, visitors: 300, pageviews: 400 },
        { period: 4, visitors: 250, pageviews: 350 },
        { period: 5, visitors: 180, pageviews: 320 },
        { period: 6, visitors: 220, pageviews: 380 },
        { period: 7, visitors: 280, pageviews: 420 },
        { period: 8, visitors: 320, pageviews: 450 },
        { period: 9, visitors: 290, pageviews: 410 },
        { period: 10, visitors: 350, pageviews: 480 },
        { period: 11, visitors: 380, pageviews: 520 },
        { period: 12, visitors: 420, pageviews: 580 },
        { period: 13, visitors: 390, pageviews: 540 },
        { period: 14, visitors: 450, pageviews: 620 },
        { period: 15, visitors: 480, pageviews: 680 },
      ],
    },
    countries: [
      { name: "Indonesia", flag: "🇮🇩", percentage: 85 },
      { name: "Malaysia", flag: "🇲🇾", percentage: 65 },
      { name: "Thailand", flag: "🇹🇭", percentage: 45 },
      { name: "Philippines", flag: "🇵🇭", percentage: 35 },
      { name: "Singapore", flag: "🇸🇬", percentage: 25 },
      { name: "Vietnam", flag: "🇻🇳", percentage: 15 },
    ],
    financial: {
      totalBalance: 21550,
      investment: 15000,
      saving: 500,
      totalInvestment: 32819,
      totalProfit: 1260000,
      totalReturn: 1028000,
    },
    portfolios: [
      {
        name: "Flora Species",
        value: data?.analytics?.biodiversity?.flora?.total || 0,
        change: 2.16,
        positive: true,
        color: "bg-green-500",
      },
      {
        name: "Fauna Species",
        value: data?.analytics?.biodiversity?.fauna?.total || 0,
        change: -2.16,
        positive: false,
        color: "bg-yellow-500",
      },
      {
        name: "Protected Areas",
        value: data?.analytics?.conservation?.parks?.total || 0,
        change: -2.16,
        positive: false,
        color: "bg-blue-500",
      },
    ],
    dailyTasks: [
      {
        name: "Species Approval",
        current: data?.analytics?.biodiversity?.summary?.total_approved || 0,
        total: data?.analytics?.biodiversity?.summary?.total_species || 100,
      },
      {
        name: "Park Management",
        current: data?.analytics?.conservation?.parks?.total || 0,
        total: 50,
      },
      {
        name: "Activities",
        current: data?.analytics?.activities?.total || 0,
        total: 100,
      },
    ],
    users: [
      {
        name: "John Doe",
        username: "@john.user",
        status: "Active",
        role: "Super Admin",
      },
      {
        name: "Jane Smith",
        username: "@jane.smith",
        status: "Active",
        role: "Regional Admin",
      },
      {
        name: "Bob Johnson",
        username: "@bob.johnson",
        status: "Inactive",
        role: "Regional Admin",
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading dashboard...
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
          Error loading dashboard
        </h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const chartData = sampleData.visitors.chartData;
  const weeklyData = [
    { day: "SUN", value: 120 },
    { day: "TUE", value: 180 },
    { day: "WED", value: 220 },
    { day: "THU", value: 190 },
    { day: "FRI", value: 250 },
    { day: "SAT", value: 280 },
    { day: "SUN", value: 320 },
  ];

  const donutData = [
    {
      name: "Approved",
      value: data?.analytics?.biodiversity?.summary?.total_approved || 0,
      color: "#10b981",
    },
    {
      name: "Pending",
      value:
        (data?.analytics?.biodiversity?.summary?.total_species || 0) -
        (data?.analytics?.biodiversity?.summary?.total_approved || 0),
      color: "#f59e0b",
    },
    { name: "Rejected", value: 0, color: "#ef4444" },
  ];

  const taskData = [
    { name: "Completed", value: 60, color: "#10b981" },
    { name: "In Progress", value: 25, color: "#f59e0b" },
    { name: "Pending", value: 15, color: "#8b5cf6" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-16 items-center px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">.D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Tamankehati Dashboard
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center gap-8">
              {[
                { name: "Home", active: true },
                { name: "Biodiversity", active: false },
                { name: "Conservation", active: false },
                { name: "Analytics", active: false },
              ].map((item) => (
                <button
                  key={item.name}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-100 text-blue-700"
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
            <Button variant="ghost" size="sm" className="relative">
              <MessageCircle className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                11
              </Badge>
            </Button>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                7
              </Badge>
            </Button>

            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
          {/* Top Countries */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Top Countries
                </CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Last 7 days</SelectItem>
                    <SelectItem value="weekly">Last 30 days</SelectItem>
                    <SelectItem value="monthly">Last 90 days</SelectItem>
                    <SelectItem value="yearly">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* World Map Placeholder */}
              <div className="h-32 bg-blue-50 rounded-lg flex items-center justify-center relative">
                <div className="text-blue-600 text-4xl">🌍</div>
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <PlusIcon className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Country List */}
              <div className="space-y-3">
                {sampleData.countries.map((country, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium">
                        {country.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={country.percentage}
                        className="w-16 h-2"
                      />
                      <span className="text-sm text-gray-600 w-8">
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Data Performance */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Biodiversity Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <TreePine className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold">Species</div>
                      <div className="text-xs text-gray-600">
                        {data?.analytics?.biodiversity?.summary
                          ?.total_species || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">
                    Approved
                  </span>
                  <span className="text-sm font-semibold text-green-800">
                    {data?.analytics?.biodiversity?.summary?.total_approved ||
                      0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-800">
                    Pending
                  </span>
                  <span className="text-sm font-semibold text-yellow-800">
                    {(data?.analytics?.biodiversity?.summary?.total_species ||
                      0) -
                      (data?.analytics?.biodiversity?.summary?.total_approved ||
                        0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-800">
                    Rejected
                  </span>
                  <span className="text-sm font-semibold text-red-800">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Central Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Visitors Analytics */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Biodiversity Analytics
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" stroke="#666" />
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
                      dataKey="visitors"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pageviews"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Species
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {data?.analytics?.biodiversity?.summary?.total_species || 0}
                  </div>
                  <div className="text-xs text-green-600 font-medium">+18%</div>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Endemic Species
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {data?.analytics?.biodiversity?.summary?.total_endemic || 0}
                  </div>
                  <div className="text-xs text-green-600 font-medium">+25%</div>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Approval Rate
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {data?.analytics?.biodiversity?.summary?.total_species > 0
                      ? (
                          (data?.analytics?.biodiversity?.summary
                            ?.total_approved /
                            data?.analytics?.biodiversity?.summary
                              ?.total_species) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-green-600 font-medium">+7%</div>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Protected Areas
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {data?.analytics?.conservation?.parks?.total || 0}
                  </div>
                  <div className="text-xs text-green-600 font-medium">+12%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Total Species
                  </span>
                  <TreePine className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">
                  {data?.analytics?.biodiversity?.summary?.total_species || 0}
                </div>
                <div className="text-xs opacity-90">Flora & Fauna</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Endemic Species
                  </span>
                  <Bird className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">
                  {data?.analytics?.biodiversity?.summary?.total_endemic || 0}
                </div>
                <div className="text-xs opacity-90">Unique to Region</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Protected Areas
                  </span>
                  <Shield className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">
                  {data?.analytics?.conservation?.parks?.total || 0}
                </div>
                <div className="text-xs opacity-90">Parks & Reserves</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Activities
                  </span>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">
                  {data?.analytics?.activities?.total || 0}
                </div>
                <div className="text-xs opacity-90">Conservation Actions</div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis and Daily Task */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conservation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {(
                    data?.analytics?.conservation?.parks?.total_area_ha || 0
                  ).toLocaleString()}{" "}
                  ha
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conservation Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={40}
                          dataKey="value"
                        >
                          {taskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  {sampleData.dailyTasks.map((task, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{task.name}</span>
                        <span className="text-gray-600">
                          {task.current.toLocaleString()}/
                          {task.total.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={(task.current / task.total) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6">
          {/* Conservation Performance */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Conservation Performance
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">
                    Total Species
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-900">
                  {data?.analytics?.biodiversity?.summary?.total_species || 0}
                </div>
                <div className="text-sm text-green-700">+5.3%</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Protected Area
                  </span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {(
                    data?.analytics?.conservation?.parks?.total_area_ha || 0
                  ).toLocaleString()}{" "}
                  ha
                </div>
                <div className="text-sm text-blue-700">0.58%</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800">
                    Activities
                  </span>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-purple-900">
                  {data?.analytics?.activities?.total || 0}
                </div>
                <div className="text-sm text-purple-700">0.18%</div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Species", icon: TreePine },
                  { name: "Parks", icon: MapPin },
                  { name: "Activities", icon: Activity },
                  { name: "Reports", icon: FileText },
                  { name: "Analytics", icon: BarChart3 },
                ].map((service, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <service.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {service.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Biodiversity Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleData.portfolios.map((portfolio, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {portfolio.name}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${portfolio.color}`}
                      ></div>
                    </div>
                    <div className="text-lg font-bold">{portfolio.value}</div>
                    <div
                      className={`text-sm ${portfolio.positive ? "text-green-600" : "text-red-600"}`}
                    >
                      {portfolio.positive ? "+" : ""}
                      {portfolio.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Overview */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  User Overview
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleData.users.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-600">
                          {user.username}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                        ></div>
                        <span className="text-xs text-gray-600">
                          {user.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{user.role}</div>
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
};

export default ModernDashboardWithData;
