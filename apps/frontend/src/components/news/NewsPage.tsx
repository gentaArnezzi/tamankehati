'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Clock,
  FileText,
  BookOpen
} from 'lucide-react';
import { NewsForm } from './NewsForm';
import { NewsDetail } from './NewsDetail';
import { toast } from 'sonner';

// Types
export interface News {
  id: number;
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  category: 'biodiversity' | 'conservation' | 'research' | 'education' | 'events' | 'general';
  status: 'draft' | 'published' | 'archived';
  priority: number;
  is_featured: boolean;
  is_pinned: boolean;
  featured_image?: string;
  attachments?: string;
  tags?: string;
  reading_time: number;
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

interface NewsListResponse {
  items: News[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

const NEWS_CATEGORIES = [
  { value: 'biodiversity', label: 'Keanekaragaman Hayati' },
  { value: 'conservation', label: 'Konservasi' },
  { value: 'research', label: 'Penelitian' },
  { value: 'education', label: 'Pendidikan' },
  { value: 'events', label: 'Acara' },
  { value: 'general', label: 'Umum' },
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

export function NewsPage() {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);
  
  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
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
      if (categoryFilter !== 'all') {
        params.append('category_filter', categoryFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status_filter', statusFilter);
      }
      if (featuredFilter !== null) {
        params.append('featured_only', featuredFilter.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/news/?${params}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal memuat data berita');
      }

      const data: NewsListResponse = await response.json();
      setNews(data.items);
      setTotalItems(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter, statusFilter, featuredFilter, itemsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedNews(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleView = (news: News) => {
    setSelectedNews(news);
    setDetailOpen(true);
  };

  const handleSubmit = async (formData: Partial<News>) => {
    try {
      const url = formMode === 'create' 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/news/`
        : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/news/${formData.id}`;
      
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
        throw new Error('Gagal menyimpan berita');
      }

      toast.success(
        formMode === 'create' 
          ? 'Berita berhasil dibuat' 
          : 'Berita berhasil diperbarui'
      );
      
      setFormOpen(false);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan berita';
      toast.error(message);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/news/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal menghapus berita');
      }

      toast.success('Berita berhasil dihapus');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus berita';
      toast.error(message);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/news/${id}/publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mempublikasi berita');
      }

      toast.success('Berita berhasil dipublikasi');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mempublikasi berita';
      toast.error(message);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/news/${id}/archive`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengarsipkan berita');
      }

      toast.success('Berita berhasil diarsipkan');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengarsipkan berita';
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

  const getCategoryBadge = (category: string) => {
    const colors = {
      biodiversity: 'bg-green-100 text-green-800',
      conservation: 'bg-blue-100 text-blue-800',
      research: 'bg-purple-100 text-purple-800',
      education: 'bg-yellow-100 text-yellow-800',
      events: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      biodiversity: 'Keanekaragaman Hayati',
      conservation: 'Konservasi',
      research: 'Penelitian',
      education: 'Pendidikan',
      events: 'Acara',
      general: 'Umum',
    };

    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[category as keyof typeof labels] || category}
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

  if (loading && news.length === 0) {
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2 flex items-center gap-2">
            <BookOpen className="h-8 w-8" style={{ color: '#356447' }} />
            Manajemen Berita
          </h1>
          <p className="text-muted-foreground">
            Kelola berita dan artikel keanekaragaman hayati
            {/* wilayah field removed from User type */}
          </p>
        </div>
        <Button onClick={handleCreate} style={{ backgroundColor: '#233c2b' }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Berita
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari judul atau konten berita..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={loadData} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua kategori</SelectItem>
                  {NEWS_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
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
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* News List */}
      <div className="grid gap-4">
        {news.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    {item.is_pinned && (
                      <Pin className="h-4 w-4 text-blue-600" />
                    )}
                    {item.is_featured && (
                      <Star className="h-4 w-4 text-yellow-600" />
                    )}
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  
                  {item.summary && (
                    <p className="text-muted-foreground line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCategoryBadge(item.category)}
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                    {item.tags && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {item.tags.split(',').length} tag
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Author ID: {item.author_id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{item.view_count} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{item.reading_time} min baca</span>
                    </div>
                    {item.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Published: {new Date(item.published_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(item)}
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
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {item.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handlePublish(item.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {item.status === 'published' && (
                        <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item.id)}
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
      <NewsForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={selectedNews}
        mode={formMode}
      />

      <NewsDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        news={selectedNews}
      />
    </div>
  );
}
