import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Plus, Search, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Eye } from "lucide-react";
import { cleanArticleExcerpt } from "../../utils/text";
import { imageUrl } from "../../lib/api-url";

interface Artikel {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  excerpt: string;
  penulis: string;
  kategori: string;
  status: "draft" | "approved";
  tanggal_publish?: string;
  gambar_cover?: string;
  created_at: string;
  updated_at: string;
}

const artikelSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  kategori: z.string().min(1, "Kategori wajib dipilih"),
  excerpt: z.string().min(1, "Ringkasan wajib diisi"),
  konten: z.string().min(1, "Konten wajib diisi"),
  gambar_cover: z
    .string()
    .url("URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  status: z.enum(["draft", "approved"]),
});

type ArtikelFormData = z.infer<typeof artikelSchema>;

const KATEGORI_OPTIONS = [
  "Konservasi",
  "Penelitian",
  "Edukasi",
  "Berita",
  "Laporan Lapangan",
  "Kebijakan",
];

export function ArtikelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const form = useForm<ArtikelFormData>({
    resolver: zodResolver(artikelSchema),
    defaultValues: {
      judul: "",
      kategori: "",
      excerpt: "",
      konten: "",
      gambar_cover: "",
      status: "draft",
    },
  });

  useEffect(() => {
    // Reset to page 1 when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    if (formOpen && selectedArtikel) {
      form.reset({
        judul: selectedArtikel.judul,
        kategori: selectedArtikel.kategori,
        excerpt: selectedArtikel.excerpt,
        konten: selectedArtikel.konten,
        gambar_cover: selectedArtikel.gambar_cover || "",
        status: selectedArtikel.status,
      });
    } else if (formOpen && !selectedArtikel) {
      form.reset({
        judul: "",
        kategori: "",
        excerpt: "",
        konten: "",
        gambar_cover: "",
        status: "draft",
      });
    }
  }, [formOpen, selectedArtikel]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch articles from API
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      });
      if (searchQuery) {
        params.append("q", searchQuery);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat artikel");
      }

      const result = await response.json();

      // Map backend response to frontend format
      const articles: Artikel[] = result.items.map((item: any) => ({
        id: String(item.id),
        judul: item.title,
        slug: item.slug || "",
        excerpt: item.summary || item.excerpt || "",
        konten: item.content || "",
        penulis: user?.nama || "Admin",
        kategori: item.category || "Umum",
        status: item.status as "draft" | "approved",
        tanggal_publish: item.published_at,
        gambar_cover: item.featured_image,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setData(articles);
      setTotalItems(result.total || result.items.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data artikel",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push("/dashboard/taman/berita/create");
  };

  const handleEdit = (artikel: Artikel) => {
    router.push(`/dashboard/taman/berita/edit/${artikel.id}`);
  };

  const handleSubmit = async (formData: ArtikelFormData) => {
    try {
      if (formMode === "create") {
        toast.success("Artikel berhasil ditambahkan");
      } else {
        toast.success("Artikel berhasil diperbarui");
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      toast.error("Gagal menyimpan artikel");
      throw err;
    }
  };

  const handlePublish = async (artikel: Artikel) => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${artikel.id}`,
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
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal mempublikasikan artikel");
      }

      toast.success("Artikel berhasil dipublikasikan!");
      loadData(); // Reload the list
    } catch (error) {
      console.error("Error publishing article:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mempublikasikan artikel",
      );
    }
  };

  const handleDelete = async (artikel: Artikel) => {
    // Confirm delete
    if (
      !confirm(`Apakah Anda yakin ingin menghapus artikel "${artikel.judul}"?`)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast.error("Anda harus login terlebih dahulu");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080"}/api/v1/articles/${artikel.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal menghapus artikel");
      }

      toast.success("Artikel berhasil dihapus!");
      loadData(); // Reload the list
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus artikel",
      );
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const publishedCount = data.filter((a) => a.status === "approved").length;
  const draftCount = data.filter((a) => a.status === "draft").length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Artikel & Berita
              </h1>
              <p className="text-sm text-gray-500">
                Kelola konten artikel dan berita keanekaragaman hayati
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-[#00ab6c] hover:bg-[#008f56] text-white font-medium px-6 py-2 rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tulis Artikel
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
              <span className="text-lg font-semibold text-gray-900">{data.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Dipublikasikan:</span>
              <span className="text-lg font-semibold text-green-600">{publishedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Draft:</span>
              <span className="text-lg font-semibold text-gray-600">{draftCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari artikel..."
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
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Articles List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
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
        ) : data.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum ada artikel
            </h3>
            <p className="text-gray-500 mb-6">
              Mulai menulis artikel pertama Anda
            </p>
            <Button
              onClick={handleCreate}
              className="bg-[#00ab6c] hover:bg-[#008f56] text-white font-medium px-6 py-2 rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tulis Artikel Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {data.map((artikel, index) => {
              const coverImage = artikel.gambar_cover;
              const hasImageError = imageErrors.has(artikel.id);
              const showPlaceholder = !coverImage || hasImageError;
              
              return (
                <div
                  key={artikel.id}
                  className={`group border-b border-gray-200 py-6 hover:bg-gray-50 transition-colors ${
                    index === 0 ? "border-t border-gray-200" : ""
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Cover Image */}
                    <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {showPlaceholder ? (
                        <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                          <FileText className="w-8 h-8 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500 leading-tight">
                            Gambar utama tidak tersedia
                          </p>
                        </div>
                      ) : (
                        <img
                          src={imageUrl(coverImage)}
                          alt={artikel.judul}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrors((prev) => new Set(prev).add(artikel.id));
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(artikel.status)}
                          <Badge variant="outline" className="text-xs">
                            {artikel.kategori}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(artikel.updated_at)}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#00ab6c] transition-colors line-clamp-2">
                          {artikel.judul}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {cleanArticleExcerpt(artikel.excerpt) || "Tidak ada ringkasan"}
                        </p>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(artikel)}
                            className="text-gray-700 hover:text-[#00ab6c] hover:bg-gray-100"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(artikel)}
                            className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                      {/* Publish Button - Separated on the right */}
                      {artikel.status === "draft" && (
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => handlePublish(artikel)}
                            className="bg-[#00ab6c] hover:bg-[#008f56] text-white font-medium px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Publikasikan
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
      {(() => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return null;
        
        return (
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
        );
      })()}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Tulis Artikel Baru" : "Edit Artikel"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Buat artikel atau berita baru tentang keanekaragaman hayati."
                : "Perbarui konten artikel."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="judul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Artikel *</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul artikel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="kategori"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {KATEGORI_OPTIONS.map((kat) => (
                            <SelectItem key={kat} value={kat}>
                              {kat}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="approved">Publikasikan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ringkasan *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ringkasan singkat artikel (maksimal 200 karakter)"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ringkasan ini akan muncul di halaman daftar artikel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="konten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konten Artikel *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tulis konten artikel di sini (mendukung Markdown)"
                        rows={12}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Gunakan Markdown untuk format teks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gambar_cover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Cover</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/gambar.jpg"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                  {formMode === "create"
                    ? "Simpan Artikel"
                    : "Perbarui Artikel"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
