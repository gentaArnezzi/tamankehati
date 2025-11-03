"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ArrowLeft,
  Save,
  Eye,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { sanitizeHtmlRich } from "../../utils/sanitizeHtml";
import { useAuth } from "../../lib/useAuth";

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
  status: z.enum(["draft", "published"]),
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

interface Artikel {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  excerpt: string;
  penulis: string;
  kategori: string;
  status: "draft" | "published";
  tanggal_publish?: string;
  gambar_cover?: string;
  created_at: string;
  updated_at: string;
}

interface ArtikelEditPageProps {
  articleId: string;
}

export function ArtikelEditPage({ articleId }: ArtikelEditPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState("");
  const [artikel, setArtikel] = useState<Artikel | null>(null);

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
    loadArtikel();
  }, [articleId]);

  const loadArtikel = async () => {
    try {
      setLoading(true);
      setError("");

      // TODO: Replace with actual API call
      // Simulate loading article data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - replace with actual API call
      const mockArtikel: Artikel = {
        id: articleId,
        judul: "Penemuan Spesies Baru Rafflesia di Bengkulu",
        slug: "penemuan-spesies-baru-rafflesia-bengkulu",
        excerpt:
          "Tim peneliti menemukan spesies baru Rafflesia dengan diameter bunga mencapai 1.2 meter di hutan lindung Bengkulu.",
        konten:
          "# Penemuan Spesies Baru Rafflesia di Bengkulu\n\nTim peneliti dari Universitas Indonesia berhasil menemukan spesies baru Rafflesia...",
        penulis: user?.nama || "Admin",
        kategori: "Penelitian",
        status: "published",
        tanggal_publish: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 5,
        ).toISOString(),
        gambar_cover:
          "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800",
        created_at: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 10,
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 5,
        ).toISOString(),
      };

      setArtikel(mockArtikel);
      form.reset({
        judul: mockArtikel.judul,
        kategori: mockArtikel.kategori,
        excerpt: mockArtikel.excerpt,
        konten: mockArtikel.konten,
        gambar_cover: mockArtikel.gambar_cover || "",
        status: mockArtikel.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat artikel");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ArtikelFormData) => {
    try {
      setSubmitting(true);

      // Generate slug from title
      const slug = data.judul
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Update article data
      const artikelData = {
        ...data,
        slug,
        penulis: user?.nama || "Admin",
        tanggal_publish:
          data.status === "published"
            ? artikel?.tanggal_publish || new Date().toISOString()
            : undefined,
        created_at: artikel?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // TODO: Replace with actual API call
      console.log("Updating article:", artikelData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Artikel berhasil diperbarui!");
      router.push("/dashboard/taman/berita");
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Gagal memperbarui artikel");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleBack = () => {
    router.back();
  };

  const formData = form.watch();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat artikel...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  if (!artikel) {
    return (
      <div className="text-center py-8">
        <p>Artikel tidak ditemukan</p>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Artikel</h1>
            <p className="text-muted-foreground">
              Edit artikel: {artikel.judul}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {formData.judul || "Judul Artikel"}
            </CardTitle>
            <CardDescription>
              {formData.excerpt || "Ringkasan artikel akan muncul di sini"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formData.gambar_cover && (
              <div className="mb-6">
                <img
                  src={formData.gambar_cover}
                  alt={formData.judul}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtmlRich(formData.konten.replace(/\n/g, "<br>")),
                }}
              />
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Kategori: {formData.kategori || "Belum dipilih"}</span>
                <span>
                  Status:{" "}
                  {formData.status === "published" ? "Diterbitkan" : "Draft"}
                </span>
                <span>Penulis: {user?.nama || "Admin"}</span>
                <span>
                  Terakhir diupdate: {new Date().toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Form Mode */
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informasi Artikel
                    </CardTitle>
                    <CardDescription>
                      Edit informasi dasar artikel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="judul"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul Artikel *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan judul artikel yang menarik"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Judul yang menarik akan meningkatkan engagement
                            pembaca
                          </FormDescription>
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
                                {KATEGORI_OPTIONS.map((kategori) => (
                                  <SelectItem key={kategori} value={kategori}>
                                    {kategori}
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
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                  Diterbitkan
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Draft: Simpan untuk diedit nanti. Diterbitkan:
                              Langsung publikasikan.
                            </FormDescription>
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
                              placeholder="Tulis ringkasan singkat artikel (akan muncul di halaman utama)"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Ringkasan yang baik akan menarik pembaca untuk
                            membaca artikel lengkap
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
                          <FormLabel>Gambar Cover</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            URL gambar yang akan digunakan sebagai cover artikel
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Konten Artikel</CardTitle>
                    <CardDescription>
                      Edit konten artikel yang informatif dan menarik
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="konten"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konten *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tulis konten artikel di sini..."
                              className="resize-none min-h-[400px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Gunakan format markdown untuk styling yang lebih
                            baik
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Artikel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm">Detail:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• ID: {artikel.id}</li>
                        <li>• Slug: {artikel.slug}</li>
                        <li>
                          • Dibuat:{" "}
                          {new Date(artikel.created_at).toLocaleDateString(
                            "id-ID",
                          )}
                        </li>
                        <li>
                          • Diupdate:{" "}
                          {new Date(artikel.updated_at).toLocaleDateString(
                            "id-ID",
                          )}
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Publikasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">
                          Draft: Artikel tersimpan tapi belum dipublikasikan
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">
                          Diterbitkan: Artikel langsung muncul di website
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleBack}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4 mr-2" />
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
