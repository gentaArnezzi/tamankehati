import { Fauna, galleryApi } from '../../lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Calendar, MapPin, Users, FileText, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FaunaDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Fauna | null;
}

export function FaunaDetail({ open, onOpenChange, data }: FaunaDetailProps) {
  const [galleryImages, setGalleryImages] = useState<Array<{
    id: number;
    title: string;
    description: string;
    image_url: string;
    entity_type: string;
    entity_id: number;
    status: string;
    created_at: string;
    updated_at: string;
  }>>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    if (data?.id && open) {
      // Only try to fetch gallery if backend is available
      const enableGallery = process.env.NEXT_PUBLIC_ENABLE_GALLERY !== 'false';
      if (enableGallery) {
        fetchGalleryImages();
      } else {
        setGalleryImages([]);
        setLoadingGallery(false);
      }
    }
  }, [data?.id, open]);

  const fetchGalleryImages = async () => {
    if (!data?.id) return;
    
    try {
      setLoadingGallery(true);
      const response = await galleryApi.getByEntity('fauna', data.id);
      if (response.success && response.data) {
        setGalleryImages(response.data);
      } else {
        // No gallery images found, set empty array
        setGalleryImages([]);
      }
    } catch (error: any) {
      // Silently handle error - gallery is optional feature
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug('Gallery fetch skipped - backend may not be available');
      }
      setGalleryImages([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  if (!data) return null;

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      in_review: { label: 'Dalam Review', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-200' },
    }[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                <i>{data.nama_ilmiah}</i>
              </DialogTitle>
              {data.nama_umum && (
                <p className="text-muted-foreground">{data.nama_umum}</p>
              )}
            </div>
            {getStatusBadge(data.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gambar Utama */}
          {data.gambar_utama && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={data.gambar_utama.startsWith('http') ? data.gambar_utama : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}${data.gambar_utama}`}
                alt={data.nama_ilmiah}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            </div>
          )}

          {/* Gallery Images */}
          <div>
            <h3 className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
              <span>Galeri Gambar ({galleryImages.length})</span>
            </h3>
            
            {loadingGallery ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">Memuat galeri gambar...</p>
              </div>
            ) : galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      <img
                        src={image.image_url.startsWith('http') ? image.image_url : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}${image.image_url}`}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-900 truncate" title={image.title}>
                        {image.title}
                      </p>
                      {image.description && (
                        <p className="text-xs text-gray-500 truncate" title={image.description}>
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Belum ada gambar di galeri</p>
                <p className="text-xs text-gray-400 mt-1">Gambar dapat ditambahkan melalui menu galeri</p>
              </div>
            )}
          </div>

          {/* Informasi Taksonomi */}
          <div>
            <h3 className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
              <span>Informasi Taksonomi</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nama Ilmiah</p>
                <p className="italic">{data.nama_ilmiah || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nama Umum</p>
                <p>{data.nama_umum || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ordo</p>
                <p>{data.ordo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status IUCN</p>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {data.status_iucn || 'NE'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Endemik</p>
                <p>{data.is_endemic ? 'Ya' : 'Tidak'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                {getStatusBadge(data.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tanggal</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(data.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Morfologi */}
          {data.morphology && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
                <span>Morfologi</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.morphology}
              </p>
            </div>
          )}

          {/* Deskripsi */}
          {data.deskripsi && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
                <span>Deskripsi</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.deskripsi}
              </p>
            </div>
          )}

          {/* Habitat */}
          {data.habitat && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
                <span>Habitat</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.habitat}
              </p>
            </div>
          )}

          {/* Diet */}
          {data.diet && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
                <span>Makanan</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.diet}
              </p>
            </div>
          )}

          {/* Perilaku */}
          {data.behavior && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
                <span>Perilaku</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.behavior}
              </p>
            </div>
          )}

          {/* Habitat / Sumber Makanan */}
          {data.habitat_sumber_makanan && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
                <span>Habitat / Sumber Makanan</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.habitat_sumber_makanan}
              </p>
            </div>
          )}

          {/* Status Hama */}
          {data.status_hama && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5" style={{ color: 'rgb(53, 100, 71)' }} />
                <span>Status Hama</span>
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="mb-2"><span className="font-semibold">Status:</span> {data.status_hama}</p>
                {data.tingkat_hama && (
                  <p><span className="font-semibold">Tingkat:</span> {data.tingkat_hama}</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Informasi Tambahan */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Taman</p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.park?.name || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Tanggal Dibuat</p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(data.created_at)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Terakhir Diperbarui</p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(data.updated_at)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">ID Data</p>
              <p className="text-xs font-mono">{data.id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
