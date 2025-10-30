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
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  Shield,
  MapPin,
  TreePine,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ConservationData {
  parks: {
    total: number;
    total_area_ha: number;
    avg_area_ha: number;
    max_area_ha: number;
    min_area_ha: number;
  };
  conservation_status: Array<{
    status: string;
    count: number;
    total_area_ha: number;
  }>;
}

interface ConservationChartsProps {
  data: ConservationData;
  chartType?: "bar" | "pie" | "area" | "line";
}

const ConservationCharts: React.FC<ConservationChartsProps> = ({
  data,
  chartType = "bar",
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

  const statusColors = {
    approved: "#10b981",
    published: "#10b981",
    draft: "#6b7280",
    in_review: "#f59e0b",
    rejected: "#ef4444",
    archived: "#9ca3af",
  };

  // Prepare data for charts
  const statusData = data.conservation_status.map((status) => ({
    ...status,
    color:
      statusColors[status.status as keyof typeof statusColors] ||
      colors.primary,
  }));

  const areaData = data.conservation_status.map((status) => ({
    status: status.status,
    area_ha: status.total_area_ha,
    count: status.count,
  }));

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return (
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, count }) => `${status}: ${count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case "area":
        return (
          <AreaChart data={areaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="area_ha"
              stroke={colors.primary}
              fill={colors.primary}
              name="Area (ha)"
            />
          </AreaChart>
        );
      case "line":
        return (
          <LineChart data={areaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="area_ha"
              stroke={colors.primary}
              strokeWidth={2}
              name="Area (ha)"
            />
          </LineChart>
        );
      default:
        return (
          <BarChart data={areaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Park Count" fill={colors.primary} />
            <Bar dataKey="area_ha" name="Area (ha)" fill={colors.secondary} />
          </BarChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.parks.total}</div>
            <p className="text-xs text-muted-foreground">Protected areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.parks.total_area_ha.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Hectares protected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Area</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.parks.avg_area_ha.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Hectares per park</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Park</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.parks.max_area_ha.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Hectares</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conservation Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Conservation Status Distribution</CardTitle>
            <CardDescription>Park status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {renderChart()}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Area vs Count Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Area vs Count Analysis</CardTitle>
            <CardDescription>
              Relationship between park count and total area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Park Count"
                  fill={colors.primary}
                />
                <Bar
                  yAxisId="right"
                  dataKey="area_ha"
                  name="Area (ha)"
                  fill={colors.secondary}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Status Breakdown</CardTitle>
          <CardDescription>
            Comprehensive conservation status analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.conservation_status.map((status, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor:
                          statusColors[
                            status.status as keyof typeof statusColors
                          ] || colors.primary,
                        color: "white",
                      }}
                    >
                      {status.status}
                    </Badge>
                    <span className="font-medium">{status.count} parks</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {status.total_area_ha.toLocaleString()} ha
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.parks.total_area_ha > 0
                        ? (
                            (status.total_area_ha / data.parks.total_area_ha) *
                            100
                          ).toFixed(1)
                        : 0}
                      % of total area
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    data.parks.total_area_ha > 0
                      ? (status.total_area_ha / data.parks.total_area_ha) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Area Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Area Statistics</CardTitle>
            <CardDescription>Detailed area analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Total Protected Area
                </span>
                <span className="text-lg font-bold">
                  {data.parks.total_area_ha.toLocaleString()} ha
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Park Size</span>
                <span className="text-lg font-bold">
                  {data.parks.avg_area_ha.toFixed(2)} ha
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Largest Park</span>
                <span className="text-lg font-bold">
                  {data.parks.max_area_ha.toLocaleString()} ha
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Smallest Park</span>
                <span className="text-lg font-bold">
                  {data.parks.min_area_ha.toLocaleString()} ha
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conservation Efficiency</CardTitle>
            <CardDescription>
              Conservation effectiveness metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Approved Parks</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {data.conservation_status.find(
                      (s) => s.status === "approved",
                    )?.count || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (
                    {data.parks.total > 0
                      ? (
                          ((data.conservation_status.find(
                            (s) => s.status === "approved",
                          )?.count || 0) /
                            data.parks.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending Review</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {data.conservation_status.find(
                      (s) => s.status === "in_review",
                    )?.count || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (
                    {data.parks.total > 0
                      ? (
                          ((data.conservation_status.find(
                            (s) => s.status === "in_review",
                          )?.count || 0) /
                            data.parks.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Draft Status</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {data.conservation_status.find((s) => s.status === "draft")
                      ?.count || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (
                    {data.parks.total > 0
                      ? (
                          ((data.conservation_status.find(
                            (s) => s.status === "draft",
                          )?.count || 0) /
                            data.parks.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConservationCharts;
