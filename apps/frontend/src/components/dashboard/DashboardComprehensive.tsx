"use client";

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
  Download
} from 'lucide-react';

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

interface DashboardComprehensiveProps {
  initialData?: DashboardData;
}

const DashboardComprehensive: React.FC<DashboardComprehensiveProps> = ({ initialData }) => {
  const [data, setData] = useState<DashboardData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [timeRange, setTimeRange] = useState('yearly');
  const [chartType, setChartType] = useState('line');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!initialData) {
      fetchDashboardData();
    }
  }, [timeRange, chartType]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/dashboard/comprehensive?time_range=${timeRange}&chart_type=${chartType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType: string) => {
    try {
      const response = await fetch(`/api/v1/dashboard/reports?report_type=${reportType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  const { analytics } = data;

  // Color schemes for charts
  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899'
  };

  const iucnColors = {
    'CR': '#dc2626', // Critically Endangered - Red
    'EN': '#ea580c', // Endangered - Orange
    'VU': '#d97706', // Vulnerable - Amber
    'NT': '#eab308', // Near Threatened - Yellow
    'LC': '#22c55e', // Least Concern - Green
    'DD': '#6b7280', // Data Deficient - Gray
    'NE': '#9ca3af'  // Not Evaluated - Light Gray
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comprehensive Dashboard</h1>
          <p className="text-muted-foreground">
            {data.user_role === 'super_admin' ? 'System-wide analytics and insights' : 'Regional park analytics and insights'}
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
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Species</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.biodiversity.summary.total_species}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.biodiversity.summary.total_endemic} endemic species
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Areas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conservation.parks.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.conservation.parks.total_area_ha.toLocaleString()} ha protected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.activities.by_status.reduce((sum: number, item: any) => sum + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total activities conducted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.content.articles.total + analytics.content.galleries.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles & galleries published
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="biodiversity">Biodiversity</TabsTrigger>
          <TabsTrigger value="conservation">Conservation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Species Discovery Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Species Discovery Timeline</CardTitle>
                <CardDescription>New species discovered over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.biodiversity.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Bar dataKey="species_count" name="Species Count" fill={colors.primary} />
                    <Line 
                      type="monotone" 
                      dataKey="species_count" 
                      stroke={colors.secondary} 
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* IUCN Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>IUCN Status Distribution</CardTitle>
                <CardDescription>Conservation status of recorded species</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critically Endangered', value: analytics.biodiversity.flora.iucn_status.critically_endangered + analytics.biodiversity.fauna.iucn_status.critically_endangered, color: iucnColors.CR },
                        { name: 'Endangered', value: analytics.biodiversity.flora.iucn_status.endangered + analytics.biodiversity.fauna.iucn_status.endangered, color: iucnColors.EN },
                        { name: 'Vulnerable', value: analytics.biodiversity.flora.iucn_status.vulnerable + analytics.biodiversity.fauna.iucn_status.vulnerable, color: iucnColors.VU },
                        { name: 'Near Threatened', value: analytics.biodiversity.flora.iucn_status.near_threatened + analytics.biodiversity.fauna.iucn_status.near_threatened, color: iucnColors.NT },
                        { name: 'Least Concern', value: analytics.biodiversity.flora.iucn_status.least_concern + analytics.biodiversity.fauna.iucn_status.least_concern, color: iucnColors.LC },
                        { name: 'Data Deficient', value: analytics.biodiversity.flora.iucn_status.data_deficient + analytics.biodiversity.fauna.iucn_status.data_deficient, color: iucnColors.DD },
                        { name: 'Not Evaluated', value: analytics.biodiversity.flora.iucn_status.not_evaluated + analytics.biodiversity.fauna.iucn_status.not_evaluated, color: iucnColors.NE }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Critically Endangered', value: analytics.biodiversity.flora.iucn_status.critically_endangered + analytics.biodiversity.fauna.iucn_status.critically_endangered, color: iucnColors.CR },
                        { name: 'Endangered', value: analytics.biodiversity.flora.iucn_status.endangered + analytics.biodiversity.fauna.iucn_status.endangered, color: iucnColors.EN },
                        { name: 'Vulnerable', value: analytics.biodiversity.flora.iucn_status.vulnerable + analytics.biodiversity.fauna.iucn_status.vulnerable, color: iucnColors.VU },
                        { name: 'Near Threatened', value: analytics.biodiversity.flora.iucn_status.near_threatened + analytics.biodiversity.fauna.iucn_status.near_threatened, color: iucnColors.NT },
                        { name: 'Least Concern', value: analytics.biodiversity.flora.iucn_status.least_concern + analytics.biodiversity.fauna.iucn_status.least_concern, color: iucnColors.LC },
                        { name: 'Data Deficient', value: analytics.biodiversity.flora.iucn_status.data_deficient + analytics.biodiversity.fauna.iucn_status.data_deficient, color: iucnColors.DD },
                        { name: 'Not Evaluated', value: analytics.biodiversity.flora.iucn_status.not_evaluated + analytics.biodiversity.fauna.iucn_status.not_evaluated, color: iucnColors.NE }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Regional Distribution */}
          {analytics.geographic.regional_distribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Parks and protected areas by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geographic.regional_distribution.map((region: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.provinsi}</h4>
                        <p className="text-sm text-muted-foreground">{region.kota_kabupaten}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{region.park_count} parks</div>
                        <div className="text-sm text-muted-foreground">
                          {region.total_area_ha.toLocaleString()} ha
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Biodiversity Tab */}
        <TabsContent value="biodiversity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Flora vs Fauna Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Flora vs Fauna</CardTitle>
                <CardDescription>Species distribution comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Total', flora: analytics.biodiversity.flora.total, fauna: analytics.biodiversity.fauna.total },
                    { name: 'Endemic', flora: analytics.biodiversity.flora.endemic, fauna: analytics.biodiversity.fauna.endemic },
                    { name: 'Approved', flora: analytics.biodiversity.flora.approved, fauna: analytics.biodiversity.fauna.approved },
                    { name: 'Pending', flora: analytics.biodiversity.flora.pending, fauna: analytics.biodiversity.fauna.pending }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="flora" name="Flora" fill={colors.primary} />
                    <Bar dataKey="fauna" name="Fauna" fill={colors.secondary} />
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
                        value={(analytics.biodiversity.flora.endemic / analytics.biodiversity.flora.total) * 100} 
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        {analytics.biodiversity.flora.endemic}/{analytics.biodiversity.flora.total}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fauna Endemic</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(analytics.biodiversity.fauna.endemic / analytics.biodiversity.fauna.total) * 100} 
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        {analytics.biodiversity.fauna.endemic}/{analytics.biodiversity.fauna.total}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Patterns */}
          {analytics.temporal.monthly_patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Discovery Patterns</CardTitle>
                <CardDescription>Species discovery patterns by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.temporal.monthly_patterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="species_count" 
                      stackId="1" 
                      stroke={colors.primary} 
                      fill={colors.primary}
                      name="Species Count"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Conservation Tab */}
        <TabsContent value="conservation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Park Area Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Park Area Distribution</CardTitle>
                <CardDescription>Protected area coverage and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analytics.conservation.parks.total}</div>
                      <div className="text-sm text-muted-foreground">Total Parks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {analytics.conservation.parks.total_area_ha.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Hectares Protected</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Area</span>
                      <span>{analytics.conservation.parks.avg_area_ha.toFixed(2)} ha</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Largest Park</span>
                      <span>{analytics.conservation.parks.max_area_ha.toLocaleString()} ha</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Smallest Park</span>
                      <span>{analytics.conservation.parks.min_area_ha.toLocaleString()} ha</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conservation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Conservation Status</CardTitle>
                <CardDescription>Park status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.conservation.conservation_status.map((status: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={status.status === 'approved' ? 'default' : 'secondary'}>
                          {status.status}
                        </Badge>
                        <span className="text-sm">{status.count} parks</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {status.total_area_ha.toLocaleString()} ha
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>User engagement and activity trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.users.by_role.map((role: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium capitalize">{role.role.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{role.total}</div>
                        <div className="text-sm text-muted-foreground">
                          {role.active} active
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Approval rates and processing efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.approval_rates.map((rate: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{rate.entity_type}</span>
                        <span>{rate.approval_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={rate.approval_rate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{rate.approved} approved</span>
                        <span>{rate.pending} pending</span>
                        <span>{rate.rejected} rejected</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          {analytics.activities.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Activities conducted over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.activities.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activity_count" 
                      stroke={colors.primary} 
                      strokeWidth={2}
                      name="Activities"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardComprehensive;
