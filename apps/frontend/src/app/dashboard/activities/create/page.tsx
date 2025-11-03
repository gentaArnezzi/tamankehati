"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { imageUrl as buildImageUrl } from "@/lib/api-url";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Activity,
  Park,
  activitiesApi,
  parksApi,
} from "../../../../lib/api-client";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Calendar } from "../../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  CalendarIcon,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "../../../../lib/utils";
import { toast } from "sonner";
import { useAuth } from "../../../../lib/useAuth";
import { CollapsibleDashboardLayout } from "../../../../components/CollapsibleDashboardLayout";
import { RBACGuard } from "../../../../components/RBACGuard";

const activitySchema = z.object({
  title: z.string().min(1, "Judul kegiatan wajib diisi"),
  description: z.string().optional(),
  activity_date: z.string().min(1, "Tanggal kegiatan wajib diisi"),
  location: z.string().optional(),
  park_id: z.number().optional(),
  images: z.array(z.string()).optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

function CreateActivityPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parks, setParks] = useState<Park[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      activity_date: "",
      location: "",
      park_id: user?.park_id ?? 1,
    },
  });

  const { setValue } = form;

  // Load parks data
  useEffect(() => {
    const loadParks = async () => {
      try {
        const response = await parksApi.list({ limit: 100 });
        setParks(response.items);
      } catch (err) {
        console.error("Failed to load parks:", err);
        toast.error("Gagal memuat data taman");
      }
    };
    loadParks();
  }, []);

  // Sync date with form field
  useEffect(() => {
    if (date) {
      form.setValue("activity_date", format(date, "yyyy-MM-dd"));
    }
  }, [date, form]);

  // Sync images with form field
  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newFiles = Array.from(files);
      const newImageFiles = [...imageFiles, ...newFiles];
      const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));

      // Combine existing images with new images
      const combinedImages = [...existingImages, ...newImageUrls];

      setImageFiles(newImageFiles);
      setImages(combinedImages);
      toast.success(`${newFiles.length} gambar berhasil ditambahkan`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal menambahkan gambar");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const isExistingImage = index < existingImages.length;

    if (isExistingImage) {
      // Remove from existing images
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      // Update the combined images array
      setImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new files (adjust index for new files)
      const newFileIndex = index - existingImages.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
      // Update the combined images array
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      setIsSubmitting(true);

      const parkId = user?.park_id || data.park_id;
      if (!parkId) {
        toast.error("Park ID tidak tersedia. Silakan login ulang.");
        return;
      }

      const submitData = {
        ...data,
        activity_date: date ? format(date, "yyyy-MM-dd") : data.activity_date,
        park_id: parkId,
      };

      if (imageFiles.length > 0) {
        await activitiesApi.createWithImages({
          ...submitData,
          images: imageFiles,
        });
      } else {
        await activitiesApi.create(submitData);
      }

      toast.success("Kegiatan berhasil dibuat");
      router.push("/dashboard/activities");
    } catch (error) {
      console.error("Activity creation error:", error);
      const message =
        error instanceof Error ? error.message : "Gagal membuat kegiatan";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Buat Kegiatan Baru
            </h1>
            <p className="text-gray-700 mt-1 text-sm font-medium">
              Buat kegiatan konservasi baru untuk taman nasional
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
            style={{ backgroundColor: "#233c2b" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Kegiatan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Informasi Dasar */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kegiatan</CardTitle>
                <CardDescription>
                  Informasi utama kegiatan konservasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Kegiatan *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Penanaman Pohon Endemik"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Kegiatan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Penanaman pohon lokal bersama masyarakat sekitar"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Detail Kegiatan */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Kegiatan</CardTitle>
                <CardDescription>
                  Informasi detail waktu dan lokasi kegiatan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="activity_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Kegiatan *</FormLabel>
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !date && "text-muted-foreground",
                                )}
                              >
                                {date ? (
                                  format(date, "dd MMMM yyyy", { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasi Kegiatan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: Area Konservasi A"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {user?.role === "super_admin" && (
                  <FormField
                    control={form.control}
                    name="park_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taman Nasional</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih taman nasional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parks.map((park) => (
                              <SelectItem
                                key={park.id}
                                value={park.id.toString()}
                              >
                                {park.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Image Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Gambar Kegiatan</CardTitle>
                <CardDescription>
                  Upload gambar dokumentasi kegiatan (opsional, maksimal 10
                  gambar)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files)
                    }
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {uploading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mengupload gambar...
                        </span>
                      ) : (
                        "Klik untuk upload gambar atau drag & drop"
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      PNG, JPG, GIF hingga 10MB per file
                    </div>
                  </label>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => {
                      const isExistingImage = index < existingImages.length;
                      const imageUrl = isExistingImage
                        ? buildImageUrl(image)
                        : image; // For new files, image is already a blob URL

                      return (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Activity image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {isExistingImage && (
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                              Existing
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer Actions - Mobile */}
            <div className="md:hidden sticky bottom-0 bg-white border-t p-4 -mx-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  style={{ backgroundColor: "#233c2b" }}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function CreateActivityPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleNavigate = useCallback(
    (path: string) => {
      try {
        router.push(path);
      } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = path;
      }
    },
    [router],
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <RBACGuard allowedRoles={["regional_admin"]}>
      <CollapsibleDashboardLayout
        user={user}
        currentPath="/dashboard/activities/create"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <CreateActivityPageContent />
      </CollapsibleDashboardLayout>
    </RBACGuard>
  );
}
