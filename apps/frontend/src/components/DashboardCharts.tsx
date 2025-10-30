import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { DashboardStats } from "../lib/api-client";

interface DashboardChartsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function DashboardCharts({
  stats,
  loading = false,
}: DashboardChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Data</CardTitle>
            <CardDescription>Pie chart loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trend Data</CardTitle>
            <CardDescription>Bar chart loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalData =
    stats.total_flora + stats.total_fauna + (stats.total_taman || 0);
  const floraPercentage =
    totalData > 0 ? Math.round((stats.total_flora / totalData) * 100) : 0;
  const faunaPercentage =
    totalData > 0 ? Math.round((stats.total_fauna / totalData) * 100) : 0;
  const tamanPercentage =
    totalData > 0
      ? Math.round(((stats.total_taman || 0) / totalData) * 100)
      : 0;

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {/* Pie Chart - Data Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Data</CardTitle>
          <CardDescription>
            Persentase data berdasarkan kategori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Flora</span>
              </div>
              <span className="text-sm font-medium">{floraPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm">Fauna</span>
              </div>
              <span className="text-sm font-medium">{faunaPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-sm">Taman</span>
              </div>
              <span className="text-sm font-medium">{tamanPercentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Data</CardTitle>
          <CardDescription>Total data per kategori</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Flora</span>
                <span>{stats.total_flora}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((stats.total_flora / Math.max(totalData, 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fauna</span>
                <span>{stats.total_fauna}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((stats.total_fauna / Math.max(totalData, 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taman</span>
                <span>{stats.total_taman}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(((stats.total_taman || 0) / Math.max(totalData, 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
