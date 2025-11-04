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
import { Badge } from "../ui/badge";
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
} from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  published_at?: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800 border-gray-300",
  medium: "bg-blue-100 text-blue-800 border-blue-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  urgent: "bg-red-100 text-red-800 border-red-300",
};

const priorityIcons = {
  low: Info,
  medium: AlertCircle,
  high: AlertCircle,
  urgent: AlertCircle,
};

const priorityLabels = {
  low: "Rendah",
  medium: "Sedang",
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
          let priority: Announcement["priority"] = "medium";

          // Handle both string and number priority from API
          if (item.priority !== null && item.priority !== undefined) {
            if (typeof item.priority === "string") {
              const normalizedPriority = item.priority.toLowerCase();
              if (
                ["low", "medium", "high", "urgent"].includes(normalizedPriority)
              ) {
                priority = normalizedPriority as Announcement["priority"];
              }
            } else if (typeof item.priority === "number") {
              // Map number to string: 0=low, 1=medium, 2=high, 3=urgent
              const priorityMap: { [key: number]: Announcement["priority"] } = {
                0: "low",
                1: "medium",
                2: "high",
                3: "urgent",
              };
              priority = priorityMap[item.priority] || "medium";
            }
          }

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            priority: priority,
            status: item.status || "published",
            created_at: item.created_at,
            updated_at: item.updated_at,
            published_at: item.published_at,
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

  const PriorityBadge = ({
    priority,
  }: {
    priority: Announcement["priority"];
  }) => {
    const Icon = priorityIcons[priority] || Info; // Fallback to Info icon
    const color = priorityColors[priority] || priorityColors.medium;
    const label = priorityLabels[priority] || "Sedang";

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
                  : ""
              }`}
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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
                      <span className="truncate">{announcement.title}</span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
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
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="p-4 sm:p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <PriorityBadge priority={selectedAnnouncement.priority} />
                    <Badge variant="secondary">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Dipublikasikan
                    </Badge>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl break-words">
                    {selectedAnnouncement.title}
                  </CardTitle>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
                  aria-label="Close"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              {/* Full Content */}
              <div
                className="prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtmlRich(selectedAnnouncement.content),
                }}
              />

              {/* Metadata */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 pt-4 border-t">
                {selectedAnnouncement.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Oleh: {selectedAnnouncement.author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>
                    Dipublikasikan:{" "}
                    {formatDate(
                      selectedAnnouncement.published_at ||
                        selectedAnnouncement.created_at,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>
                    Diperbarui: {formatDate(selectedAnnouncement.updated_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
