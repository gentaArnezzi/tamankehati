'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { activitiesApi, Activity, parksApi, Park } from '../../lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
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
import { ActivityForm } from './ActivityForm';
import { ActivityDetail } from './ActivityDetail';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const renderStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
    in_review: { label: 'Review', variant: 'default' as const, icon: AlertCircle },
    approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
    rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export function ActivitiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<Activity[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const itemsPerPage = 10;

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'edit'>('edit');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, any> = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (parkFilter !== 'all') {
        params.park_id = parseInt(parkFilter);
      }

      if (user?.role === 'regional_admin') {
        // Regional admin should only see their own submitted data
        params.submitted_by = user.id;
      }

      const response = await activitiesApi.list(params);
      setData(response.items);
      setTotalItems(response.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data kegiatan';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, parkFilter]);

  const loadParks = useCallback(async () => {
    try {
      const response = await parksApi.list({ limit: 100 });
      setParks(response.items);
    } catch (err) {
      console.error('Failed to load parks:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadParks();
  }, [loadParks]);

  const handleCreate = () => {
    router.push('/dashboard/activities/create');
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleView = (activity: Activity) => {
    setSelectedActivity(activity);
    setDetailOpen(true);
  };

  const handleDelete = async (activity: Activity) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${activity.title}"?`)) {
      return;
    }

    try {
      await activitiesApi.delete(activity.id);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus kegiatan';
      setError(message);
    }
  };

  const handleSubmit = async (activity: Activity) => {
    try {
      await activitiesApi.submit(activity.id);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim kegiatan untuk review';
      setError(message);
    }
  };

  const handleApprove = async (activity: Activity) => {
    try {
      await activitiesApi.approve(activity.id);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyetujui kegiatan';
      setError(message);
    }
  };

  const handleReject = async (activity: Activity) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
      await activitiesApi.reject(activity.id, reason);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menolak kegiatan';
      setError(message);
    }
  };

  const handleFormSuccess = async () => {
    setFormOpen(false);
    await loadData();
  };

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kegiatan Konservasi</h1>
          <p className="text-muted-foreground">
            Kelola kegiatan konservasi di taman nasional
          </p>
        </div>
        <Button onClick={handleCreate} data-tour="add-activity-button">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kegiatan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Taman</label>
              <Select value={parkFilter} onValueChange={setParkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih taman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Taman</SelectItem>
                  {parks.map((park) => (
                    <SelectItem key={park.id} value={park.id.toString()}>
                      {park.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setParkFilter('all');
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kegiatan ({totalItems})</CardTitle>
          <CardDescription>
            {loading ? 'Memuat...' : `${data.length} kegiatan ditemukan`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Tidak ada kegiatan</h3>
              <p className="text-muted-foreground">
                Belum ada kegiatan konservasi yang dibuat.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Kegiatan</TableHead>
                  <TableHead>Taman</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        {activity.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {activity.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.park?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatDate(activity.activity_date)}
                    </TableCell>
                    <TableCell>
                      {activity.location || '-'}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(activity.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(activity)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(activity.status === 'draft' || activity.status === 'rejected' || activity.status === 'approved') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(activity)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {activity.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSubmit(activity)}
                          >
                            Submit
                          </Button>
                        )}
                        {activity.status === 'in_review' && user?.role === 'super_admin' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(activity)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(activity)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(activity)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Kegiatan</DialogTitle>
            <DialogDescription>
              Edit informasi kegiatan konservasi
            </DialogDescription>
          </DialogHeader>
          <ActivityForm
            activity={selectedActivity}
            parks={parks}
            userParkId={user?.park_id}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Kegiatan</DialogTitle>
            <DialogDescription>
              Informasi lengkap kegiatan konservasi
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <ActivityDetail
              activity={selectedActivity}
              onClose={() => setDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
