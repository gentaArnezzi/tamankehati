'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
  Clock
} from 'lucide-react';
import { AnnouncementForm } from './AnnouncementForm';
import { AnnouncementDetail } from './AnnouncementDetail';
import { toast } from 'sonner';

// Types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  summary?: string;
  type: 'news' | 'announcement' | 'event' | 'maintenance';
  status: 'draft' | 'published' | 'archived';
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
  { value: 'news', label: 'Berita' },
  { value: 'announcement', label: 'Pengumuman' },
  { value: 'event', label: 'Acara' },
  { value: 'maintenance', label: 'Pemeliharaan' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Dipublikasi' },
  { value: 'archived', label: 'Diarsipkan' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Normal' },
  { value: 1, label: 'Tinggi' },
  { value: 2, label: 'Mendesak' },
];

export function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);
  
  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (typeFilter !== 'all') {
        params.append('type_filter', typeFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status_filter', statusFilter);
      }
      if (featuredFilter !== null) {
        params.append('featured_only', featuredFilter.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/announcements/?${params}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal memuat data pengumuman');
      }

      const data: AnnouncementListResponse = await response.json();
      setAnnouncements(data.items);
      setTotalItems(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, typeFilter, statusFilter, featuredFilter, itemsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    router.push('/dashboard/announcements/create');
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailOpen(true);
  };

  const handleSubmit = async (formData: Partial<Announcement>) => {
    try {
      const url = formMode === 'create' 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/announcements/`
        : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/announcements/${formData.id}`;
      
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan pengumuman');
      }

      toast.success(
        formMode === 'create' 
          ? 'Pengumuman berhasil dibuat' 
          : 'Pengumuman berhasil diperbarui'
      );
      
      setFormOpen(false);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengumuman';
      toast.error(message);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/announcements/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal menghapus pengumuman');
      }

      toast.success('Pengumuman berhasil dihapus');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus pengumuman';
      toast.error(message);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/announcements/${id}/publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mempublikasi pengumuman');
      }

      toast.success('Pengumuman berhasil dipublikasi');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mempublikasi pengumuman';
      toast.error(message);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/announcements/${id}/archive`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengarsipkan pengumuman');
      }

      toast.success('Pengumuman berhasil diarsipkan');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengarsipkan pengumuman';
      toast.error(message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline',
    } as const;
    
    const labels = {
      draft: 'Draft',
      published: 'Dipublikasi',
      archived: 'Diarsipkan',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      news: 'bg-blue-100 text-blue-800',
      announcement: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-orange-100 text-orange-800',
    };

    const labels = {
      news: 'Berita',
      announcement: 'Pengumuman',
      event: 'Acara',
      maintenance: 'Pemeliharaan',
    };

    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      0: 'bg-gray-100 text-gray-800',
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-red-100 text-red-800',
    };

    const labels = {
      0: 'Normal',
      1: 'Tinggi',
      2: 'Mendesak',
    };

    return (
      <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[priority as keyof typeof labels] || 'Normal'}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && announcements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengumuman & Berita</h1>
          <p className="text-muted-foreground">
            Kelola pengumuman dan berita untuk pengguna
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Buat Pengumuman
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pencarian</label>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Fitur</label>
              <Select 
                value={featuredFilter === null ? 'all' : featuredFilter.toString()} 
                onValueChange={(value) => setFeaturedFilter(value === 'all' ? null : value === 'true')}
              >
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Announcements List */}
      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
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
                    {getStatusBadge(announcement.status)}
                    {getPriorityBadge(announcement.priority)}
                    {announcement.tags && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {announcement.tags.split(',').length} tag
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Author ID: {announcement.author_id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(announcement.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{announcement.view_count} views</span>
                    </div>
                    {announcement.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Published: {new Date(announcement.published_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(announcement)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {announcement.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handlePublish(announcement.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {announcement.status === 'published' && (
                        <DropdownMenuItem onClick={() => handleArchive(announcement.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
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
