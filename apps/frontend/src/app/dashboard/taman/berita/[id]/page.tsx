"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { ArrowLeft, Pencil, Trash2, Eye, Calendar, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { imageUrl as buildImageUrl } from "../../../../../lib/api-url";
import { sanitizeHtmlRich } from "../../../../../utils/sanitizeHtml";

interface ArtikelDetail {
  id: string;
  judul: string;
  slug: string;
  excerpt: string;
  konten: string;
  penulis: string;
  kategori: string;
  status: "draft" | "approved";
  tanggal_publish: string | null;
  gambar_cover: string | null;
  created_at: string;
  updated_at: string;
}

export default function ArtikelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const returnPage = searchParams?.get('page') || '1';

  const [artikel, setArtikel] = useState<ArtikelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadArtikel();
    }
  }, [id]);

  const loadArtikel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push("/login");
        return;
      }

      if (response.status === 404) {
        toast.error("Artikel tidak ditemukan");
        router.push(`/dashboard/taman/berita?page=${returnPage}`);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load article");
      }

      const data = await response.json();
      setArtikel({
        id: String(data.id),
        judul: data.title || data.judul || "",
        slug: data.slug || "",
        excerpt: data.summary || data.excerpt || "",
        konten: data.content || data.konten || "",
        penulis: data.author || data.penulis || "Admin",
        kategori: data.category || data.kategori || "",
        status: data.status === "approved" ? "approved" : "draft",
        tanggal_publish: data.published_at || data.tanggal_publish || null,
        gambar_cover: data.featured_image || data.gambar_cover || null,
        created_at: data.created_at || "",
        updated_at: data.updated_at || "",
      });
    } catch (error) {
      console.error("Error loading article:", error);
      toast.error("Gagal memuat artikel");
      router.push(`/dashboard/taman/berita?page=${returnPage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!artikel) return;

    try {
      setPublishing(true);
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: artikel.judul,
            content: artikel.konten,
            summary: artikel.excerpt,
            category: artikel.kategori,
            featured_image: artikel.gambar_cover || null,
            status: "approved",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal mempublikasikan artikel");
      }

      toast.success("Artikel berhasil dipublikasikan!");
      loadArtikel(); // Reload to update status
    } catch (error) {
      console.error("Error publishing article:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mempublikasikan artikel"
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!artikel) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${artikel.judul}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal menghapus artikel");
      }

      toast.success("Artikel berhasil dihapus!");
      router.push(`/dashboard/taman/berita?page=${returnPage}`);
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus artikel"
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    return status === "approved" ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Dipublikasikan
      </Badge>
    ) : (
      <Badge variant="secondary">Draft</Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ab6c]"></div>
          <span className="text-gray-600">Memuat artikel...</span>
        </div>
      </div>
    );
  }

  if (!artikel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Artikel tidak ditemukan</p>
          <Button onClick={() => router.push(`/dashboard/taman/berita?page=${returnPage}`)}>
            Kembali ke Daftar Artikel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/dashboard/taman/berita?page=${returnPage}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Detail Artikel</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/taman/berita/edit/${id}?page=${returnPage}`)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {artikel.status === "draft" && (
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-[#00ab6c] hover:bg-[#008f56] text-white flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {publishing ? "Mempublikasikan..." : "Publikasikan"}
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(artikel.status)}
                      <Badge variant="outline">{artikel.kategori}</Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(artikel.tanggal_publish || artikel.created_at)}
                      </span>
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">
                      {artikel.judul}
                    </CardTitle>
                    {artikel.excerpt && (
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {artikel.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Cover Image */}
                {artikel.gambar_cover && (
                  <div className="mb-6">
                    <img
                      src={buildImageUrl(artikel.gambar_cover)}
                      alt={artikel.judul}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtmlRich(artikel.konten || ""),
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Article Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informasi Artikel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Penulis:</span>
                  <span className="font-medium">{artikel.penulis}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Dibuat:</span>
                  <span className="font-medium">{formatDate(artikel.created_at)}</span>
                </div>
                {artikel.updated_at !== artikel.created_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Diupdate:</span>
                    <span className="font-medium">{formatDate(artikel.updated_at)}</span>
                  </div>
                )}
                {artikel.tanggal_publish && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Dipublikasikan:</span>
                    <span className="font-medium">{formatDate(artikel.tanggal_publish)}</span>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <span className="text-sm text-gray-600">Kategori:</span>
                  <Badge variant="outline" className="ml-2">
                    {artikel.kategori}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="mt-1">
                    {getStatusBadge(artikel.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/taman/berita/edit/${id}?page=${returnPage}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Artikel
                </Button>
                {artikel.status === "draft" && (
                  <Button
                    className="w-full justify-start bg-[#00ab6c] hover:bg-[#008f56] text-white"
                    onClick={handlePublish}
                    disabled={publishing}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {publishing ? "Mempublikasikan..." : "Publikasikan"}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "Menghapus..." : "Hapus Artikel"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

