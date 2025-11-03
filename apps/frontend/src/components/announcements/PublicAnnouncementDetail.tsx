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
} from "lucide-react";
import { PublicAnnouncement } from "./PublicAnnouncements";
import { sanitizeHtmlRich } from "../../utils/sanitizeHtml";

interface PublicAnnouncementDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: PublicAnnouncement | null;
}

export function PublicAnnouncementDetail({
  open,
  onOpenChange,
  announcement,
}: PublicAnnouncementDetailProps) {
  if (!announcement) return null;

  const getTypeBadge = (type: string) => {
    const colors = {
      news: "bg-blue-100 text-blue-800",
      announcement: "bg-green-100 text-green-800",
      event: "bg-purple-100 text-purple-800",
      maintenance: "bg-orange-100 text-orange-800",
    };

    const labels = {
      news: "Berita",
      announcement: "Pengumuman",
      event: "Acara",
      maintenance: "Pemeliharaan",
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {announcement.is_pinned && (
              <Pin className="h-5 w-5 text-blue-600" />
            )}
            {announcement.is_featured && (
              <Star className="h-5 w-5 text-yellow-600" />
            )}
            {announcement.title}
          </DialogTitle>
          <DialogDescription>
            Detail pengumuman dan informasi terkait
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                {getTypeBadge(announcement.type)}
                {getPriorityBadge(announcement.priority)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{announcement.view_count} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Dibuat: {formatDate(announcement.created_at)}</span>
                </div>
                {announcement.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Dipublikasi: {formatDate(announcement.published_at)}
                    </span>
                  </div>
                )}
                {announcement.expires_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Kedaluwarsa: {formatDate(announcement.expires_at)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {announcement.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{announcement.summary}</p>
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
              <div
                className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: sanitizeHtmlRich(announcement.content) }}
              />
            </CardContent>
          </Card>

          {/* Featured Image */}
          {announcement.featured_image && (
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
                    src={announcement.featured_image}
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
          {announcement.tags && (
            <Card>
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
