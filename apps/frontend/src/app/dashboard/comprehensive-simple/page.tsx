'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAuth } from '@/lib/useAuth';
import { useSearchParams } from 'next/navigation';
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
  AlertCircle
} from 'lucide-react';
import SimpleBiodiversityCharts from '@/components/dashboard/SimpleBiodiversityCharts';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

interface DashboardData {
  user_role: string;
  user_id: string;
  park_id?: string;
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
      };
    };
    conservation: {
      parks: {
        total: number;
        total_area_ha: number;
      };
    };
    activities: {
      total: number;
    };
  };
  generated_at: string;
}

const ComprehensiveDashboardPage: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(searchParams.get('time_range') || 'yearly');
  const [activeTab, setActiveTab] = useState('overview');

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Redirect to login if not authenticated (must be in useEffect, not during render)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [timeRange, user, authLoading]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Use the simple comprehensive dashboard API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}/api/v1/dashboard/comprehensive-simple?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          logout();
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'five_years', label: '5 Years' }
  ];

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

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
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
      {/* Time Range Selector */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchDashboardData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="biodiversity">Biodiversity</TabsTrigger>
            <TabsTrigger value="conservation">Conservation</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Species</CardTitle>
                  <TreePine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.analytics.biodiversity.summary.total_species}</div>
                  <p className="text-xs text-muted-foreground">
                    Flora + Fauna
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Endemic Species</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.analytics.biodiversity.summary.total_endemic}</div>
                  <p className="text-xs text-muted-foreground">
                    {((data.analytics.biodiversity.summary.total_endemic / Math.max(data.analytics.biodiversity.summary.total_species, 1)) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Species</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.analytics.biodiversity.summary.total_approved}</div>
                  <p className="text-xs text-muted-foreground">
                    {((data.analytics.biodiversity.summary.total_approved / Math.max(data.analytics.biodiversity.summary.total_species, 1)) * 100).toFixed(1)}% approved
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
                    Total activities
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Biodiversity Charts */}
            <SimpleBiodiversityCharts data={data} />
          </TabsContent>

          {/* Biodiversity Tab */}
          <TabsContent value="biodiversity">
            <SimpleBiodiversityCharts data={data} />
          </TabsContent>

          {/* Conservation Tab */}
          <TabsContent value="conservation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parks Overview</CardTitle>
                  <CardDescription>Conservation Areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {data.analytics.conservation.parks.total}
                    </div>
                    <p className="text-muted-foreground">Total Parks</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Area</CardTitle>
                  <CardDescription>Conservation Coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {data.analytics.conservation.parks.total_area_ha.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Hectares</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Activities Overview</CardTitle>
                <CardDescription>Conservation and Research Activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {data.analytics.activities.total}
                  </div>
                  <p className="text-muted-foreground">Total Activities</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data generated at: {new Date(data.generated_at).toLocaleString()}</p>
          <p>Time range: {data.date_range.start} to {data.date_range.end}</p>
        </div>
      </div>
    </CollapsibleDashboardLayout>
  );
};

export default ComprehensiveDashboardPage;
