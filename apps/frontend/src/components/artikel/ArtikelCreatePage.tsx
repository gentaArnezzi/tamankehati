"use client";

import { useState } from "react";
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
import { ArrowLeft, Save, Eye, AlertCircle, FileText } from "lucide-react";
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

export function ArtikelCreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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

      // Create article via API
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/v1/articles/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: data.judul,
            content: data.konten,
            summary: data.excerpt,
            category: data.kategori,
            featured_image: data.gambar_cover || null,
            status: data.status,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Gagal membuat artikel");
      }

      const artikel = await response.json();
      console.log("Article created:", artikel);

      toast.success("Artikel berhasil dibuat!");
      router.push("/dashboard/taman/berita");
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Gagal membuat artikel");
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
            <h1 className="text-3xl font-bold">Buat Artikel Baru</h1>
            <p className="text-muted-foreground">
              Buat artikel edukasi dan berita konservasi
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
                      Isi informasi dasar artikel yang akan dibuat
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
                      Tulis konten artikel yang informatif dan menarik
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
                    <CardTitle>Panduan Penulisan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm">Tips Judul:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Gunakan kata kunci yang relevan</li>
                        <li>• Buat judul yang menarik perhatian</li>
                        <li>• Maksimal 60 karakter</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Tips Konten:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Gunakan subheading untuk struktur</li>
                        <li>• Sertakan data dan fakta</li>
                        <li>• Tambahkan gambar yang relevan</li>
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
                {submitting ? "Menyimpan..." : "Simpan Artikel"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
