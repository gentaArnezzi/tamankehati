"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ComposedChart
} from 'recharts';
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
  Plus as PlusIcon
} from 'lucide-react';

interface ModernDashboardProps {
  user?: any;
  data?: any;
  loading?: boolean;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ user, data, loading = false }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('home');

  // Sample data for demonstration
  const sampleData = {
    visitors: {
      unique: 18600,
      totalPageviews: 55900,
      bounceRate: 54,
      visitDuration: '2m 56s',
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
        { period: 15, visitors: 480, pageviews: 680 }
      ]
    },
    countries: [
      { name: 'United States', flag: '🇺🇸', percentage: 55 },
      { name: 'Canada', flag: '🇨🇦', percentage: 48 },
      { name: 'France', flag: '🇫🇷', percentage: 40 },
      { name: 'Italy', flag: '🇮🇹', percentage: 32 },
      { name: 'Australia', flag: '🇦🇺', percentage: 25 },
      { name: 'India', flag: '🇮🇳', percentage: 15 }
    ],
    financial: {
      totalBalance: 21550,
      investment: 15000,
      saving: 500,
      totalInvestment: 32819,
      totalProfit: 1260000,
      totalReturn: 1028000
    },
    portfolios: [
      { name: 'ASSET A', value: 365.51, change: 2.16, positive: true, color: 'bg-green-500' },
      { name: 'ASSET B', value: 165.31, change: -2.16, positive: false, color: 'bg-yellow-500' },
      { name: 'ASSET C', value: 165.31, change: -2.16, positive: false, color: 'bg-blue-500' }
    ],
    dailyTasks: [
      { name: 'Information A', current: 45100, total: 100000 },
      { name: 'Information B', current: 454, total: 1000 },
      { name: 'Information C', current: 21, total: 120 }
    ],
    users: [
      { name: 'John Doe', username: '@john.user', status: 'Active', role: 'Sales' },
      { name: 'Jane Smith', username: '@jane.smith', status: 'Active', role: 'Marketing' },
      { name: 'Bob Johnson', username: '@bob.johnson', status: 'Inactive', role: 'Developer' }
    ]
  };

  const chartData = sampleData.visitors.chartData;
  const weeklyData = [
    { day: 'SUN', value: 120 },
    { day: 'TUE', value: 180 },
    { day: 'WED', value: 220 },
    { day: 'THU', value: 190 },
    { day: 'FRI', value: 250 },
    { day: 'SAT', value: 280 },
    { day: 'SUN', value: 320 }
  ];

  const donutData = [
    { name: 'Shortlisted', value: 30, color: '#10b981' },
    { name: 'Accepted', value: 25, color: '#3b82f6' },
    { name: 'Rejected', value: 452, color: '#ef4444' }
  ];

  const taskData = [
    { name: 'Completed', value: 60, color: '#10b981' },
    { name: 'In Progress', value: 25, color: '#f59e0b' },
    { name: 'Pending', value: 15, color: '#8b5cf6' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
            <span className="text-xl font-bold text-gray-900">Dashboard</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center gap-8">
              {[
                { name: 'Home', active: true },
                { name: 'Layout', active: false },
                { name: 'Chart', active: false },
                { name: 'Payment', active: false }
              ].map((item) => (
                <button
                  key={item.name}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                <CardTitle className="text-lg font-semibold">Top Countries</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
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
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={country.percentage} className="w-16 h-2" />
                      <span className="text-sm text-gray-600 w-8">{country.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Data Performance */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Company data performance</CardTitle>
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
                      <Star className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold">Data user A</div>
                      <div className="text-xs text-gray-600">$182.93 +8%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Shortlisted</span>
                  <span className="text-sm font-semibold text-green-800">30</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Accepted</span>
                  <span className="text-sm font-semibold text-blue-800">25</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-800">Rejected</span>
                  <span className="text-sm font-semibold text-red-800">452</span>
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
                <CardTitle className="text-lg font-semibold">Visitors Analytics</CardTitle>
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
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="visitors" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pageviews" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">18.6K Unique Visitors</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-xs text-green-600 font-medium">+18%</div>
                </div>
                
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">55.9K Total Pageviews</span>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-xs text-red-600 font-medium">-25%</div>
                </div>
                
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">54% Bounce Rate</span>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-xs text-red-600 font-medium">-7%</div>
                </div>
                
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">2m 56s Visit Duration</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
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
                  <span className="text-sm font-medium opacity-90">Total Balance</span>
                  <DollarSign className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">${sampleData.financial.totalBalance.toLocaleString()}</div>
                <div className="text-xs opacity-90">62.5%</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Investment</span>
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">${sampleData.financial.investment.toLocaleString()}</div>
                <div className="text-xs opacity-90">5.5%</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Saving</span>
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">${sampleData.financial.saving.toLocaleString()}</div>
                <div className="text-xs opacity-90">5.5%</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Saving</span>
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">${sampleData.financial.saving.toLocaleString()}</div>
                <div className="text-xs opacity-90">5.5%</div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Wallet Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium opacity-90">Information A -21.73%</div>
                    <div className="text-lg font-semibold">Stock Wallet</div>
                  </div>
                  <Settings className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium opacity-90">Information B -21.73%</div>
                    <div className="text-lg font-semibold">Stock Wallet</div>
                  </div>
                  <Grid className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis and Daily Task */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">$521.00</div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Task</CardTitle>
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
                        <span className="text-gray-600">{task.current.toLocaleString()}/{task.total.toLocaleString()}</span>
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
          {/* Company Data Performance */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Company data performance</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">Total Investment</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-900">${sampleData.financial.totalInvestment.toLocaleString()}</div>
                <div className="text-sm text-green-700">+5.3%</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">Total Profit</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-900">${sampleData.financial.totalProfit.toLocaleString()}</div>
                <div className="text-sm text-green-700">0.58%</div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-800">Total Return</span>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-xl font-bold text-red-900">${sampleData.financial.totalReturn.toLocaleString()}</div>
                <div className="text-sm text-red-700">0.18%</div>
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
                  { name: 'Withdraw', icon: DollarSign },
                  { name: 'Transfer', icon: ArrowUpDown },
                  { name: 'My Card', icon: CreditCard },
                  { name: 'Deposit', icon: PiggyBank },
                  { name: 'Add More', icon: Plus }
                ].map((service, index) => (
                  <div key={index} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <service.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Portfolios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleData.portfolios.map((portfolio, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{portfolio.name}</span>
                      <div className={`w-3 h-3 rounded-full ${portfolio.color}`}></div>
                    </div>
                    <div className="text-lg font-bold">${portfolio.value}</div>
                    <div className={`text-sm ${portfolio.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.positive ? '+' : ''}${portfolio.change}
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
                <CardTitle className="text-lg font-semibold">User Overview</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleData.users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-600">{user.username}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-gray-600">{user.status}</span>
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

export default ModernDashboard;
