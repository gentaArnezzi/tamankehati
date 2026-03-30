"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Activity, Park, activitiesApi } from "../../lib/api-client";
import { Button } from "../ui/button";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Upload, X, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

const activitySchema = z.object({
  title: z.string().min(1, "Judul kegiatan wajib diisi"),
  description: z.string().optional(),
  activity_date: z.string().min(1, "Tanggal kegiatan wajib diisi"),
  location: z.string().optional(),
  park_id: z.number().optional(),
  images: z.array(z.string()).optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  activity?: Activity | null;
  parks: Park[];
  userParkId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ActivityForm({
  activity,
  parks,
  userParkId,
  onSuccess,
  onCancel,
}: ActivityFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    activity?.activity_date ? new Date(activity.activity_date) : undefined,
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(
    activity?.images || [],
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>(activity?.images || []);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: activity?.title ?? "",
      description: activity?.description ?? "",
      activity_date: activity?.activity_date ?? "",
      location: activity?.location ?? "",
      park_id: activity?.park_id ?? userParkId ?? 1,
      images: activity?.images ?? [],
    },
  });

  const { setValue } = form;

  const resetFormValues = (activity?: Activity | null) => {
    form.reset({
      title: activity?.title ?? "",
      description: activity?.description ?? "",
      activity_date: activity?.activity_date ?? "",
      location: activity?.location ?? "",
      park_id: activity?.park_id ?? userParkId ?? 1,
    });
    setDate(
      activity?.activity_date ? new Date(activity.activity_date) : undefined,
    );
  };

  useEffect(() => {
    resetFormValues(activity);
  }, [activity]);

  // Sync date with form field
  useEffect(() => {
    if (date) {
      form.setValue("activity_date", format(date, "yyyy-MM-dd"));
    }
  }, [date, form]);

  // Sync existing images when activity changes
  useEffect(() => {
    if (activity?.images) {
      setExistingImages(activity.images);
      setImages(activity.images);
    }
  }, [activity?.images]);

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
      setValue("images", combinedImages);
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
      setSubmitting(true);

      const submitData = {
        ...data,
        activity_date: date ? format(date, "yyyy-MM-dd") : data.activity_date,
        park_id: userParkId || data.park_id || 1,
      };

      if (activity) {
        // Update existing activity
        if (
          imageFiles.length > 0 ||
          existingImages.length !== (activity.images?.length || 0)
        ) {
          // If there are new files or existing images were modified, use with-images endpoint
          await activitiesApi.updateWithImages(activity.id, {
            ...submitData,
            images: imageFiles,
            existing_images: existingImages, // Send existing images separately
          });
        } else {
          await activitiesApi.update(activity.id, submitData);
        }
      } else {
        // Create new activity
        if (imageFiles.length > 0) {
          await activitiesApi.createWithImages({
            ...submitData,
            images: imageFiles,
          });
        } else {
          await activitiesApi.create(submitData);
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Activity form submit error:", error);
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="activity_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Pelaksanaan *</FormLabel>
                <div className="relative">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCalendarOpen(!calendarOpen);
                        }}
                      >
                        {date ? (
                          format(date, "dd MMMM yyyy", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          if (selectedDate) {
                            field.onChange(format(selectedDate, "yyyy-MM-dd"));
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {/* Hidden input for form validation */}
                  <input type="hidden" {...field} value={field.value || ""} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Taman</FormLabel>
            <div className="flex items-center gap-2 px-3 py-2 border border-input bg-input-background rounded-md text-sm">
              <span className="text-muted-foreground">
                {parks.find((park) => park.id === userParkId)?.name ||
                  "Taman tidak ditemukan"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taman otomatis mengikuti akun Anda
            </p>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi Kegiatan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Area tengah taman" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload Section */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gambar Kegiatan</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleImageUpload(e.target.files);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">
                        {uploading ? "Mengupload..." : "Upload Gambar"}
                      </span>
                    </label>
                    <span className="text-xs text-muted-foreground">
                      Maksimal 10 gambar
                    </span>
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => {
                        const isExistingImage = index < existingImages.length;
                        const imageUrl = isExistingImage
                          ? `${process.env.NEXT_PUBLIC_API_URL || "http://103.125.91.16"}${image}`
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

                  {images.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-300 rounded-lg">
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Belum ada gambar</p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? "Menyimpan..." : activity ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
