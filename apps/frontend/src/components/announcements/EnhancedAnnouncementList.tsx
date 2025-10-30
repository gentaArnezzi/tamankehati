"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  Archive,
  MoreHorizontal,
  Search,
  Filter,
  Users,
  MessageSquare,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Announcement {
  id: number;
  title: string;
  content: string;
  summary?: string;
  type: string;
  priority: string;
  status: string;
  target_audience: string;
  requires_acknowledgment: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  published_at?: string;
  expires_at?: string;
  author_id?: number;
  featured_image?: string;
  tags?: string;
  view_count: number;
  read_count: number;
  acknowledged_count: number;
  comment_count: number;
  reaction_count: number;
  user_has_read: boolean;
  user_has_acknowledged: boolean;
  user_reactions: string[];
  created_at: string;
  updated_at: string;
}

interface EnhancedAnnouncementListProps {
  userRole: "super_admin" | "regional_admin";
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
  onAcknowledge: (id: number) => void;
  onReact: (id: number, reactionType: string) => void;
  onComment: (id: number) => void;
}

const PRIORITY_COLORS = {
  low: "bg-gray-500",
  normal: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
};

const REACTION_TYPES = [
  { type: "like", label: "Like", icon: "👍" },
  { type: "love", label: "Love", icon: "❤️" },
  { type: "dislike", label: "Dislike", icon: "👎" },
  { type: "angry", label: "Angry", icon: "😠" },
  { type: "sad", label: "Sad", icon: "😢" },
  { type: "wow", label: "Wow", icon: "😮" },
];

export default function EnhancedAnnouncementList({
  userRole,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onAcknowledge,
  onReact,
  onComment,
}: EnhancedAnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      });

      const response = await fetch(`/api/v1/enhanced/announcements?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.items || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const getPriorityColor = (priority: string) => {
    return (
      PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "bg-gray-500"
    );
  };

  const getStatusColor = (status: string) => {
    return (
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm");
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getAnnouncementStatus = (announcement: Announcement) => {
    if (announcement.status === "draft") return "Draft";
    if (announcement.status === "archived") return "Archived";
    if (isExpired(announcement.expires_at)) return "Expired";
    if (announcement.status === "published") return "Published";
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pencarian
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari pengumuman..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Prioritas
              </label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="urgent">Mendesak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Jenis</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="announcement">Pengumuman</SelectItem>
                  <SelectItem value="news">Berita</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Tidak ada pengumuman ditemukan
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                announcement.is_pinned && "border-l-4 border-l-blue-500",
                announcement.is_featured &&
                  "bg-gradient-to-r from-blue-50 to-indigo-50",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(announcement.priority)}`}
                        />
                        <Badge className={getStatusColor(announcement.status)}>
                          {getAnnouncementStatus(announcement)}
                        </Badge>
                        {announcement.is_pinned && (
                          <Badge variant="secondary">📌 Pinned</Badge>
                        )}
                        {announcement.is_featured && (
                          <Badge variant="secondary">⭐ Featured</Badge>
                        )}
                        {announcement.requires_acknowledgment && (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-600"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Wajib Acknowledgment
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Title and Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {announcement.title}
                      </h3>
                      {announcement.summary && (
                        <p className="text-gray-600 text-sm mb-3">
                          {announcement.summary}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {announcement.read_count} reads
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {announcement.comment_count} comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {announcement.reaction_count} reactions
                      </span>
                      {announcement.requires_acknowledgment && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {announcement.acknowledged_count} acknowledged
                        </span>
                      )}
                    </div>

                    {/* User Status */}
                    {userRole === "regional_admin" && (
                      <div className="flex items-center gap-2">
                        {announcement.user_has_read ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Read
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-600"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Unread
                          </Badge>
                        )}

                        {announcement.requires_acknowledgment &&
                          (announcement.user_has_acknowledged ? (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledged
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-600"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending Acknowledgment
                            </Badge>
                          ))}

                        {announcement.user_reactions.length > 0 && (
                          <div className="flex items-center gap-1">
                            {announcement.user_reactions.map(
                              (reaction, index) => (
                                <span key={index} className="text-sm">
                                  {REACTION_TYPES.find(
                                    (r) => r.type === reaction,
                                  )?.icon || "👍"}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-gray-400">
                      Created: {formatDate(announcement.created_at)}
                      {announcement.published_at && (
                        <span>
                          {" "}
                          • Published: {formatDate(announcement.published_at)}
                        </span>
                      )}
                      {announcement.expires_at && (
                        <span>
                          {" "}
                          • Expires: {formatDate(announcement.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(announcement.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    {userRole === "super_admin" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(announcement.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {announcement.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() => onPublish(announcement.id)}
                              >
                                Publish
                              </DropdownMenuItem>
                            )}
                            {announcement.status === "published" && (
                              <DropdownMenuItem
                                onClick={() => onArchive(announcement.id)}
                              >
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => onDelete(announcement.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}

                    {userRole === "regional_admin" && (
                      <div className="flex items-center gap-1">
                        {announcement.requires_acknowledgment &&
                          !announcement.user_has_acknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAcknowledge(announcement.id)}
                              className="text-orange-600 border-orange-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Acknowledge
                            </Button>
                          )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onComment(announcement.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comment
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {REACTION_TYPES.map((reaction) => (
                              <DropdownMenuItem
                                key={reaction.type}
                                onClick={() =>
                                  onReact(announcement.id, reaction.type)
                                }
                              >
                                <span className="mr-2">{reaction.icon}</span>
                                {reaction.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
