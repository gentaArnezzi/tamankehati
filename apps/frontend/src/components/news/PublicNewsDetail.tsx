"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Calendar,
  Eye,
  Pin,
  Star,
  Tag,
  Clock,
  FileText,
  Image as ImageIcon,
  Paperclip,
  BookOpen,
} from "lucide-react";
import { PublicNews } from "./PublicNews";

interface PublicNewsDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  news: PublicNews | null;
}

export function PublicNewsDetail({
  open,
  onOpenChange,
  news,
}: PublicNewsDetailProps) {
  if (!news) return null;

  const getCategoryBadge = (category: string) => {
    const colors = {
      biodiversity: "bg-green-100 text-green-800",
      conservation: "bg-blue-100 text-blue-800",
      research: "bg-purple-100 text-purple-800",
      education: "bg-yellow-100 text-yellow-800",
      events: "bg-pink-100 text-pink-800",
      general: "bg-gray-100 text-gray-800",
    };

    const labels = {
      biodiversity: "Keanekaragaman Hayati",
      conservation: "Konservasi",
      research: "Penelitian",
      education: "Pendidikan",
      events: "Acara",
      general: "Umum",
    };

    return (
      <Badge
        className={
          colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {labels[category as keyof typeof labels] || category}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {news.is_pinned && <Pin className="h-5 w-5 text-blue-600" />}
            {news.is_featured && <Star className="h-5 w-5 text-yellow-600" />}
            {news.title}
          </DialogTitle>
          <DialogDescription>
            Detail berita dan informasi terkait
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                {getCategoryBadge(news.category)}
                {getPriorityBadge(news.priority)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{news.view_count} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Dibuat: {formatDate(news.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{news.reading_time} menit baca</span>
                </div>
                {news.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Dipublikasi: {formatDate(news.published_at)}</span>
                  </div>
                )}
                {news.expires_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Kedaluwarsa: {formatDate(news.expires_at)}</span>
                  </div>
                )}
                {news.slug && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Slug: {news.slug}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {news.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{news.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Konten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{news.content}</div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          {news.featured_image && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Gambar Utama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={news.featured_image}
                    alt="Featured image"
                    className="max-w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {news.tags && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {news.tags.split(",").map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
