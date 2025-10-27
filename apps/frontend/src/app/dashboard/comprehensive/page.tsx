"use client";

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { useSearchParams } from 'next/navigation';
import { DashboardLayoutNext } from '@/components/DashboardLayoutNext';

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

const ComprehensiveDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(searchParams.get('time_range') || 'yearly');
  const [chartType, setChartType] = useState('line');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [timeRange, chartType, user, authLoading]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Use the comprehensive dashboard API
      const response = await fetch(`http://localhost:8000/api/v1/dashboard/comprehensive-simple?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/dashboard/reports?report_type=${reportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load dashboard data.</p>
      </div>
    );
  }

  return (
    <DashboardLayoutNext>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comprehensive Dashboard</h1>
          <p className="text-muted-foreground">
            {data.user_role === 'super_admin' ? 'System-wide analytics and insights' : 'Regional park analytics and insights'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Data from {new Date(data.date_range.start).toLocaleDateString()} to {new Date(data.date_range.end).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="five_years">5 Years</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => downloadReport('comprehensive')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

        {/* Main Dashboard Content */}
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Species</CardTitle>
                <TreePine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.analytics.biodiversity.summary.total_species}</div>
                <p className="text-xs text-muted-foreground">
                  {data.analytics.biodiversity.summary.total_endemic} endemic species
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Protected Areas</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.analytics.conservation.parks.total}</div>
                <p className="text-xs text-muted-foreground">
                  Parks in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.analytics.activities.total}</div>
                <p className="text-xs text-muted-foreground">
                  Total activities conducted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.analytics.biodiversity.summary.total_species > 0 
                    ? ((data.analytics.biodiversity.summary.total_approved / data.analytics.biodiversity.summary.total_species) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.analytics.biodiversity.summary.total_approved} approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flora vs Fauna Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Flora vs Fauna Distribution</CardTitle>
                <CardDescription>Species distribution comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Total', flora: data.analytics.biodiversity.flora.total, fauna: data.analytics.biodiversity.fauna.total },
                    { name: 'Endemic', flora: data.analytics.biodiversity.flora.endemic, fauna: data.analytics.biodiversity.fauna.endemic },
                    { name: 'Approved', flora: data.analytics.biodiversity.flora.approved, fauna: data.analytics.biodiversity.fauna.approved }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="flora" name="Flora" fill="#3b82f6" />
                    <Bar dataKey="fauna" name="Fauna" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Endemic Species Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Endemic Species Analysis</CardTitle>
                <CardDescription>Endemic species distribution and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Flora Endemic</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={data.analytics.biodiversity.flora.total > 0 ? (data.analytics.biodiversity.flora.endemic / data.analytics.biodiversity.flora.total) * 100 : 0} 
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        {data.analytics.biodiversity.flora.endemic}/{data.analytics.biodiversity.flora.total}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fauna Endemic</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={data.analytics.biodiversity.fauna.total > 0 ? (data.analytics.biodiversity.fauna.endemic / data.analytics.biodiversity.fauna.total) * 100 : 0} 
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        {data.analytics.biodiversity.fauna.endemic}/{data.analytics.biodiversity.fauna.total}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>Comprehensive overview of system data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Biodiversity</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Species:</span>
                      <span>{data.analytics.biodiversity.summary.total_species}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Endemic Species:</span>
                      <span>{data.analytics.biodiversity.summary.total_endemic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved Species:</span>
                      <span>{data.analytics.biodiversity.summary.total_approved}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Conservation</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Parks:</span>
                      <span>{data.analytics.conservation.parks.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Area:</span>
                      <span>{(data.analytics.conservation.parks.total_area_ha || 0).toLocaleString()} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Area:</span>
                      <span>{(data.analytics.conservation.parks.avg_area_ha || 0).toFixed(2)} ha</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Activities</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Activities:</span>
                      <span>{data.analytics.activities.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Role:</span>
                      <span className="capitalize">{data.user_role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Range:</span>
                      <span className="capitalize">{data.time_range}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayoutNext>
  );
};

export default ComprehensiveDashboardPage;
