import { useState, useEffect } from "react";
import { getApiUrl, imageUrl as buildImageUrl } from "../../lib/api-url";
import { useAuth } from "../../lib/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Plus,
  Search,
  Image as ImageIcon,
  AlertCircle,
  Download,
} from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { FileUpload } from "../ui/file-upload";
import { galleryApi } from "../../lib/api-client";

interface Media {
  id: string;
  judul: string;
  deskripsi: string;
  url: string;
  jenis: "flora" | "fauna" | "landscape" | "lainnya";
  wilayah: string;
  photographer: string;
  tanggal_upload: string;
  tags: string[];
}

const mediaSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().optional(),
  url: z.string().optional(), // Made optional for file upload
  jenis: z.enum(["flora", "fauna", "landscape", "lainnya"]),
  wilayah: z.string().min(1, "Wilayah wajib dipilih"),
  tags: z.string().optional(),
});

type MediaFormData = z.infer<typeof mediaSchema>;

const WILAYAH_OPTIONS = [
  "Aceh",
  "Sumatera Utara",
  "Bengkulu",
  "Kalimantan Timur",
  "Kalimantan Tengah",
  "Sulawesi Selatan",
  "Papua",
  "Jawa Barat",
  "Bali",
];

export function GaleriPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("all");
  const [wilayahFilter, setWilayahFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      judul: "",
      deskripsi: "",
      url: "",
      jenis: "flora",
      wilayah: "", // wilayah field removed from User type
      tags: "",
    },
  });

  useEffect(() => {
    loadData();
  }, [jenisFilter, wilayahFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("GaleriPage: Starting to load data...");

      // Check authentication
      const token = localStorage.getItem("auth_token");
      console.log("GaleriPage: Auth token exists:", !!token);
      console.log(
        "GaleriPage: Token value:",
        token ? token.substring(0, 20) + "..." : "null",
      );

      // Try to fetch real data from API first
      let apiData: Media[] = [];
      try {
        console.log("GaleriPage: Calling galleryApi.list...");
        const response = await galleryApi.list({
          limit: 50,
          offset: 0,
        });

        console.log("GaleriPage: API response received:", response);
        console.log(
          "GaleriPage: Response items count:",
          response.items?.length || 0,
        );

        // Convert API response to Media format
        apiData = response.items.map((item: any) => {
          // Always use centralized helper to normalize URLs (handles localhost:8000)
          let normalizedImageUrl = buildImageUrl(item.image_url);

          // Validate URL format
          if (
            !normalizedImageUrl ||
            (!normalizedImageUrl.startsWith("http") && !normalizedImageUrl.startsWith("data:"))
          ) {
            console.warn(
              "Invalid image URL for item:",
              item.id,
              "URL:",
              normalizedImageUrl,
            );
            normalizedImageUrl =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
          }

          console.log("Processing gallery item:", {
            id: item.id,
            title: item.title,
            original_image_url: item.image_url,
            final_url: normalizedImageUrl,
          });

          return {
            id: item.id.toString(),
            judul: item.title,
            deskripsi: item.description || "",
            url: normalizedImageUrl,
            jenis: "flora", // Default, you might want to add category field
            wilayah: "Indonesia", // Region-based addressing removed - using user-based access control
            photographer: "User", // You might want to add author info
            tanggal_upload: item.created_at,
            tags: [], // You might want to add tags field
          };
        });

        console.log("Loaded gallery data from API:", apiData.length, "items");
      } catch (apiError) {
        console.error("GaleriPage: API fetch failed:", apiError);
        console.error("GaleriPage: API error details:", {
          message:
            apiError instanceof Error ? apiError.message : String(apiError),
          stack: apiError instanceof Error ? apiError.stack : undefined,
          name: apiError instanceof Error ? apiError.name : "Unknown",
        });
        console.warn("API fetch failed, using empty data:", apiError);

        // No fallback data - use empty array to make debugging easier
        apiData = [];
      }

      let filteredData = apiData;
      if (jenisFilter !== "all") {
        filteredData = filteredData.filter(
          (item) => item.jenis === jenisFilter,
        );
      }
      if (wilayahFilter !== "all") {
        filteredData = filteredData.filter(
          (item) => item.wilayah === wilayahFilter,
        );
      }
      if (searchQuery) {
        filteredData = filteredData.filter(
          (item) =>
            item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        );
      }

      console.log(
        "GaleriPage: Setting data with",
        filteredData.length,
        "items",
      );
      console.log("GaleriPage: Filtered data:", filteredData);
      setData(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    console.log("Uploading file:", file.name, "Size:", (file.size / 1024 / 1024).toFixed(2) + "MB");

    // Import compression utility
    const { compressImage, needsCompression } = await import("../../utils/imageCompression");
    
    // Compress image if needed (files > 3MB)
    let fileToUpload = file;
    if (needsCompression(file, 3)) {
      try {
        console.log("📸 Compressing image before upload...");
        fileToUpload = await compressImage(file, {
          maxSizeMB: 2,              // Target 2MB
          maxWidthOrHeight: 1920,    // Max 1920px
          quality: 0.8,               // 80% quality
        });
        console.log(`✅ Compression complete: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
      } catch (error) {
        console.warn("⚠️ Compression failed, using original file:", error);
        // Continue with original file if compression fails
      }
    }

    // Check file size before upload (client-side validation)
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileToUpload.size > maxSizeBytes) {
      throw new Error(`File terlalu besar. Maksimal ${maxSizeMB}MB. File Anda: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }

      console.log("Token found, proceeding with upload...");

      // Try direct fetch first as fallback
      const formData = new FormData();
      formData.append("file", fileToUpload);

      // Add timeout for upload (2 minutes for large files)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

      try {
        const response = await fetch(
          getApiUrl() +
            "/api/v1/upload/gallery-image",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
            },
            body: formData,
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);
        console.log("Upload response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload error response:", errorText);
          
          // Better error messages
          if (response.status === 413) {
            throw new Error("File terlalu besar. Maksimal 10MB.");
          } else if (response.status === 400) {
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(errorData.detail || "Upload gagal. Periksa format file.");
            } catch {
              throw new Error(errorText || "Upload gagal. Periksa file Anda.");
            }
          } else if (response.status === 504 || response.status === 502) {
            throw new Error("Server timeout. Coba lagi atau kurangi ukuran file.");
          }
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Upload success:", result);
        return result.url;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error("Upload timeout. File terlalu besar atau koneksi lambat. Coba kurangi ukuran file atau coba lagi.");
        }
        throw err;
      }
    } catch (error) {
      console.error("Upload error details:", error);

      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Network error: Cannot connect to server. Please check if backend is running.",
          );
        } else if (error.message.includes("401")) {
          throw new Error("Authentication failed. Please login again.");
        } else if (error.message.includes("403")) {
          throw new Error(
            "Access denied. You do not have permission to upload files.",
          );
        } else if (error.message.includes("413")) {
          throw new Error("File too large. Please choose a smaller file.");
        } else if (error.message.includes("422")) {
          throw new Error("Invalid file type. Please upload an image file.");
        }
      }

      throw new Error(`Upload failed: ${error}`);
    }
  };

  const handleSubmit = async (formData: MediaFormData) => {
    try {
      setUploading(true);

      let imageUrl = formData.url;

      // If file is selected, upload it first
      if (selectedFile) {
        console.log("Uploading file:", selectedFile.name);
        imageUrl = await uploadFile(selectedFile);
        console.log("File uploaded successfully, URL:", imageUrl);
      }

      if (!imageUrl) {
        throw new Error("URL gambar atau file harus disediakan");
      }

      // Create gallery item with uploaded URL
      const galleryData = {
        title: formData.judul,
        description: formData.deskripsi,
        image_url: imageUrl,
        // region_code: formData.wilayah,  // Removed - using user-based access control
      };

      console.log("Creating gallery item:", galleryData);

      // Call gallery API to create the gallery item
      await galleryApi.create(galleryData);

      toast.success("Media berhasil ditambahkan ke galeri");
      setFormOpen(false);
      form.reset();
      setSelectedFile(null);
      loadData();
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal mengunggah media";
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleView = (media: Media) => {
    setSelectedMedia(media);
    setViewOpen(true);
  };

  const getJenisBadge = (jenis: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      flora: { label: "Flora", className: "bg-green-100 text-green-800" },
      fauna: { label: "Fauna", className: "bg-blue-100 text-blue-800" },
      landscape: {
        label: "Landscape",
        className: "bg-purple-100 text-purple-800",
      },
      lainnya: { label: "Lainnya", className: "bg-gray-100 text-gray-800" },
    };
    const config = variants[jenis] || variants.lainnya;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl mb-2 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: "#356447" }} />
            Galeri Media
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kelola koleksi foto dan video keanekaragaman hayati Indonesia
          </p>
        </div>
        <div className="flex-shrink-0 sm:flex-none sm:w-auto sm:max-w-fit">
          <Button
            onClick={() => setFormOpen(true)}
            className="w-full sm:w-fit sm:min-w-0 sm:max-w-none sm:whitespace-nowrap bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Media
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari judul, deskripsi, atau tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={loadData} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Select value={jenisFilter} onValueChange={setJenisFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="flora">Flora</SelectItem>
                <SelectItem value="fauna">Fauna</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>

            <Select value={wilayahFilter} onValueChange={setWilayahFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Wilayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Wilayah</SelectItem>
                {WILAYAH_OPTIONS.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Total Media
            </div>
            <div className="text-2xl">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Flora</div>
            <div className="text-2xl">
              {data.filter((m) => m.jenis === "flora").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Fauna</div>
            <div className="text-2xl">
              {data.filter((m) => m.jenis === "fauna").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Landscape</div>
            <div className="text-2xl">
              {data.filter((m) => m.jenis === "landscape").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse"></div>
              <CardContent className="pt-4">
                <div className="h-4 bg-gray-100 animate-pulse rounded mb-2"></div>
                <div className="h-3 bg-gray-100 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : data.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Belum ada media di galeri
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          data.map((media) => (
            <Card
              key={media.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleView(media)}
            >
              <div className="aspect-square relative">
                <img
                  src={media.url}
                  alt={media.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn("Image load error for:", media.url);
                    // Set a placeholder image
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
                    e.currentTarget.onerror = null; // Prevent infinite loop
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", media.url);
                  }}
                />
                <div className="absolute top-2 right-2">
                  {getJenisBadge(media.jenis)}
                </div>
              </div>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-1 line-clamp-1">{media.judul}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {media.deskripsi}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{media.wilayah}</span>
                  <span>{formatDate(media.tanggal_upload)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Media Baru</DialogTitle>
            <DialogDescription>
              Unggah foto atau video dokumentasi keanekaragaman hayati
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
                    <FormLabel>Judul *</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul media" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Upload Gambar</label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    onFileRemove={() => setSelectedFile(null)}
                    selectedFile={selectedFile}
                    maxSize={10}
                    className="mt-2"
                  />
                </div>

                <div className="text-center text-sm text-gray-500">atau</div>

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Media</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/gambar.jpg"
                          type="url"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL gambar dari sumber eksternal (opsional jika sudah
                        upload file)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="jenis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flora">Flora</SelectItem>
                          <SelectItem value="fauna">Fauna</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                          <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wilayah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wilayah *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih wilayah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WILAYAH_OPTIONS.map((w) => (
                            <SelectItem key={w} value={w}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi media..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="flora, endemik, rafflesia (pisahkan dengan koma)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Pisahkan dengan koma untuk multiple tags
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  disabled={uploading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white"
                  disabled={uploading}
                >
                  {uploading ? "Mengunggah..." : "Simpan Media"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.judul}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.judul}
                    className="w-full max-h-[60vh] object-contain bg-gray-100"
                    onError={(e) => {
                      console.warn(
                        "Image load error in modal for:",
                        selectedMedia.url,
                      );
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
                      e.currentTarget.onerror = null; // Prevent infinite loop
                    }}
                  />
                </div>
                <div className="space-y-2">
                  {getJenisBadge(selectedMedia.jenis)}
                  <p className="text-sm">{selectedMedia.deskripsi}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <strong>Wilayah:</strong> {selectedMedia.wilayah}
                    </div>
                    <div>
                      <strong>Fotografer:</strong> {selectedMedia.photographer}
                    </div>
                    <div>
                      <strong>Tanggal:</strong>{" "}
                      {formatDate(selectedMedia.tanggal_upload)}
                    </div>
                    <div>
                      <strong>Tags:</strong> {selectedMedia.tags.join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
