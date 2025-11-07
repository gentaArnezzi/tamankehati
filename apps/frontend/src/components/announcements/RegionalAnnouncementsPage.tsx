"use client";

import { useState, useEffect } from "react";
import { sanitizeHtmlRich } from "../../utils/sanitizeHtml";
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
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import {
  Megaphone,
  Search,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  FileText,
  Tag,
  Paperclip,
  Pin,
  Star,
} from "lucide-react";
import { imageUrl } from "../../lib/api-url";

interface Announcement {
  id: number;
  title: string;
  content: string;
  summary?: string;
  priority: "normal" | "high" | "urgent";
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  published_at?: string;
  featured_image?: string;
  tags?: string;
  attachments?: string;
  user_has_read?: boolean;
  read_count?: number;
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

const priorityColors = {
  normal: "bg-gray-100 text-gray-800 border-gray-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  urgent: "bg-red-100 text-red-800 border-red-300",
};

const priorityIcons = {
  normal: Info,
  high: AlertCircle,
  urgent: AlertCircle,
};

const priorityLabels = {
  normal: "Normal",
  high: "Tinggi",
  urgent: "Mendesak",
};

export function RegionalAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [viewingAnnouncementId, setViewingAnnouncementId] = useState<number | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      // Fetch announcements from API
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/announcements/?status_filter=published&limit=100`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await response.json();

      // Map API response to component format
      const mappedAnnouncements: Announcement[] = (data.items || []).map(
        (item: any) => {
          // Normalize priority to match our types
          // Backend uses: 0=normal, 1=high, 2=urgent
          let priority: Announcement["priority"] = "normal";

          // Handle both string and number priority from API
          if (item.priority !== null && item.priority !== undefined) {
            if (typeof item.priority === "string") {
              const normalizedPriority = item.priority.toLowerCase();
              if (
                ["normal", "high", "urgent"].includes(normalizedPriority)
              ) {
                priority = normalizedPriority as Announcement["priority"];
              }
            } else if (typeof item.priority === "number") {
              // Map number to string: 0=normal, 1=high, 2=urgent (sesuai dengan backend)
              const priorityMap: { [key: number]: Announcement["priority"] } = {
                0: "normal",
                1: "high",
                2: "urgent",
              };
              priority = priorityMap[item.priority] || "normal";
            }
          }

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            summary: item.summary,
            priority: priority,
            status: item.status || "published",
            created_at: item.created_at,
            updated_at: item.updated_at,
            published_at: item.published_at,
            featured_image: item.featured_image,
            tags: item.tags,
            attachments: item.attachments,
            user_has_read: item.user_has_read ?? false,
            read_count: item.read_count ?? 0,
            author: item.author
              ? {
                  id: item.author.id,
                  name: item.author.display_name || item.author.email,
                  email: item.author.email,
                }
              : undefined,
          };
        },
      );

      setAnnouncements(mappedAnnouncements);
      setError(null);
    } catch (err) {
      setError("Gagal memuat pengumuman");
      console.error("Error loading announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(
    (ann) =>
      ann.status === "published" &&
      (ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const markAsRead = async (announcementId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/announcements/${announcementId}/mark-read`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        // Update read status locally immediately for better UX
        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann.id === announcementId
              ? { ...ann, user_has_read: true, read_count: (ann.read_count || 0) + 1 }
              : ann
          )
        );
        
        // Also refresh from server to ensure consistency after a short delay
        // This ensures the database commit is complete
        setTimeout(async () => {
          await loadAnnouncements();
        }, 300);
      }
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

  const PriorityBadge = ({
    priority,
  }: {
    priority: Announcement["priority"];
  }) => {
    const Icon = priorityIcons[priority] || Info; // Fallback to Info icon
    const color = priorityColors[priority] || priorityColors.normal;
    const label = priorityLabels[priority] || "Normal";

    return (
      <Badge variant="outline" className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            Pengumuman
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Pengumuman dari Super Admin</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="Cari pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Announcements List */}
      {!loading && filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Tidak ada pengumuman</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Coba kata kunci lain"
                  : "Belum ada pengumuman yang dipublikasikan"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading &&
        filteredAnnouncements.map((announcement) => {
          const PriorityIcon = priorityIcons[announcement.priority];

          return (
            <Card
              key={announcement.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                announcement.priority === "urgent"
                  ? "border-red-300 border-2"
                  : announcement.user_has_read === false
                  ? "border-blue-400 border-l-4 bg-blue-50/30"
                  : ""
              }`}
              onClick={async () => {
                setSelectedAnnouncement(announcement);
                // Mark as read when viewing
                if (announcement.id && !announcement.user_has_read) {
                  await markAsRead(announcement.id);
                }
              }}
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {announcement.user_has_read === false && (
                        <Badge className="bg-blue-600 text-white border-blue-700">
                          <Info className="w-3 h-3 mr-1" />
                          Belum Dibaca
                        </Badge>
                      )}
                      <PriorityBadge priority={announcement.priority} />
                      <Badge variant="secondary">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Dipublikasikan
                      </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl flex items-start gap-2">
                      {announcement.priority === "urgent" && (
                        <PriorityIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      {announcement.user_has_read === false && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2 animate-pulse" />
                      )}
                      <span className={`truncate ${announcement.user_has_read === false ? "font-semibold" : ""}`}>
                        {announcement.title}
                      </span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                {/* Summary */}
                {announcement.summary && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      <h3 className="text-sm sm:text-base font-semibold text-blue-900">Ringkasan</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                      {announcement.summary}
                    </p>
                  </div>
                )}

                {/* Content Preview */}
                <div
                  className="text-sm sm:text-base text-gray-700 line-clamp-3 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlRich(announcement.content) }}
                />

                {/* Metadata */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 pt-2 border-t">
                  {announcement.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{announcement.author.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>
                      {formatDate(
                        announcement.published_at || announcement.created_at,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedAnnouncement}
        onOpenChange={(open) => {
          if (!open) setSelectedAnnouncement(null);
        }}
      >
        {selectedAnnouncement && (
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white p-0 gap-0">
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <DialogTitle className="text-2xl font-bold leading-tight text-gray-900">
                      {selectedAnnouncement.title}
                    </DialogTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <PriorityBadge priority={selectedAnnouncement.priority} />
                    <Badge variant="secondary">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Dipublikasikan
                    </Badge>
                  </div>
                  {/* Timestamps */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {selectedAnnouncement.published_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Dipublikasi: {formatDate(selectedAnnouncement.published_at)}
                        </span>
                      </div>
                    )}
                    {selectedAnnouncement.author && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedAnnouncement.author.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Featured Image - Full width without padding */}
            {selectedAnnouncement.featured_image && (
              <div 
                className="w-full overflow-hidden bg-gray-100"
                style={{
                  width: '100%',
                  marginLeft: 0,
                  marginRight: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
              >
                <img
                  src={imageUrl(selectedAnnouncement.featured_image)}
                  alt={selectedAnnouncement.title}
                  className="w-full h-auto object-cover max-h-[500px]"
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "100%",
                    margin: 0,
                    padding: 0,
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
              {selectedAnnouncement.summary && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-semibold text-blue-900">Ringkasan</h3>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {selectedAnnouncement.summary}
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700 prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-img:rounded-lg prose-img:shadow-md">
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlRich(selectedAnnouncement.content),
                  }}
                />
              </div>

              {/* Tags */}
              {selectedAnnouncement.tags && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnnouncement.tags.split(",").map((tag, index) => (
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
              {selectedAnnouncement.attachments && (() => {
                try {
                  const attachments = JSON.parse(selectedAnnouncement.attachments);
                  if (Array.isArray(attachments) && attachments.length > 0) {
                    return (
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
                    );
                  }
                } catch (e) {
                  // Invalid JSON, skip attachments
                }
                return null;
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedAnnouncement(null)}>
                Tutup
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
