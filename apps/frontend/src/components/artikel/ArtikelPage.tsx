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
    loadData();
  }, []);

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
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("q", searchQuery);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/v1/articles/?${params}`,
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
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/v1/articles/${artikel.id}`,
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
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/v1/articles/${artikel.id}`,
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8" style={{ color: "#356447" }} />
            Manajemen Artikel
          </h1>
          <p className="text-muted-foreground">
            Kelola konten artikel dan berita keanekaragaman hayati
          </p>
        </div>
        <Button onClick={handleCreate} style={{ backgroundColor: "#233c2b" }}>
          <Plus className="mr-2 h-4 w-4" />
          Tulis Artikel
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul atau konten artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadData} variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Total Artikel
            </div>
            <div className="text-2xl">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Dipublikasikan
            </div>
            <div className="text-2xl">
              {data.filter((a) => a.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Draft</div>
            <div className="text-2xl">
              {data.filter((a) => a.status === "draft").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-24 bg-gray-100 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Belum ada artikel</p>
            </CardContent>
          </Card>
        ) : (
          data.map((artikel) => (
            <Card key={artikel.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{artikel.kategori}</Badge>
                      {getStatusBadge(artikel.status)}
                    </div>
                    <CardTitle className="mb-2">{artikel.judul}</CardTitle>
                    <CardDescription>
                      {artikel.penulis} • {formatDate(artikel.updated_at)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {artikel.excerpt}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(artikel)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {artikel.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublish(artikel)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Publikasikan
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(artikel)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
                <Button type="submit" style={{ backgroundColor: "#233c2b" }}>
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
