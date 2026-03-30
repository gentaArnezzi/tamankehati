"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import {
  Calendar,
  Eye,
  Pin,
  Star,
  Tag,
  Clock,
  FileText,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface AnnouncementDetail {
  id: number;
  title: string;
  content: string;
  summary?: string;
  announcement_type: string;
  priority: number;
  is_featured: boolean;
  is_pinned: boolean;
  featured_image?: string;
  tags?: string;
  published_at?: string;
  expires_at?: string;
  view_count: number;
  created_at: string;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      loadAnnouncementDetail();
    }
  }, [params.id]);

  const loadAnnouncementDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/announcements/public/${params.id}`,
      );

      if (!response.ok) {
        throw new Error("Pengumuman tidak ditemukan");
      }

      const data = await response.json();
      setAnnouncement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pengumuman");
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800",
      system: "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      security: "bg-red-100 text-red-800",
      policy: "bg-purple-100 text-purple-800",
    };

    const labels = {
      general: "Umum",
      system: "Sistem",
      maintenance: "Pemeliharaan",
      security: "Keamanan",
      policy: "Kebijakan",
    };

    return (
      <Badge
        className={
          colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      0: "bg-gray-100 text-gray-800",
      1: "bg-yellow-100 text-yellow-800",
      2: "bg-red-100 text-red-800",
    };

    const labels = {
      0: "Normal",
      1: "Tinggi",
      2: "Mendesak",
    };

    return (
      <Badge
        className={
          colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {labels[priority as keyof typeof labels] || "Normal"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>Pengumuman tidak ditemukan</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/announcements">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Pengumuman
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {announcement.is_pinned && (
              <Pin className="h-4 w-4 text-blue-600" />
            )}
            {announcement.is_featured && (
              <Star className="h-4 w-4 text-yellow-600" />
            )}
            {getTypeBadge(announcement.announcement_type)}
            {getPriorityBadge(announcement.priority)}
          </div>

          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            {announcement.title}
          </h1>

          {announcement.summary && (
            <p className="text-xl text-muted-foreground mb-6">
              {announcement.summary}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {announcement.published_at
                  ? formatDate(announcement.published_at)
                  : formatDate(announcement.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{announcement.view_count} views</span>
            </div>
            {announcement.expires_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Kedaluwarsa: {formatDate(announcement.expires_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {announcement.featured_image && (
          <div className="mb-8">
            <img
              src={announcement.featured_image}
              alt={announcement.title}
              className="w-full h-auto rounded-lg shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{announcement.content}</div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {announcement.tags && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {announcement.tags.split(",").map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
