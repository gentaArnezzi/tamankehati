"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Eye,
  MessageSquare,
  Heart,
  CheckCircle,
  TrendingUp,
  Download,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface AnalyticsData {
  total_announcements: number;
  published_announcements: number;
  total_reads: number;
  total_acknowledgments: number;
  total_comments: number;
  total_reactions: number;
  acknowledgment_rate: number;
  engagement_rate: number;
}

interface AnnouncementAnalytics {
  announcement_id: number;
  title: string;
  view_count: number;
  read_count: number;
  acknowledged_count: number;
  comment_count: number;
  reaction_count: number;
  acknowledgment_rate: number;
  engagement_rate: number;
  reads_by_region: Record<string, number>;
  reads_by_date: Record<string, number>;
}

interface EnhancedAnnouncementAnalyticsProps {
  onBack: () => void;
}

export default function EnhancedAnnouncementAnalytics({
  onBack,
}: EnhancedAnnouncementAnalyticsProps) {
  const [overviewData, setOverviewData] = useState<AnalyticsData | null>(null);
  const [announcementAnalytics, setAnnouncementAnalytics] = useState<
    AnnouncementAnalytics[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<
    number | null
  >(null);

  // Fetch overview analytics
  const fetchOverviewAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/v1/enhanced/analytics/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOverviewData(data);
      }
    } catch (error) {
      console.error("Error fetching overview analytics:", error);
    }
  };

  // Fetch announcement-specific analytics
  const fetchAnnouncementAnalytics = async (announcementId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/v1/enhanced/announcements/${announcementId}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAnnouncementAnalytics((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Error fetching announcement analytics:", error);
    }
  };

  // Export analytics data
  const exportAnalytics = () => {
    if (!overviewData) return;

    const data = {
      overview: overviewData,
      announcements: announcementAnalytics,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `announcement-analytics-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchOverviewAnalytics();
      setLoading(false);
    };

    loadData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "text-blue-600",
    bgColor = "bg-blue-50",
  }: {
    title: string;
    value: number | string;
    icon: any;
    color?: string;
    bgColor?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Insights dan metrik pengumuman</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            ← Kembali
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pengumuman"
            value={overviewData.total_announcements}
            icon={MessageSquare}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Published"
            value={overviewData.published_announcements}
            icon={Eye}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Total Reads"
            value={overviewData.total_reads}
            icon={Users}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            title="Total Comments"
            value={overviewData.total_comments}
            icon={MessageSquare}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>
      )}

      {/* Engagement Metrics */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Acknowledgment Rate
              </CardTitle>
              <CardDescription>
                Persentase pengumuman yang di-acknowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {(overviewData.acknowledgment_rate * 100).toFixed(1)}%
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {overviewData.total_acknowledgments} dari{" "}
                {overviewData.total_reads} reads
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Engagement Rate
              </CardTitle>
              <CardDescription>
                Tingkat engagement (comments + reactions)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {(overviewData.engagement_rate * 100).toFixed(1)}%
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {overviewData.total_comments + overviewData.total_reactions}{" "}
                total interactions
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>Analytics per pengumuman</CardDescription>
        </CardHeader>
        <CardContent>
          {announcementAnalytics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Pilih pengumuman untuk melihat analytics detail
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  // This would typically open a modal or navigate to announcement selection
                  console.log("Open announcement selection");
                }}
              >
                Pilih Pengumuman
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcementAnalytics.map((analytics) => (
                <div
                  key={analytics.announcement_id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{analytics.title}</h3>
                    <Badge variant="outline">
                      ID: {analytics.announcement_id}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.view_count}
                      </div>
                      <div className="text-sm text-gray-600">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.read_count}
                      </div>
                      <div className="text-sm text-gray-600">Reads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.acknowledged_count}
                      </div>
                      <div className="text-sm text-gray-600">Acknowledged</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.comment_count + analytics.reaction_count}
                      </div>
                      <div className="text-sm text-gray-600">Engagements</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Acknowledgment Rate
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${analytics.acknowledgment_rate * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(analytics.acknowledgment_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Engagement Rate
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${analytics.engagement_rate * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(analytics.engagement_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {overviewData && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {overviewData.total_announcements}
                </div>
                <div className="text-sm text-gray-600">Total Pengumuman</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {overviewData.total_reads}
                </div>
                <div className="text-sm text-gray-600">Total Reads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {overviewData.total_comments + overviewData.total_reactions}
                </div>
                <div className="text-sm text-gray-600">Total Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
