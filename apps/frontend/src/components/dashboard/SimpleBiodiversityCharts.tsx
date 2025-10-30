"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SimpleBiodiversityChartsProps {
  data: any;
}

const SimpleBiodiversityCharts: React.FC<SimpleBiodiversityChartsProps> = ({
  data,
}) => {
  if (!data?.analytics?.biodiversity) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Species Overview</CardTitle>
            <CardDescription>Flora and Fauna Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const biodiversity = data.analytics.biodiversity;

  // Prepare chart data
  const speciesData = [
    {
      name: "Flora",
      total: biodiversity.flora?.total || 0,
      endemic: biodiversity.flora?.endemic || 0,
    },
    {
      name: "Fauna",
      total: biodiversity.fauna?.total || 0,
      endemic: biodiversity.fauna?.endemic || 0,
    },
  ];

  const endemicData = [
    {
      name: "Endemic",
      value: biodiversity.summary?.total_endemic || 0,
      color: "#10b981",
    },
    {
      name: "Non-Endemic",
      value:
        (biodiversity.summary?.total_species || 0) -
        (biodiversity.summary?.total_endemic || 0),
      color: "#6b7280",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Species Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Species Distribution</CardTitle>
          <CardDescription>Flora vs Fauna Comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speciesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" name="Total Species" />
                <Bar dataKey="endemic" fill="#059669" name="Endemic Species" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Endemic Species Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Endemic Species</CardTitle>
          <CardDescription>Endemic vs Non-Endemic Distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={endemicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {endemicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Biodiversity Summary</CardTitle>
          <CardDescription>Key Statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {biodiversity.summary?.total_species || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Species</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {biodiversity.summary?.total_endemic || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Endemic Species
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {biodiversity.summary?.total_approved || 0}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(
                  ((biodiversity.summary?.total_endemic || 0) /
                    Math.max(biodiversity.summary?.total_species || 1, 1)) *
                  100
                ).toFixed(1)}
                %
              </div>
              <div className="text-sm text-muted-foreground">Endemic Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleBiodiversityCharts;
