"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parksApi } from "../../../../lib/api-client";
import { apiUrl, imageUrl } from "../../../../lib/api-url";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { ArrowLeft, TreePine, Camera } from "lucide-react";
import { toast } from "sonner";

interface Gallery {
  id: number;
  title: string;
  image_url: string;
  description?: string;
}

export default function TamanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [taman, setTaman] = useState<any>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    loadTamanDetail();
    loadGalleries();
  }, [id]);

  const loadTamanDetail = async () => {
    try {
      setLoading(true);
      const data = await parksApi.getById(id);
      setTaman(data);
    } catch (error) {
      console.error("Failed to load taman detail:", error);
      toast.error("Gagal memuat detail taman");
    } finally {
      setLoading(false);
    }
  };

  const loadGalleries = async () => {
    try {
      setLoadingGallery(true);
      const response = await fetch(
        apiUrl(`/api/v1/galleries/entity/park/${id}`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setGalleries(result.data || result.items || []);
      } else {
        console.error(
          "Gallery load failed:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Failed to load galleries:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const getImageUrl = (url?: string) => {
    return imageUrl(url);
  };

  const getStatusBadge = (status?: string) => {
    const statusMap = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      in_review: {
        label: "Menunggu Persetujuan",
        className: "bg-yellow-100 text-yellow-800",
      },
      approved: {
        label: "Disetujui",
        className: "bg-green-100 text-green-800",
      },
      rejected: { label: "Ditolak", className: "bg-red-100 text-red-800" },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat detail taman...</p>
        </div>
      </div>
    );
  }

  if (!taman) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Data taman tidak ditemukan</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        {getStatusBadge(taman.status)}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <TreePine className="h-8 w-8 text-green-700" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{taman.name}</CardTitle>
              {taman.slug && (
                <p className="text-sm text-muted-foreground">{taman.slug}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Image */}
          {taman.gambar_utama && (
            <div>
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto Utama Taman
              </h3>
              <img
                src={getImageUrl(taman.gambar_utama)}
                alt={taman.name}
                className="w-full h-96 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                onError={(e) => {
                  console.error(
                    "Failed to load main image:",
                    taman.gambar_utama,
                  );
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Gallery */}
          {galleries.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Galeri Foto ({galleries.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleries.map((gallery) => (
                  <div key={gallery.id} className="group relative">
                    <img
                      src={getImageUrl(gallery.image_url)}
                      alt={gallery.title}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                      onError={(e) => {
                        console.error(
                          "Failed to load gallery image:",
                          gallery.image_url,
                        );
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {gallery.title && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {gallery.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-lg">Informasi Umum</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Nama</dt>
                  <dd className="font-medium">{taman.name || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Area (Ha)</dt>
                  <dd className="font-medium">
                    {taman.area_ha ? `${taman.area_ha} Ha` : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    SK Penetapan
                  </dt>
                  <dd className="font-medium">{taman.sk_penetapan || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Pengelola</dt>
                  <dd className="font-medium">{taman.pengelola || "-"}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-lg">Lokasi</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Provinsi</dt>
                  <dd className="font-medium">{taman.provinsi || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Kota/Kabupaten
                  </dt>
                  <dd className="font-medium">{taman.kota_kabupaten || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Kecamatan</dt>
                  <dd className="font-medium">{taman.kecamatan || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Desa/Kelurahan
                  </dt>
                  <dd className="font-medium">{taman.desa_kelurahan || "-"}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Description */}
          {taman.description && (
            <div>
              <h3 className="font-semibold mb-3 text-lg">Deskripsi</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {taman.description}
              </p>
            </div>
          )}

          {/* Additional Info */}
          {(taman.kondisi_fisik ||
            taman.nilai_penting ||
            taman.tipe_ekoregion) && (
            <div>
              <h3 className="font-semibold mb-3 text-lg">Informasi Tambahan</h3>
              <dl className="grid md:grid-cols-3 gap-4">
                {taman.kondisi_fisik && (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Kondisi Fisik
                    </dt>
                    <dd className="font-medium">{taman.kondisi_fisik}</dd>
                  </div>
                )}
                {taman.nilai_penting && (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Nilai Penting
                    </dt>
                    <dd className="font-medium">{taman.nilai_penting}</dd>
                  </div>
                )}
                {taman.tipe_ekoregion && (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Tipe Ekoregion
                    </dt>
                    <dd className="font-medium">{taman.tipe_ekoregion}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
              Metadata
            </h3>
            <dl className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-medium">{taman.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted By</dt>
                <dd className="font-medium">{taman.submitted_by || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>{getStatusBadge(taman.status)}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
