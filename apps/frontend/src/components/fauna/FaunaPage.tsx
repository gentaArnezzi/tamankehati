import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Bird, Filter, Pencil, Plus, RefreshCw, Search, Send, Trash2, Eye } from 'lucide-react';

import { useAuth } from '../../lib/useAuth';
import { Fauna, faunaApi } from '../../lib/api-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { FileUpload } from '../ui/file-upload';
import { MultipleFileUpload } from '../ui/multiple-file-upload';
import { FaunaDetail } from './FaunaDetail';

const faunaSchema = z.object({
  nama_ilmiah: z.string().min(1, 'Nama ilmiah wajib diisi'),
  nama_umum: z.string().optional(),
  ordo: z.string().optional(),
  status_iucn: z.string().optional(),
  deskripsi: z.string().optional(),
  habitat_sumber_makanan: z.string().optional(),
  status_hama: z.string().optional(),
  tingkat_hama: z.string().optional(),
  is_endemic: z.boolean().optional(),
  park_id: z.number().optional(),
  gambar_utama: z.string().optional(),
  status: z.enum(['draft', 'in_review', 'approved', 'rejected']).optional(),
});

type FaunaFormData = z.infer<typeof faunaSchema>;

const IUCN_STATUS_OPTIONS = [
  { value: 'LC', label: 'LC - Least Concern (Risiko Rendah)' },
  { value: 'NT', label: 'NT - Near Threatened (Hampir Terancam)' },
  { value: 'VU', label: 'VU - Vulnerable (Rentan)' },
  { value: 'EN', label: 'EN - Endangered (Genting)' },
  { value: 'CR', label: 'CR - Critically Endangered (Kritis)' },
  { value: 'DD', label: 'DD - Data Deficient (Data Kurang)' },
  { value: 'NE', label: 'NE - Not Evaluated (Belum Dievaluasi)' },
];

const STATUS_HAMA_OPTIONS = [
  { value: 'ya', label: 'Ya - Termasuk Hama' },
  { value: 'tidak', label: 'Tidak - Bukan Hama' },
  { value: 'tidak_diketahui', label: 'Tidak Diketahui' },
];

const TINGKAT_HAMA_OPTIONS = [
  { value: 'ringan', label: 'Ringan - Kerusakan Minimal' },
  { value: 'sedang', label: 'Sedang - Kerusakan Menengah' },
  { value: 'berat', label: 'Berat - Kerusakan Parah' },
  { value: 'sangat_berat', label: 'Sangat Berat - Kerusakan Sangat Parah' },
];

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const renderStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-200 text-slate-800' },
    in_review: { label: 'Dalam Peninjauan', className: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-200' },
  };
  const config = variants[status] ?? variants.draft;
  return (
    <Badge variant={status === 'approved' ? 'outline' : 'secondary'} className={config.className}>
      {config.label}
    </Badge>
  );
};

export function FaunaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<Fauna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Array<{file: File; preview: string; id: string}>>([]);
  const [uploading, setUploading] = useState(false);

  // Removed zone-related state as we now use park_id

  // Region filtering removed - using user-based access control
  // const availableRegions = [...];  // Removed

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Region filtering removed - using user-based access control
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedFauna, setSelectedFauna] = useState<Fauna | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const loadDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  const form = useForm<FaunaFormData>({
    resolver: zodResolver(faunaSchema),
    defaultValues: {
      nama_ilmiah: '',
      nama_umum: '',
      status_iucn: '',
      deskripsi: '',
      is_endemic: false,
      park_id: 1,
      gambar_utama: '',
      status: user?.role === 'regional_admin' ? 'draft' : 'approved',
    },
  });

  // Removed zone loading logic as we now use park_id

  const loadData = useCallback(async () => {
    // Clear existing timeout
    if (loadDataTimeoutRef.current) {
      clearTimeout(loadDataTimeoutRef.current);
    }
    
    // Debounce the API call
    loadDataTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        
        // Create cache key
        const cacheKey = `fauna-${currentPage}-${searchQuery}-${statusFilter}-${user?.id}`;
        const now = Date.now();
        const cacheExpiry = 10000; // 10 seconds cache for faster updates
        
        // Check cache first
        const cached = cacheRef.current.get(cacheKey);
        if (cached && (now - cached.timestamp) < cacheExpiry) {
          setData(cached.data.items);
          setTotalItems(cached.data.total);
          setLoading(false);
          return;
        }
        
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

        // Region filtering removed - using user-based access control
        if (user?.role === 'regional_admin') {
          // Regional admin should only see their own submitted data
          params.submitted_by = user.id;
        }

        const response = await faunaApi.list(params);
        
        // Cache the response
        cacheRef.current.set(cacheKey, {
          data: response,
          timestamp: now
        });
        
        setData(response.items);
        setTotalItems(response.total);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat data fauna';
        setError(message);
      } finally {
        setLoading(false);
      }
    }, 50); // 50ms debounce for maximum speed
  }, [currentPage, searchQuery, statusFilter, user]);

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery, statusFilter, user]);

  const resetFormValues = (fauna?: Fauna | null) => {
    form.reset({
      nama_ilmiah: fauna?.nama_ilmiah ?? '',
      nama_umum: fauna?.nama_umum ?? '',
      ordo: fauna?.ordo ?? '',
      status_iucn: fauna?.status_iucn ?? '',
      deskripsi: fauna?.deskripsi ?? '',
      habitat_sumber_makanan: fauna?.habitat_sumber_makanan ?? '',
      status_hama: fauna?.status_hama ?? '',
      tingkat_hama: fauna?.tingkat_hama ?? '',
      is_endemic: fauna?.is_endemic ?? false,
      park_id: fauna?.park_id ?? 1,
      gambar_utama: fauna?.gambar_utama ?? '',
    });
  };

  const handleCreate = () => {
    router.push('/dashboard/fauna/create');
  };

  const handleEdit = (fauna: Fauna) => {
    console.log('FaunaPage - handleEdit called with fauna:', fauna);
    setSelectedFauna(fauna);
    setFormMode('edit');
    resetFormValues(fauna);
    setFormOpen(true);
  };

  const handleView = (fauna: Fauna) => {
    setSelectedFauna(fauna);
    setDetailOpen(true);
  };

  const uploadFile = async (file: File): Promise<string> => {
    console.log('Uploading fauna image:', file.name, 'Size:', file.size);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/v1/upload/gallery-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Fauna image upload success:', result);
      return result.url;
    } catch (error) {
      console.error('Fauna image upload error:', error);
      throw error;
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    console.log('Uploading multiple fauna images:', files.length);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('http://localhost:8000/api/v1/upload/multiple-gallery-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Multiple fauna images upload success:', result);
      return result.uploaded_files.map((file: any) => file.url);
    } catch (error) {
      console.error('Multiple fauna images upload error:', error);
      throw error;
    }
  };

  const handleFilesSelect = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleSubmit = async (values: FaunaFormData, submitStatus: 'draft' | 'in_review') => {
    try {
      setUploading(true);
      
      console.log('Fauna form submitting - mode:', formMode, 'status:', submitStatus);
      console.log('Fauna form data:', values);
      
      let imageUrl = values.gambar_utama;
      let uploadedImageUrls: string[] = [];
      
      // If single file is selected, upload it first
      if (selectedFile) {
        console.log('Uploading fauna image file:', selectedFile.name);
        imageUrl = await uploadFile(selectedFile);
        console.log('Fauna image uploaded successfully, URL:', imageUrl);
      }
      
      // If multiple files are selected, upload them
      if (selectedFiles.length > 0) {
        console.log('Uploading multiple fauna images:', selectedFiles.length);
        const files = selectedFiles.map(f => f.file);
        uploadedImageUrls = await uploadMultipleFiles(files);
        console.log('Multiple fauna images uploaded successfully, URLs:', uploadedImageUrls);
        
        // Use first uploaded image as main image if no single file was selected
        if (!imageUrl && uploadedImageUrls.length > 0) {
          imageUrl = uploadedImageUrls[0];
        }
      }
      
      const faunaData = {
        nama_ilmiah: values.nama_ilmiah,
        nama_umum: values.nama_umum,
        ordo: values.ordo,
        status_iucn: values.status_iucn,
        deskripsi: values.deskripsi,
        habitat_sumber_makanan: values.habitat_sumber_makanan,
        status_hama: values.status_hama,
        tingkat_hama: values.tingkat_hama,
        is_endemic: values.is_endemic,
        park_id: values.park_id,
        gambar_utama: imageUrl,
        status: submitStatus, // Use the status from button click
      };
      
      console.log('Fauna data to submit:', faunaData);
      
      let faunaResult;
      if (formMode === 'create') {
        faunaResult = await faunaApi.create(faunaData);
        console.log('Fauna create result:', faunaResult);
        toast.success(submitStatus === 'draft' 
          ? 'Data fauna berhasil disimpan sebagai draft' 
          : 'Data fauna berhasil diajukan untuk review');
      } else if (selectedFauna) {
        faunaResult = await faunaApi.update(selectedFauna.id, faunaData);
        console.log('Fauna update result:', faunaResult);
        toast.success(submitStatus === 'draft'
          ? 'Data fauna berhasil diperbarui dan disimpan sebagai draft'
          : 'Data fauna berhasil diperbarui dan diajukan untuk review');
      }

      // Create gallery records for all uploaded images
      if (faunaResult?.id) {
        try {
          const { createGalleryForEntity } = await import('../../lib/gallery-integration');
          
          // Create gallery record for main image if single file was uploaded
          if (selectedFile && imageUrl) {
            await createGalleryForEntity(imageUrl, {
              entityType: 'fauna',
              entityId: Number(faunaResult.id),
              title: `${values.nama_umum || values.nama_ilmiah} - ${values.nama_ilmiah} (Gambar Utama)`,
              description: values.deskripsi || '',
              parkId: Number(values.park_id) || 1,
            });
            console.log('Gallery record created for main fauna image:', faunaResult.id);
          }
          
          // Create gallery records for multiple images
          for (let i = 0; i < uploadedImageUrls.length; i++) {
            const url = uploadedImageUrls[i];
            const isMainImage = selectedFile && url === imageUrl;
            
            await createGalleryForEntity(url, {
              entityType: 'fauna',
              entityId: Number(faunaResult.id),
              title: `${values.nama_umum || values.nama_ilmiah} - ${values.nama_ilmiah} ${isMainImage ? '(Gambar Utama)' : `(Gambar ${i + 1})`}`,
              description: values.deskripsi || '',
              parkId: Number(values.park_id) || 1,
            });
            console.log(`Gallery record created for fauna image ${i + 1}:`, faunaResult.id);
          }
        } catch (galleryError) {
          console.error('Failed to create gallery records:', galleryError);
          // Don't fail the entire operation if gallery creation fails
        }
      }
      setFormOpen(false);
      setSelectedFile(null);
      setSelectedFiles([]);
      form.reset();
      // Clear cache and reload
      cacheRef.current.clear();
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data fauna';
      toast.error(message);
      console.error('Fauna submit error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await faunaApi.remove(id);
      toast.success('Data fauna berhasil dihapus');
      setDeleteId(null);
      // Clear cache and reload
      cacheRef.current.clear();
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus data fauna';
      toast.error(message);
    }
  };

  const handleSubmitReview = async (id: string) => {
    try {
      await faunaApi.submit(id);
      toast.success('Data fauna berhasil diajukan untuk ditinjau');
      // Clear cache and reload
      cacheRef.current.clear();
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengajukan data fauna';
      toast.error(message);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  useEffect(() => {
    if (!formOpen) return;
    resetFormValues(selectedFauna);
  }, [formOpen, selectedFauna]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2 flex items-center gap-2">
            <Bird className="h-8 w-8" style={{ color: '#356447' }} />
            Manajemen Fauna
          </h1>
          <p className="text-muted-foreground">
            Kelola data keanekaragaman fauna Indonesia
            {/* wilayah field removed from User type */}
          </p>
        </div>
        <Button onClick={handleCreate} style={{ backgroundColor: '#233c2b' }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Fauna
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama ilmiah atau nama umum..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Cari fauna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px]"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">Dalam Tinjauan</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              {/* Region filtering removed - using user-based access control */}
              <Button onClick={loadData} variant="outline" size="icon" title="Muat ulang">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Data</div>
            <div className="text-2xl">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Draft</div>
            <div className="text-2xl">{data.filter((item) => item.status === 'draft').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Dalam Peninjauan</div>
            <div className="text-2xl">{data.filter((item) => item.status === 'in_review').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Disetujui</div>
            <div className="text-2xl">{data.filter((item) => item.status === 'approved').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Nama Ilmiah</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Nama Umum</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Ordo</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Status IUCN</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Endemik</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Tanggal</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index} className="border-b border-gray-50">
                  <TableCell className="py-4">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-end gap-1">
                      <div className="h-9 w-9 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-9 w-9 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-9 w-9 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">Tidak ada data fauna ditemukan</p>
                    <p className="text-sm text-gray-500">Coba ubah filter atau tambah data baru</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((fauna) => (
                <TableRow key={fauna.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4">
                    <span className="font-medium italic">{fauna.nama_ilmiah}</span>
                  </TableCell>
                  <TableCell className="py-4">{fauna.nama_umum || '-'}</TableCell>
                  <TableCell className="py-4">{fauna.ordo || '-'}</TableCell>
                  <TableCell className="py-4">{fauna.status_iucn || '-'}</TableCell>
                  <TableCell className="py-4">
                    {fauna.is_endemic ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        Endemik
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                        Tidak
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4">{renderStatusBadge(fauna.status)}</TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">{formatDate(fauna.created_at)}</TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleView(fauna)} title="Lihat Detail">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(fauna.status === 'draft' || fauna.status === 'approved') && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(fauna)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {fauna.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSubmitReview(fauna.id)}
                              title="Ajukan untuk Ditinjau"
                              style={{ color: '#356447' }}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(fauna.id)}
                            title="Hapus"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {fauna.status === 'rejected' && (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(fauna)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                let pageNumber = index + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNumber = currentPage - 2 + index;
                  }
                  if (currentPage > totalPages - 3) {
                    pageNumber = totalPages - 4 + index;
                  }
                }
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Tambah Data Fauna Baru' : 'Edit Data Fauna'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create'
                ? 'Isi formulir di bawah untuk menambahkan data fauna baru. Data akan disimpan sebagai draft.'
                : 'Perbarui informasi fauna. Perubahan akan disimpan sebagai draft.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nama_ilmiah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Ilmiah *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Pongo pygmaeus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nama_umum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Umum</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Orangutan Kalimantan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ordo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordo</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Primates" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status_iucn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status IUCN</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status IUCN" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {IUCN_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_endemic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Endemik Indonesia</FormLabel>
                        <FormDescription>
                          Centang jika spesies ini endemik di Indonesia
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Removed zone field as we now use park_id */}

              <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Lengkap</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi detail tentang fauna ini, termasuk ciri, distribusi, dan informasi penting lainnya"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="habitat_sumber_makanan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habitat / Sumber Makanan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Hutan tropis, memakan buah-buahan dan daun muda"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status_hama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Hama</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status hama" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_HAMA_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tingkat_hama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tingkat Hama</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tingkat hama" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TINGKAT_HAMA_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {/* Single Image Upload */}
                <div>
                  <label className="text-sm font-medium">Upload Gambar Utama Fauna</label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    onFileRemove={() => setSelectedFile(null)}
                    selectedFile={selectedFile}
                    maxSize={10}
                    className="mt-2"
                  />
                </div>
                
                {/* Multiple Images Upload */}
                <div>
                  <label className="text-sm font-medium">Upload Gambar Tambahan (Opsional)</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload hingga 10 gambar tambahan untuk fauna ini
                  </p>
                  <MultipleFileUpload
                    onFilesSelect={handleFilesSelect}
                    onFileRemove={handleFileRemove}
                    selectedFiles={selectedFiles}
                    maxSize={10}
                    maxFiles={10}
                    className="mt-2"
                  />
                </div>
                
                <div className="text-center text-sm text-gray-500">atau</div>
                
                <FormField
                  control={form.control}
                  name="gambar_utama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Gambar Utama</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/gambar.jpg" 
                          type="url"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL gambar dari sumber eksternal (opsional jika sudah upload file)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Batal
                </Button>
                <Button 
                  type="button"
                  variant="secondary"
                  disabled={uploading}
                  onClick={form.handleSubmit((data) => handleSubmit(data, 'draft'))}
                >
                  {uploading 
                    ? 'Menyimpan...' 
                    : 'Simpan sebagai Draft'}
                </Button>
                <Button 
                  type="button"
                  disabled={uploading}
                  onClick={form.handleSubmit((data) => handleSubmit(data, 'in_review'))}
                >
                  {uploading 
                    ? 'Mengirim...' 
                    : 'Submit untuk Review'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <FaunaDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        data={selectedFauna}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data fauna ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

