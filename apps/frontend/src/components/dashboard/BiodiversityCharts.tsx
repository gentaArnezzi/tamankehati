"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";
import { TreePine, Bird, AlertTriangle, CheckCircle, Eye } from "lucide-react";

interface BiodiversityData {
  flora: {
    total: number;
    endemic: number;
    approved: number;
    pending: number;
    iucn_status: {
      critically_endangered: number;
      endangered: number;
      vulnerable: number;
      near_threatened: number;
      least_concern: number;
      data_deficient: number;
      not_evaluated: number;
    };
  };
  fauna: {
    total: number;
    endemic: number;
    approved: number;
    pending: number;
    iucn_status: {
      critically_endangered: number;
      endangered: number;
      vulnerable: number;
      near_threatened: number;
      least_concern: number;
      data_deficient: number;
      not_evaluated: number;
    };
  };
  timeline: Array<{
    period: string;
    species_count: number;
    kingdom: string;
  }>;
  summary: {
    total_species: number;
    total_endemic: number;
    total_approved: number;
    total_pending: number;
  };
}

interface BiodiversityChartsProps {
  data: BiodiversityData;
  chartType?: "line" | "bar" | "area" | "pie";
}

const BiodiversityCharts: React.FC<BiodiversityChartsProps> = ({
  data,
  chartType = "line",
}) => {
  const colors = {
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    danger: "#ef4444",
    warning: "#f59e0b",
    success: "#10b981",
    info: "#06b6d4",
    purple: "#8b5cf6",
    pink: "#ec4899",
  };

  const iucnColors = {
    CR: "#dc2626",
    EN: "#ea580c",
    VU: "#d97706",
    NT: "#eab308",
    LC: "#22c55e",
    DD: "#6b7280",
    NE: "#9ca3af",
  };

  // Prepare IUCN data for charts
  const iucnData = [
    {
      name: "Critically Endangered",
      value:
        data.flora.iucn_status.critically_endangered +
        data.fauna.iucn_status.critically_endangered,
      flora: data.flora.iucn_status.critically_endangered,
      fauna: data.fauna.iucn_status.critically_endangered,
      color: iucnColors.CR,
    },
    {
      name: "Endangered",
      value:
        data.flora.iucn_status.endangered + data.fauna.iucn_status.endangered,
      flora: data.flora.iucn_status.endangered,
      fauna: data.fauna.iucn_status.endangered,
      color: iucnColors.EN,
    },
    {
      name: "Vulnerable",
      value:
        data.flora.iucn_status.vulnerable + data.fauna.iucn_status.vulnerable,
      flora: data.flora.iucn_status.vulnerable,
      fauna: data.fauna.iucn_status.vulnerable,
      color: iucnColors.VU,
    },
    {
      name: "Near Threatened",
      value:
        data.flora.iucn_status.near_threatened +
        data.fauna.iucn_status.near_threatened,
      flora: data.flora.iucn_status.near_threatened,
      fauna: data.fauna.iucn_status.near_threatened,
      color: iucnColors.NT,
    },
    {
      name: "Least Concern",
      value:
        data.flora.iucn_status.least_concern +
        data.fauna.iucn_status.least_concern,
      flora: data.flora.iucn_status.least_concern,
      fauna: data.fauna.iucn_status.least_concern,
      color: iucnColors.LC,
    },
    {
      name: "Data Deficient",
      value:
        data.flora.iucn_status.data_deficient +
        data.fauna.iucn_status.data_deficient,
      flora: data.flora.iucn_status.data_deficient,
      fauna: data.fauna.iucn_status.data_deficient,
      color: iucnColors.DD,
    },
    {
      name: "Not Evaluated",
      value:
        data.flora.iucn_status.not_evaluated +
        data.fauna.iucn_status.not_evaluated,
      flora: data.flora.iucn_status.not_evaluated,
      fauna: data.fauna.iucn_status.not_evaluated,
      color: iucnColors.NE,
    },
  ];

  // Prepare comparison data
  const comparisonData = [
    { name: "Total", flora: data.flora.total, fauna: data.fauna.total },
    { name: "Endemic", flora: data.flora.endemic, fauna: data.fauna.endemic },
    {
      name: "Approved",
      flora: data.flora.approved,
      fauna: data.fauna.approved,
    },
    { name: "Pending", flora: data.flora.pending, fauna: data.fauna.pending },
  ];

  // Group timeline data by period
  const timelineData = data.timeline.reduce((acc: any, item: any) => {
    const existing = acc.find((x: any) => x.period === item.period);
    if (existing) {
      existing[item.kingdom] = item.species_count;
      existing.total = (existing.total || 0) + item.species_count;
    } else {
      acc.push({
        period: item.period,
        [item.kingdom]: item.species_count,
        total: item.species_count,
      });
    }
    return acc;
  }, []);

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={timelineData}>
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
            <Bar dataKey="flora" name="Flora" fill={colors.primary} />
            <Bar dataKey="fauna" name="Fauna" fill={colors.secondary} />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={timelineData}>
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
            <Area
              type="monotone"
              dataKey="flora"
              stackId="1"
              stroke={colors.primary}
              fill={colors.primary}
              name="Flora"
            />
            <Area
              type="monotone"
              dataKey="fauna"
              stackId="1"
              stroke={colors.secondary}
              fill={colors.secondary}
              name="Fauna"
            />
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={iucnData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {iucnData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return (
          <LineChart data={timelineData}>
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
            <Line
              type="monotone"
              dataKey="flora"
              stroke={colors.primary}
              strokeWidth={2}
              name="Flora"
            />
            <Line
              type="monotone"
              dataKey="fauna"
              stroke={colors.secondary}
              strokeWidth={2}
              name="Fauna"
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Species</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.total_species}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.total_endemic} endemic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flora</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.flora.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.flora.endemic} endemic species
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fauna</CardTitle>
            <Bird className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.fauna.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.fauna.endemic} endemic species
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
              {data.summary.total_species > 0
                ? (
                    (data.summary.total_approved / data.summary.total_species) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.total_approved} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Discovery Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Species Discovery Timeline</CardTitle>
            <CardDescription>New species discovered over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {renderChart()}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* IUCN Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>IUCN Status Distribution</CardTitle>
            <CardDescription>
              Conservation status of recorded species
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={iucnData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {iucnData.map((entry, index) => (
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

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flora vs Fauna Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Flora vs Fauna Comparison</CardTitle>
            <CardDescription>Species distribution comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
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
            <CardDescription>
              Endemic species distribution and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Flora Endemic</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      data.flora.total > 0
                        ? (data.flora.endemic / data.flora.total) * 100
                        : 0
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    {data.flora.endemic}/{data.flora.total}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fauna Endemic</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      data.fauna.total > 0
                        ? (data.fauna.endemic / data.fauna.total) * 100
                        : 0
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    {data.fauna.endemic}/{data.fauna.total}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IUCN Status Details */}
      <Card>
        <CardHeader>
          <CardTitle>IUCN Status Details</CardTitle>
          <CardDescription>
            Detailed breakdown of conservation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {iucnData.map((status, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{status.name}</h4>
                  <Badge
                    style={{ backgroundColor: status.color, color: "white" }}
                  >
                    {status.value}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Flora:</span>
                    <span>{status.flora}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fauna:</span>
                    <span>{status.fauna}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiodiversityCharts;
