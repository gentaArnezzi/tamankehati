"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
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
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "../../lib/utils";
import { Announcement } from "./AnnouncementsPage";
import { FileUpload } from "../ui/file-upload";
import { toast } from "sonner";

const announcementSchema = z.object({
  title: z
    .string()
    .min(1, "Judul wajib diisi")
    .max(255, "Judul maksimal 255 karakter"),
  content: z.string().min(1, "Konten wajib diisi"),
  summary: z.string().max(500, "Ringkasan maksimal 500 karakter").optional(),
  type: z.enum(["news", "announcement", "event", "maintenance"]),
  priority: z.number().min(0).max(2),
  is_featured: z.boolean(),
  is_pinned: z.boolean(),
  featured_image: z
    .string()
    .url("URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  attachments: z.string().optional(),
  tags: z.string().max(500, "Tags maksimal 500 karakter").optional(),
  expires_at: z.date().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Announcement>) => Promise<void>;
  initialData?: Announcement | null;
  mode: "create" | "edit";
}

const ANNOUNCEMENT_TYPES = [
  { value: "news", label: "Berita" },
  { value: "announcement", label: "Pengumuman" },
  { value: "event", label: "Acara" },
  { value: "maintenance", label: "Pemeliharaan" },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "Normal" },
  { value: 1, label: "Tinggi" },
  { value: 2, label: "Mendesak" },
];

export function AnnouncementForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: AnnouncementFormProps) {
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialData?.featured_image
  );

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      type: "news",
      priority: 0,
      is_featured: false,
      is_pinned: false,
      featured_image: "",
      attachments: "",
      tags: "",
      expires_at: undefined,
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        summary: initialData.summary || "",
        type: initialData.type,
        priority: initialData.priority,
        is_featured: initialData.is_featured,
        is_pinned: initialData.is_pinned,
        featured_image: initialData.featured_image || "",
        attachments: initialData.attachments || "",
        tags: initialData.tags || "",
        expires_at: initialData.expires_at
          ? new Date(initialData.expires_at)
          : undefined,
      });
      setExpiresAt(
        initialData.expires_at ? new Date(initialData.expires_at) : undefined,
      );
      setPreviewUrl(initialData.featured_image || undefined);
      setSelectedFile(null);
    } else {
      form.reset({
        title: "",
        content: "",
        summary: "",
        type: "news",
        priority: 0,
        is_featured: false,
        is_pinned: false,
        featured_image: "",
        attachments: "",
        tags: "",
        expires_at: undefined,
      });
      setExpiresAt(undefined);
      setPreviewUrl(undefined);
      setSelectedFile(null);
    }
  }, [initialData, mode, form]);

  const handleSubmit = async (data: AnnouncementFormData) => {
    try {
      setLoading(true);
      await onSubmit({
        ...data,
        id: initialData?.id, // Include ID for edit mode
        expires_at: expiresAt?.toISOString(),
      });
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleExpiresAtChange = (date: Date | undefined) => {
    setExpiresAt(date);
    form.setValue("expires_at", date);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080";

    const response = await fetch(`${baseUrl}/api/v1/upload/gallery-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.url;
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploading(true);

    try {
      const imageUrl = await uploadFile(file);
      form.setValue("featured_image", imageUrl);
      setPreviewUrl(imageUrl);
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Gagal mengupload gambar");
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(undefined);
    form.setValue("featured_image", "");
  };

  useEffect(() => {
    if (initialData?.featured_image) {
      setPreviewUrl(initialData.featured_image);
    } else {
      setPreviewUrl(undefined);
    }
    setSelectedFile(null);
  }, [initialData?.featured_image]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold break-words">
            {mode === "create" ? "Buat Pengumuman Baru" : "Edit Pengumuman"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground break-words">
            {mode === "create"
              ? "Buat pengumuman atau berita baru untuk pengguna"
              : "Edit pengumuman yang sudah ada"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg break-words">
                    Informasi Dasar
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm break-words">
                    Informasi utama pengumuman
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Judul *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan judul pengumuman"
                            className="text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Ringkasan
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ringkasan singkat pengumuman (opsional)"
                            className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Ringkasan akan ditampilkan di daftar pengumuman
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => {
                      const { formItemId } = useFormField();
                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Tipe *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="text-sm" id={formItemId}>
                                <SelectValue placeholder="Pilih tipe pengumuman" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ANNOUNCEMENT_TYPES.map((type) => (
                                <SelectItem
                                  key={type.value}
                                  value={type.value}
                                  className="text-sm"
                                >
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => {
                      const { formItemId } = useFormField();
                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Prioritas
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="text-sm" id={formItemId}>
                                <SelectValue placeholder="Pilih prioritas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRIORITY_OPTIONS.map((priority) => (
                                <SelectItem
                                  key={priority.value}
                                  value={priority.value.toString()}
                                  className="text-sm"
                                >
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg break-words">
                    Pengaturan
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm break-words">
                    Pengaturan tampilan dan perilaku
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                        <div className="space-y-0.5 flex-1 pr-2">
                          <FormLabel className="text-sm font-medium">
                            Featured
                          </FormLabel>
                          <FormDescription className="text-xs break-words">
                            Tampilkan sebagai pengumuman unggulan
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_pinned"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                        <div className="space-y-0.5 flex-1 pr-2">
                          <FormLabel className="text-sm font-medium">
                            Pin ke Atas
                          </FormLabel>
                          <FormDescription className="text-xs break-words">
                            Pin pengumuman ke bagian atas daftar
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => {
                      const { formItemId } = useFormField();
                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium">
                            Tanggal Kedaluwarsa
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal text-sm",
                                    !expiresAt && "text-muted-foreground",
                                  )}
                                  id={formItemId}
                                >
                                {expiresAt ? (
                                  format(expiresAt, "PPP", { locale: id })
                                ) : (
                                  <span className="truncate">
                                    Pilih tanggal kedaluwarsa (opsional)
                                  </span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50 flex-shrink-0" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={expiresAt}
                              onSelect={handleExpiresAtChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-xs">
                          Pengumuman akan otomatis diarsipkan setelah tanggal
                          ini
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg break-words">
                  Konten
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  Isi pengumuman yang akan ditampilkan kepada pengguna
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Konten *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tulis konten pengumuman di sini..."
                          className="min-h-[150px] sm:min-h-[200px] text-sm resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Gunakan format Markdown untuk styling
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Media & Attachments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg break-words">
                  Media & Lampiran
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  Gambar dan file lampiran untuk pengumuman
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <FormField
                  control={form.control}
                  name="featured_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Gambar Utama
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <FileUpload
                            onFileSelect={handleFileSelect}
                            onFileRemove={handleFileRemove}
                            selectedFile={selectedFile}
                            previewUrl={previewUrl}
                            maxSize={10}
                            acceptedTypes={[
                              "image/jpeg",
                              "image/png",
                              "image/gif",
                              "image/webp",
                            ]}
                          />
                          <Input
                            placeholder="Atau masukkan URL gambar (opsional)"
                            className="text-sm"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value) {
                                setPreviewUrl(e.target.value);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Upload gambar atau masukkan URL gambar yang akan ditampilkan sebagai thumbnail
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Lampiran
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="JSON string URL lampiran (opsional)"
                          className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Format JSON array: ["url1", "url2", "url3"]
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Tags
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tag1, Tag2, Tag3 (pisahkan dengan koma)"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Tags untuk kategorisasi dan pencarian
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-fit sm:flex-shrink-0 text-sm"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-fit sm:flex-shrink-0 text-sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className="truncate">
                  {mode === "create" ? "Buat Pengumuman" : "Simpan Perubahan"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
