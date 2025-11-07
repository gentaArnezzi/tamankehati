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
  User,
  Eye,
  Clock,
  Tag,
  Pin,
  Star,
  FileText,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { Announcement } from "./AnnouncementsPage";
import { sanitizeHtmlRich } from "../../utils/sanitizeHtml";
import { imageUrl } from "../../lib/api-url";

interface AnnouncementDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}

export function AnnouncementDetail({
  open,
  onOpenChange,
  announcement,
}: AnnouncementDetailProps) {
  if (!announcement) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    } as const;

    const labels = {
      draft: "Draft",
      published: "Dipublikasi",
      archived: "Diarsipkan",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

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

  const parseAttachments = (attachments?: string) => {
    if (!attachments) return [];
    try {
      return JSON.parse(attachments);
    } catch {
      return [];
    }
  };

  const attachments = parseAttachments(announcement.attachments);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                {announcement.is_pinned && (
                  <Pin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                )}
                {announcement.is_featured && (
                  <Star className="h-5 w-5 text-yellow-600 flex-shrink-0 fill-yellow-600" />
                )}
                <DialogTitle className="text-2xl font-bold leading-tight text-gray-900">
                  {announcement.title}
                </DialogTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {getTypeBadge(announcement.type)}
                {getStatusBadge(announcement.status)}
                {getPriorityBadge(announcement.priority)}
              </div>
              {/* Timestamps - Only show if date exists */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {announcement.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Dipublikasi: {formatDate(announcement.published_at)}</span>
                  </div>
                )}
                {announcement.created_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Dibuat: {formatDate(announcement.created_at)}</span>
                  </div>
                )}
                {announcement.updated_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Diperbarui: {formatDate(announcement.updated_at)}</span>
                  </div>
                )}
                {announcement.deleted_at && (
                  <div className="flex items-center gap-2 text-red-600">
                    <Clock className="h-4 w-4" />
                    <span>Dihapus: {formatDate(announcement.deleted_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Featured Image - Full width without padding */}
        {announcement.featured_image && (
          <div className="w-full overflow-hidden bg-gray-100">
            <img
              src={imageUrl(announcement.featured_image)}
              alt={announcement.title}
              className="w-full h-auto object-cover max-h-[500px] block"
              style={{ 
                display: 'block', 
                width: '100%', 
                maxWidth: '100%',
                margin: '0 auto'
              }}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.style.display = "none";
                }
              }}
            />
          </div>
        )}

        <div className="px-6 py-6 space-y-6">
          {/* Summary */}
          {announcement.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-blue-900">Ringkasan</h3>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{announcement.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700 prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-img:rounded-lg prose-img:shadow-md">
            <div
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlRich(announcement.content) }}
            />
          </div>

          {/* Tags */}
          {announcement.tags && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {announcement.tags.split(",").map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-gray-900">Lampiran</h3>
                <Badge variant="secondary" className="text-xs">
                  {attachments.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {attachments.map((attachment: string, index: number) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 hover:underline break-all p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <Paperclip className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate flex-1">{attachment}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Info */}
          {(announcement.submitted_at ||
            announcement.approved_at ||
            announcement.rejected_at) && (
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Workflow
              </h3>
              {announcement.submitted_at && (
                <div className="flex items-center gap-3 text-sm p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Diajukan:</span>
                    <span className="text-gray-700 ml-2">{formatDate(announcement.submitted_at)}</span>
                    {announcement.submitted_by && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        (oleh user ID: {announcement.submitted_by})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {announcement.approved_at && (
                <div className="flex items-center gap-3 text-sm p-3 bg-green-50 rounded-lg border border-green-200">
                  <Calendar className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Disetujui:</span>
                    <span className="text-gray-700 ml-2">{formatDate(announcement.approved_at)}</span>
                    {announcement.approved_by && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        (oleh user ID: {announcement.approved_by})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {announcement.rejected_at && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
                    <Clock className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Ditolak:</span>
                      <span className="text-gray-700 ml-2">{formatDate(announcement.rejected_at)}</span>
                      {announcement.rejected_by && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          (oleh user ID: {announcement.rejected_by})
                        </span>
                      )}
                    </div>
                  </div>
                  {announcement.rejection_reason && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-sm shadow-sm">
                      <strong className="text-red-900 block mb-2">Alasan Penolakan:</strong>
                      <p className="text-red-800 leading-relaxed">{announcement.rejection_reason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
