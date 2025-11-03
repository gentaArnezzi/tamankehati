import { Flora, galleryApi } from "../../lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Calendar, MapPin, Leaf, FileText, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { imageUrl } from "../../lib/api-url";

interface FloraDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Flora | null;
}

export function FloraDetail({ open, onOpenChange, data }: FloraDetailProps) {
  const [galleryImages, setGalleryImages] = useState<
    Array<{
      id: number;
      title: string;
      description: string;
      image_url: string;
      entity_type: string;
      entity_id: number;
      status: string;
      created_at: string;
      updated_at: string;
    }>
  >([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    if (data?.id && open) {
      // Only try to fetch gallery if backend is available
      const enableGallery = process.env.NEXT_PUBLIC_ENABLE_GALLERY !== "false";
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
      const response = await galleryApi.getByEntity("flora", data.id);
      if (response.success && response.data) {
        setGalleryImages(response.data);
      } else {
        // No gallery images found, set empty array
        setGalleryImages([]);
      }
    } catch (error: any) {
      // Silently handle error - gallery is optional feature
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.debug("Gallery fetch skipped - backend may not be available");
      }
      setGalleryImages([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  if (!data) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: {
        label: "Draft",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      in_review: {
        label: "Dalam Peninjauan",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      approved: {
        label: "Disetujui",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      rejected: {
        label: "Ditolak",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = variants[status] || variants.draft;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
                src={imageUrl(data.gambar_utama)}
                alt={data.nama_ilmiah}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.png";
                }}
              />
            </div>
          )}

          {/* Gallery Images */}
          <div>
            <h3 className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5" style={{ color: "#356447" }} />
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
                        src={imageUrl(image.image_url)}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <p
                        className="text-xs font-medium text-gray-900 truncate"
                        title={image.title}
                      >
                        {image.title}
                      </p>
                      {image.description && (
                        <p
                          className="text-xs text-gray-500 truncate"
                          title={image.description}
                        >
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
                <p className="text-sm text-gray-500">
                  Belum ada gambar di galeri
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Gambar dapat ditambahkan melalui menu galeri
                </p>
              </div>
            )}
          </div>

          {/* Gambar Detail Flora */}
          {(data.gambar_daun ||
            data.gambar_batang ||
            data.gambar_bunga ||
            data.gambar_buah) && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5" style={{ color: "#356447" }} />
                <span>Dokumentasi Detail Flora</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.gambar_daun && (
                  <div className="space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      <img
                        src={imageUrl(data.gambar_daun)}
                        alt="Pertelaan Daun"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900">
                        Pertelaan Daun
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Detail struktur daun
                      </p>
                    </div>
                  </div>
                )}
                {data.gambar_batang && (
                  <div className="space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      <img
                        src={imageUrl(data.gambar_batang)}
                        alt="Batang/Percabangan"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900">
                        Batang
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Batang & percabangan
                      </p>
                    </div>
                  </div>
                )}
                {data.gambar_bunga && (
                  <div className="space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      <img
                        src={imageUrl(data.gambar_bunga)}
                        alt="Bunga"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900">Bunga</p>
                      <p className="text-[10px] text-gray-500">
                        Detail struktur bunga
                      </p>
                    </div>
                  </div>
                )}
                {data.gambar_buah && (
                  <div className="space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      <img
                        src={imageUrl(data.gambar_buah)}
                        alt="Buah"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900">Buah</p>
                      <p className="text-[10px] text-gray-500">
                        Detail struktur buah
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informasi Taksonomi */}
          <div>
            <h3 className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5" style={{ color: "#356447" }} />
              <span>Informasi Taksonomi</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Nama Ilmiah
                </p>
                <p className="italic">{data.nama_ilmiah}</p>
              </div>
              {data.nama_umum && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nama Umum
                  </p>
                  <p>{data.nama_umum}</p>
                </div>
              )}
              {data.sinonim && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sinonim</p>
                  <p className="italic text-sm">{data.sinonim}</p>
                </div>
              )}
              {data.famili && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Famili</p>
                  <p>{data.famili}</p>
                </div>
              )}
              {data.genus && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Genus</p>
                  <p>{data.genus}</p>
                </div>
              )}
              {data.status_iucn && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Status IUCN
                  </p>
                  <Badge variant="outline">{data.status_iucn}</Badge>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Status Endemik
                </p>
                <Badge
                  variant="outline"
                  className={
                    data.is_endemic
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }
                >
                  {data.is_endemic ? "✓ Endemik Indonesia" : "Bukan Endemik"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Morfologi */}
          {data.morfologi && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <Leaf className="h-5 w-5" style={{ color: "#356447" }} />
                <span>Morfologi</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.morfologi}
              </p>
            </div>
          )}

          {/* Deskripsi */}
          {data.deskripsi && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5" style={{ color: "#356447" }} />
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
                <MapPin className="h-5 w-5" style={{ color: "#356447" }} />
                <span>Habitat</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.habitat}
              </p>
            </div>
          )}

          {/* Manfaat */}
          {data.manfaat && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5" style={{ color: "#356447" }} />
                <span>Manfaat / Kegunaan</span>
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg leading-relaxed">
                {data.manfaat}
              </p>
            </div>
          )}

          {/* Informasi Tambahan */}
          {(data.sinonim ||
            data.waktu_berbunga ||
            data.penyebaran ||
            data.metode_perbanyakan) && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5" style={{ color: "#356447" }} />
                <span>Informasi Tambahan</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {data.waktu_berbunga && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Waktu Berbunga
                    </p>
                    <p className="text-sm">{data.waktu_berbunga}</p>
                  </div>
                )}
                {data.penyebaran && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      Penyebaran
                    </p>
                    <p className="text-sm whitespace-pre-line">
                      {data.penyebaran}
                    </p>
                  </div>
                )}
                {data.metode_perbanyakan && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      Metode Perbanyakan
                    </p>
                    <p className="text-sm whitespace-pre-line">
                      {data.metode_perbanyakan}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Referensi */}
          {data.referensi && (
            <div>
              <h3 className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5" style={{ color: "#356447" }} />
                <span>Referensi</span>
              </h3>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                  {data.referensi}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Taman</p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.park?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Tanggal Dibuat</p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(data.created_at)}
              </p>
            </div>
            {data.updated_at !== data.created_at && (
              <div>
                <p className="text-muted-foreground mb-1">
                  Terakhir Diperbarui
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(data.updated_at)}
                </p>
              </div>
            )}
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
