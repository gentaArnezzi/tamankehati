"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Calendar,
  Eye,
  Pin,
  Star,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  FileText,
} from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PublicAnnouncementDetail } from "./PublicAnnouncementDetail";

// Types
export interface PublicAnnouncement {
  id: number;
  title: string;
  content: string;
  summary?: string;
  type: "news" | "announcement" | "event" | "maintenance";
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

interface PublicAnnouncementListResponse {
  items: PublicAnnouncement[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

const ANNOUNCEMENT_TYPES = [
  { value: "news", label: "Berita" },
  { value: "announcement", label: "Pengumuman" },
  { value: "event", label: "Acara" },
  { value: "maintenance", label: "Pemeliharaan" },
];

interface PublicAnnouncementsProps {
  showFilters?: boolean;
  limit?: number;
  featuredOnly?: boolean;
  pinnedOnly?: boolean;
  typeFilter?: string;
}

export function PublicAnnouncements({
  showFilters = true,
  limit = 10,
  featuredOnly = false,
  pinnedOnly = false,
  typeFilter,
}: PublicAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(limit);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>(
    typeFilter || "all",
  );
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(featuredOnly);
  const [showPinnedOnly, setShowPinnedOnly] = useState(pinnedOnly);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<PublicAnnouncement | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      });

      if (searchQuery) {
        params.append("q", searchQuery);
      }
      if (selectedTypeFilter !== "all") {
        params.append("type_filter", selectedTypeFilter);
      }
      if (showFeaturedOnly) {
        params.append("featured_only", "true");
      }
      if (showPinnedOnly) {
        params.append("pinned_only", "true");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/v1/announcements/public?${params}`,
      );

      if (!response.ok) {
        throw new Error("Gagal memuat pengumuman");
      }

      const data: PublicAnnouncementListResponse = await response.json();
      setAnnouncements(data.items);
      setTotalItems(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pengumuman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    currentPage,
    searchQuery,
    selectedTypeFilter,
    showFeaturedOnly,
    showPinnedOnly,
    itemsPerPage,
  ]);

  const handleView = (announcement: PublicAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setDetailOpen(true);
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
    });
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && announcements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Pencarian
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari pengumuman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipe</label>
                <Select
                  value={selectedTypeFilter}
                  onValueChange={setSelectedTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua tipe</SelectItem>
                    {ANNOUNCEMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Filter</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showPinnedOnly}
                      onChange={(e) => setShowPinnedOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Pinned</span>
                  </label>
                </div>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={loadData} className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Announcements List */}
      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card
            key={announcement.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent
              className="p-6"
              onClick={() => handleView(announcement)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    {announcement.is_pinned && (
                      <Pin className="h-4 w-4 text-blue-600" />
                    )}
                    {announcement.is_featured && (
                      <Star className="h-4 w-4 text-yellow-600" />
                    )}
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {announcement.title}
                    </h3>
                  </div>

                  {announcement.summary && (
                    <p className="text-muted-foreground line-clamp-2">
                      {announcement.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {getTypeBadge(announcement.type)}
                    {getPriorityBadge(announcement.priority)}
                    {announcement.tags && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {announcement.tags.split(",").length} tag
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {announcement.published_at
                          ? formatDate(announcement.published_at)
                          : formatDate(announcement.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{announcement.view_count} views</span>
                    </div>
                    {announcement.expires_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Kedaluwarsa: {formatDate(announcement.expires_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {announcement.featured_image && (
                  <div className="ml-4">
                    <img
                      src={announcement.featured_image}
                      alt={announcement.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && announcements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Tidak ada pengumuman</h3>
              <p>Belum ada pengumuman yang tersedia saat ini.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <PublicAnnouncementDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}
