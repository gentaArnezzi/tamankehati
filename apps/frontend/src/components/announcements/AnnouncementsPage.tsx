"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Send,
  Archive,
  Star,
  Pin,
  Calendar,
  Tag,
  User,
  Clock,
} from "lucide-react";
import { AnnouncementForm } from "./AnnouncementForm";
import { AnnouncementDetail } from "./AnnouncementDetail";
import { toast } from "sonner";
import { imageUrl } from "../../lib/api-url";
import { FileText } from "lucide-react";

// Types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  summary?: string;
  type: "news" | "announcement" | "event" | "maintenance";
  status: "draft" | "published" | "archived";
  priority: number;
  is_featured: boolean;
  is_pinned: boolean;
  featured_image?: string;
  attachments?: string;
  tags?: string;
  expires_at?: string;
  author_id?: number;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejected_by?: number;
  rejected_at?: string;
  rejection_reason?: string;
}

interface AnnouncementListResponse {
  items: Announcement[];
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

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Dipublikasi" },
  { value: "archived", label: "Diarsipkan" },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "Normal" },
  { value: 1, label: "Tinggi" },
  { value: 2, label: "Mendesak" },
];

export function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const loadData = useCallback(async () => {
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
      if (typeFilter !== "all") {
        params.append("type_filter", typeFilter);
      }
      if (statusFilter !== "all") {
        params.append("status_filter", statusFilter);
      }
      if (featuredFilter !== null) {
        params.append("featured_only", featuredFilter.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/announcements/?${params}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data pengumuman");
      }

      const data: AnnouncementListResponse = await response.json();
      setAnnouncements(data.items);
      setTotalItems(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchQuery,
    typeFilter,
    statusFilter,
    featuredFilter,
    itemsPerPage,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    router.push("/dashboard/announcements/create");
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailOpen(true);
  };

  const handleSubmit = async (formData: Partial<Announcement>) => {
    try {
      if (formMode === "edit" && !formData.id) {
        toast.error("ID pengumuman tidak ditemukan");
        return;
      }

      const url =
        formMode === "create"
          ? `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/announcements/`
          : `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/announcements/${formData.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      // Prepare payload: only include fields that are expected by backend
      const payload: any = {};

      // Required fields
      if (formData.title !== undefined) payload.title = formData.title;
      if (formData.content !== undefined) payload.content = formData.content;
      if (formData.type !== undefined) payload.type = formData.type;
      if (formData.priority !== undefined) payload.priority = formData.priority;
      if (formData.is_featured !== undefined) payload.is_featured = formData.is_featured;
      if (formData.is_pinned !== undefined) payload.is_pinned = formData.is_pinned;

      // Optional fields - convert empty strings to null
      if (formData.expires_at !== undefined && formData.expires_at !== "") {
        payload.expires_at = formData.expires_at;
      } else if (formData.expires_at === "") {
        payload.expires_at = null;
      }
      
      if (formData.featured_image !== undefined && formData.featured_image !== "") {
        payload.featured_image = formData.featured_image;
      } else if (formData.featured_image === "") {
        payload.featured_image = null;
      }
      
      if (formData.summary !== undefined && formData.summary !== "") {
        payload.summary = formData.summary;
      } else if (formData.summary === "") {
        payload.summary = null;
      }
      
      if (formData.tags !== undefined && formData.tags !== "") {
        payload.tags = formData.tags;
      } else if (formData.tags === "") {
        payload.tags = null;
      }
      
      if (formData.attachments !== undefined && formData.attachments !== "") {
        payload.attachments = formData.attachments;
      } else if (formData.attachments === "") {
        payload.attachments = null;
      }

      // Status field (if provided)
      if (formData.status !== undefined) {
        payload.status = formData.status;
      }

      // Remove id from payload (it's in the URL for PUT)
      if (formMode === "edit") {
        delete payload.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);

        // Handle different error formats
        let errorMessage = "Gagal menyimpan pengumuman";

        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // FastAPI validation errors (array of objects)
          errorMessage = errorData.detail
            .map((err: any) => `${err.loc?.join(" → ") || "Error"}: ${err.msg}`)
            .join("; ");
        } else if (errorData.detail && typeof errorData.detail === "object") {
          // Object error detail
          errorMessage = JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        throw new Error(errorMessage);
      }

      toast.success(
        formMode === "create"
          ? "Pengumuman berhasil dibuat"
          : "Pengumuman berhasil diperbarui",
      );

      setFormOpen(false);
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan pengumuman";
      toast.error(message);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/announcements/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus pengumuman");
      }

      toast.success("Pengumuman berhasil dihapus");
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus pengumuman";
      toast.error(message);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/announcements/${id}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mempublikasi pengumuman");
      }

      toast.success("Pengumuman berhasil dipublikasi");
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mempublikasi pengumuman";
      toast.error(message);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}/api/v1/announcements/${id}/archive`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengarsipkan pengumuman");
      }

      toast.success("Pengumuman berhasil diarsipkan");
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengarsipkan pengumuman";
      toast.error(message);
    }
  };

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

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const publishedCount = announcements.filter((a) => a.status === "published").length;
  const draftCount = announcements.filter((a) => a.status === "draft").length;
  const archivedCount = announcements.filter((a) => a.status === "archived").length;

  if (loading && announcements.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-6">
              <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Pengumuman & Berita
              </h1>
              <p className="text-sm text-gray-500">
                Kelola pengumuman dan berita untuk pengguna
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-[#00ab6c] hover:bg-[#008f56] text-white font-medium px-6 py-2 rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengumuman
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className="text-lg font-semibold text-gray-900">{totalItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Dipublikasikan:</span>
              <span className="text-lg font-semibold text-green-600">{publishedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Draft:</span>
              <span className="text-lg font-semibold text-gray-600">{draftCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Diarsipkan:</span>
              <span className="text-lg font-semibold text-gray-500">{archivedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadData();
                  }
                }}
                className="pl-10 h-11 border-gray-300 focus:border-[#00ab6c] focus:ring-[#00ab6c]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11 border-gray-300 focus:border-[#00ab6c] focus:ring-[#00ab6c]">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-gray-300 focus:border-[#00ab6c] focus:ring-[#00ab6c]">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={featuredFilter === null ? "all" : featuredFilter.toString()}
              onValueChange={(value) =>
                setFeaturedFilter(value === "all" ? null : value === "true")
              }
            >
              <SelectTrigger className="h-11 border-gray-300 focus:border-[#00ab6c] focus:ring-[#00ab6c]">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Tidak Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Announcements List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {announcements.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum ada pengumuman
            </h3>
            <p className="text-gray-500 mb-6">
              Mulai membuat pengumuman pertama Anda
            </p>
            <Button
              onClick={handleCreate}
              className="bg-[#00ab6c] hover:bg-[#008f56] text-white font-medium px-6 py-2 rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengumuman Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {announcements.map((announcement, index) => {
              const featuredImage = announcement.featured_image;
              const hasImageError = imageErrors.has(announcement.id);
              const showPlaceholder = !featuredImage || hasImageError;
              
              return (
                <div
                  key={announcement.id}
                  className={`group border-b border-gray-200 py-6 hover:bg-gray-50 transition-colors ${
                    index === 0 ? "border-t border-gray-200" : ""
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Featured Image */}
                    <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {showPlaceholder ? (
                        <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                          <FileText className="w-8 h-8 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500 leading-tight">
                            Gambar tidak tersedia
                          </p>
                        </div>
                      ) : (
                        <img
                          src={imageUrl(featuredImage)}
                          alt={announcement.title}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrors((prev) => new Set(prev).add(announcement.id));
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {announcement.is_pinned && (
                            <Pin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                          {announcement.is_featured && (
                            <Star className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          )}
                          {getStatusBadge(announcement.status)}
                          {getTypeBadge(announcement.type)}
                          {getPriorityBadge(announcement.priority)}
                          <span className="text-xs text-gray-500">
                            {new Date(announcement.created_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#00ab6c] transition-colors line-clamp-2">
                          {announcement.title}
                        </h3>
                        {announcement.summary && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {announcement.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{announcement.view_count} views</span>
                          </div>
                          {announcement.tags && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span>{announcement.tags.split(",").length} tag</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(announcement)}
                            className="text-gray-700 hover:text-[#00ab6c] hover:bg-gray-100"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="text-gray-700 hover:text-[#00ab6c] hover:bg-gray-100"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                      {/* Publish Button - Separated on the right */}
                      {announcement.status === "draft" && (
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => handlePublish(announcement.id)}
                            className="bg-[#00ab6c] hover:bg-[#008f56] text-white font-medium px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Publikasikan
                          </Button>
                        </div>
                      )}
                      {announcement.status === "published" && (
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => handleArchive(announcement.id)}
                            variant="outline"
                            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium px-6 py-2 rounded-full"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Arsipkan
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200">
          <div className="flex justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto sm:min-w-fit"
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto sm:min-w-fit"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      <AnnouncementForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={selectedAnnouncement}
        mode={formMode}
      />

      <AnnouncementDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}
