import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Flora } from "../../lib/api-client";
import { getApiUrl, imageUrl as buildImageUrl } from "../../lib/api-url";
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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAuth } from "../../lib/useAuth";
import { FileUpload } from "../ui/file-upload";
import { MultipleFileUpload } from "../ui/multiple-file-upload";

const floraSchema = z.object({
  nama_ilmiah: z.string().min(1, "Nama ilmiah wajib diisi"),
  nama_umum: z.string().optional(),
  kelas: z.string().optional(),
  famili: z.string().optional(),
  genus: z.string().optional(),
  sinonim: z.string().optional(),
  status_iucn: z.string().optional(),
  deskripsi: z.string().optional(),
  habitat: z.string().optional(),
  morfologi: z.string().optional(),
  waktu_berbunga: z.string().optional(),
  penyebaran: z.string().optional(),
  metode_perbanyakan: z.string().optional(),
  manfaat: z.string().optional(),
  referensi: z.string().optional(),
  is_endemic: z.boolean().optional(),
  park_id: z.number().optional(),
  gambar_utama: z.string().optional(),
  gambar_daun: z.string().optional(),
  gambar_batang: z.string().optional(),
  gambar_bunga: z.string().optional(),
  gambar_buah: z.string().optional(),
  status: z.enum(["draft", "in_review", "approved", "rejected"]).optional(),
});

type FloraFormData = z.infer<typeof floraSchema>;

interface FloraFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Flora>) => Promise<Flora | undefined>;
  initialData?: Flora | null;
  mode: "create" | "edit";
}

const IUCN_STATUS_OPTIONS = [
  { value: "LC", label: "LC - Least Concern (Risiko Rendah)" },
  { value: "NT", label: "NT - Near Threatened (Hampir Terancam)" },
  { value: "VU", label: "VU - Vulnerable (Rentan)" },
  { value: "EN", label: "EN - Endangered (Genting)" },
  { value: "CR", label: "CR - Critically Endangered (Kritis)" },
  { value: "DD", label: "DD - Data Deficient (Data Kurang)" },
  { value: "NE", label: "NE - Not Evaluated (Belum Dievaluasi)" },
];

export function FloraForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: FloraFormProps) {
  const { user } = useAuth();
  const base =
    getApiUrl();
  // Removed zone-related state as we now use park_id

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ file: File; preview: string; id: string }>
  >([]);
  const [selectedLeafImage, setSelectedLeafImage] = useState<File | null>(null);
  const [selectedStemImage, setSelectedStemImage] = useState<File | null>(null);
  const [selectedFlowerImage, setSelectedFlowerImage] = useState<File | null>(
    null,
  );
  const [selectedFruitImage, setSelectedFruitImage] = useState<File | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);

  // Existing gallery images (for edit mode)
  const [existingGalleries, setExistingGalleries] = useState<
    Array<{ id: number; title: string; image_url: string }>
  >([]);
  const [loadingGalleries, setLoadingGalleries] = useState(false);
  const [galleriesToDelete, setGalleriesToDelete] = useState<Set<number>>(
    new Set(),
  );

  const form = useForm<FloraFormData>({
    resolver: zodResolver(floraSchema),
    defaultValues: {
      nama_ilmiah: initialData?.nama_ilmiah ?? "",
      nama_umum: initialData?.nama_umum ?? "",
      kelas: initialData?.kelas ?? "",
      famili: initialData?.famili ?? "",
      genus: initialData?.genus ?? "",
      sinonim: initialData?.sinonim ?? "",
      status_iucn: initialData?.status_iucn ?? "",
      deskripsi: initialData?.deskripsi ?? "",
      habitat: initialData?.habitat ?? "",
      morfologi: initialData?.morfologi ?? "",
      waktu_berbunga: initialData?.waktu_berbunga ?? "",
      penyebaran: initialData?.penyebaran ?? "",
      metode_perbanyakan: initialData?.metode_perbanyakan ?? "",
      manfaat: initialData?.manfaat ?? "",
      referensi: initialData?.referensi ?? "",
      status:
        initialData?.status ??
        (user?.role === "regional_admin" ? "draft" : "approved"),
      is_endemic: initialData?.is_endemic ?? false,
      park_id: initialData?.park_id ?? 1,
      gambar_utama: initialData?.gambar_utama ?? "",
      gambar_daun: initialData?.gambar_daun ?? "",
      gambar_batang: initialData?.gambar_batang ?? "",
      gambar_bunga: initialData?.gambar_bunga ?? "",
      gambar_buah: initialData?.gambar_buah ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;

    // Debug: Log the initial data
    console.log("FloraForm - initialData:", initialData);
    console.log("FloraForm - mode:", mode);

    const formData = {
      nama_ilmiah: initialData?.nama_ilmiah ?? "",
      nama_umum: initialData?.nama_umum ?? "",
      kelas: initialData?.kelas ?? "",
      famili: initialData?.famili ?? "",
      genus: initialData?.genus ?? "",
      sinonim: initialData?.sinonim ?? "",
      status_iucn: initialData?.status_iucn ?? "",
      deskripsi: initialData?.deskripsi ?? "",
      habitat: initialData?.habitat ?? "",
      morfologi: initialData?.morfologi ?? "",
      waktu_berbunga: initialData?.waktu_berbunga ?? "",
      penyebaran: initialData?.penyebaran ?? "",
      metode_perbanyakan: initialData?.metode_perbanyakan ?? "",
      manfaat: initialData?.manfaat ?? "",
      referensi: initialData?.referensi ?? "",
      is_endemic: initialData?.is_endemic ?? false,
      park_id: initialData?.park_id ?? 1,
      gambar_utama: initialData?.gambar_utama ?? "",
      gambar_daun: initialData?.gambar_daun ?? "",
      gambar_batang: initialData?.gambar_batang ?? "",
      gambar_bunga: initialData?.gambar_bunga ?? "",
      gambar_buah: initialData?.gambar_buah ?? "",
    };

    console.log("FloraForm - formData to reset:", formData);
    form.reset(formData);

    // Fetch existing galleries in edit mode
    if (mode === "edit" && initialData?.id) {
      fetchExistingGalleries(initialData.id);
    } else {
      setExistingGalleries([]);
    }
  }, [form, initialData, open, mode]);

  const fetchExistingGalleries = async (floraId: string | number) => {
    setLoadingGalleries(true);
    try {
      // ✅ Fix: Use correct endpoint with entity_type and entity_id in path
      const response = await fetch(
        base + "/api/v1/galleries/entity/flora/" + floraId,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("auth_token"),
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        // Backend returns { success: true, data: [...], total: n }
        const galleries =
          result.data || result.items || (Array.isArray(result) ? result : []);
        setExistingGalleries(galleries);
        console.log(
          "✅ Existing galleries loaded for flora",
          floraId,
          ":",
          galleries.length,
          "images",
        );
      } else {
        console.error(
          "Failed to fetch galleries:",
          response.status,
          response.statusText,
        );
        setExistingGalleries([]);
      }
    } catch (error) {
      console.error("Error fetching existing galleries:", error);
      setExistingGalleries([]);
    } finally {
      setLoadingGalleries(false);
    }
  };

  const markGalleryForDeletion = (galleryId: number) => {
    if (
      !confirm(
        'Tandai gambar ini untuk dihapus?\n\nGambar akan dihapus permanent saat Anda klik "Submit untuk Review".',
      )
    ) {
      return;
    }

    // Mark for deletion (will be deleted on form submit)
    setGalleriesToDelete((prev) => new Set(Array.from(prev).concat([galleryId])));
    console.log("Gallery marked for deletion:", galleryId);
  };

  const unmarkGalleryForDeletion = (galleryId: number) => {
    // Unmark (restore)
    setGalleriesToDelete((prev) => {
      const newSet = new Set(prev);
      newSet.delete(galleryId);
      return newSet;
    });
    console.log("Gallery unmarked:", galleryId);
  };

  const deleteMarkedGalleries = async () => {
    // Actually delete galleries that were marked
    const deletePromises = Array.from(galleriesToDelete).map(
      async (galleryId) => {
        try {
          const response = await fetch(
            base + "/api/v1/galleries/" + galleryId,
            {
              method: "DELETE",
              headers: {
                Authorization: "Bearer " + localStorage.getItem("auth_token"),
              },
            },
          );

          if (response.ok) {
            console.log("✅ Gallery deleted:", galleryId);
            return { success: true, id: galleryId };
          } else {
            console.error(
              "❌ Failed to delete gallery:",
              galleryId,
              response.status,
            );
            return { success: false, id: galleryId };
          }
        } catch (error) {
          console.error("❌ Error deleting gallery:", galleryId, error);
          return { success: false, id: galleryId };
        }
      },
    );

    const results = await Promise.all(deletePromises);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    if (successCount > 0) {
      console.log("[OK] Deleted " + successCount + " galleries");
    }
    if (failCount > 0) {
      console.warn("[WARN] Failed to delete " + failCount + " galleries");
    }

    return { successCount, failCount };
  };

  // Removed zone loading logic as we now use park_id

  const uploadFile = async (file: File): Promise<string> => {
    console.log("Uploading flora image:", file.name, "Size:", (file.size / 1024 / 1024).toFixed(2) + "MB");

    // Import compression utility
    const { compressImage, needsCompression } = await import("../../utils/imageCompression");
    
    // Compress image if needed (files > 3MB)
    let fileToUpload = file;
    if (needsCompression(file, 3)) {
      try {
        console.log("📸 Compressing flora image before upload...");
        fileToUpload = await compressImage(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          quality: 0.8,
        });
      } catch (error) {
        console.warn("⚠️ Compression failed, using original file:", error);
      }
    }

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await fetch(base + "/api/v1/upload/gallery-image", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("auth_token"),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          "Upload failed: " + response.status + " - " + errorText,
        );
      }

      const result = await response.json();
      console.log("Flora image upload success:", result);
      return result.url;
    } catch (error) {
      console.error("Flora image upload error:", error);
      throw error;
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    console.log("Uploading multiple flora images:", files.length);

    // Import compression utility
    const { compressImage, needsCompression } = await import("../../utils/imageCompression");

    try {
      const formData = new FormData();
      // Compress files before adding to FormData
      for (const file of files) {
        let fileToUpload = file;
        if (needsCompression(file, 3)) {
          try {
            fileToUpload = await compressImage(file, {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920,
              quality: 0.8,
            });
          } catch (error) {
            console.warn(`⚠️ Compression failed for ${file.name}, using original:`, error);
          }
        }
        formData.append("files", fileToUpload);
      }

      const response = await fetch(
        base + "/api/v1/upload/multiple-gallery-images",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("auth_token"),
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          "Upload failed: " + response.status + " - " + errorText,
        );
      }

      const result = await response.json();
      console.log("Multiple flora images upload success:", result);
      return result.uploaded_files.map((file: any) => file.url);
    } catch (error) {
      console.error("Multiple flora images upload error:", error);
      throw error;
    }
  };

  const handleFilesSelect = (files: File[]) => {
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleSubmit = async (
    data: FloraFormData,
    submitStatus: "draft" | "in_review",
  ) => {
    try {
      setUploading(true);

      console.log(
        "Flora form submitting - mode:",
        mode,
        "status:",
        submitStatus,
      );
      console.log("Flora form data:", data);

      // ✅ Delete marked galleries FIRST before submitting flora data
      if (galleriesToDelete.size > 0) {
        console.log(
          "🗑️ Deleting " + galleriesToDelete.size + " marked galleries...",
        );
        const deleteResult = await deleteMarkedGalleries();
        console.log(
          "✅ Deleted " +
            deleteResult.successCount +
            " galleries, " +
            deleteResult.failCount +
            " failed",
        );
      }

      let imageUrl = data.gambar_utama;
      let uploadedImageUrls: string[] = [];
      let leafImageUrl = data.gambar_daun;
      let stemImageUrl = data.gambar_batang;
      let flowerImageUrl = data.gambar_bunga;
      let fruitImageUrl = data.gambar_buah;

      // If single file is selected, upload it first
      if (selectedFile) {
        console.log("Uploading flora image file:", selectedFile.name);
        imageUrl = await uploadFile(selectedFile);
        console.log("Flora image uploaded successfully, URL:", imageUrl);
      }

      // Upload detail images
      if (selectedLeafImage) {
        console.log("Uploading leaf image:", selectedLeafImage.name);
        leafImageUrl = await uploadFile(selectedLeafImage);
        console.log("Leaf image uploaded successfully, URL:", leafImageUrl);
      }

      if (selectedStemImage) {
        console.log("Uploading stem image:", selectedStemImage.name);
        stemImageUrl = await uploadFile(selectedStemImage);
        console.log("Stem image uploaded successfully, URL:", stemImageUrl);
      }

      if (selectedFlowerImage) {
        console.log("Uploading flower image:", selectedFlowerImage.name);
        flowerImageUrl = await uploadFile(selectedFlowerImage);
        console.log("Flower image uploaded successfully, URL:", flowerImageUrl);
      }

      if (selectedFruitImage) {
        console.log("Uploading fruit image:", selectedFruitImage.name);
        fruitImageUrl = await uploadFile(selectedFruitImage);
        console.log("Fruit image uploaded successfully, URL:", fruitImageUrl);
      }

      // If multiple files are selected, upload them
      if (selectedFiles.length > 0) {
        console.log("Uploading multiple flora images:", selectedFiles.length);
        const files = selectedFiles.map((f) => f.file);
        uploadedImageUrls = await uploadMultipleFiles(files);
        console.log(
          "Multiple flora images uploaded successfully, URLs:",
          uploadedImageUrls,
        );

        // Use first uploaded image as main image if no single file was selected
        if (!imageUrl && uploadedImageUrls.length > 0) {
          imageUrl = uploadedImageUrls[0];
        }
      }

      const floraData = {
        ...data,
        gambar_utama: imageUrl,
        gambar_daun: leafImageUrl,
        gambar_batang: stemImageUrl,
        gambar_bunga: flowerImageUrl,
        gambar_buah: fruitImageUrl,
        status: submitStatus, // Use the status from button click
      };

      console.log("Flora data to submit:", floraData);

      // Submit flora data
      const floraResult = await onSubmit(floraData);

      console.log("Flora submit result:", floraResult);

      // Create gallery records for all uploaded images
      if (floraResult?.id) {
        try {
          const { createGalleryForEntity } = await import(
            "../../lib/gallery-integration"
          );

          // Auto-approve galleries if user is super_admin or flora status is approved
          const galleryStatus =
            user?.role === "super_admin" || floraResult.status === "approved"
              ? "approved"
              : "draft";

          // Create gallery record for main image if single file was uploaded
          if (selectedFile && imageUrl) {
            await createGalleryForEntity(imageUrl, {
              entityType: "flora",
              entityId: Number(floraResult.id),
              title:
                (data.nama_umum || data.nama_ilmiah) +
                " - " +
                data.nama_ilmiah +
                " (Gambar Utama)",
              description: data.deskripsi || "",
              parkId: Number(data.park_id) || 1,
              status: galleryStatus,
            });
            console.log(
              "Gallery record created for main flora image:",
              floraResult.id,
              "status:",
              galleryStatus,
            );
          }

          // Create gallery records for multiple images
          for (let i = 0; i < uploadedImageUrls.length; i++) {
            const url = uploadedImageUrls[i];
            const isMainImage = selectedFile && url === imageUrl;

            await createGalleryForEntity(url, {
              entityType: "flora",
              entityId: Number(floraResult.id),
              title:
                (data.nama_umum || data.nama_ilmiah) +
                " - " +
                data.nama_ilmiah +
                " " +
                (isMainImage ? "(Gambar Utama)" : "(Gambar " + (i + 1) + ")"),
              description: data.deskripsi || "",
              parkId: Number(data.park_id) || 1,
              status: galleryStatus,
            });
            console.log(
              "Gallery record created for flora image " + (i + 1) + ":",
              floraResult.id,
              "status:",
              galleryStatus,
            );
          }
        } catch (galleryError) {
          console.error("Failed to create gallery records:", galleryError);
          // Don't fail the entire operation if gallery creation fails
        }
      }

      form.reset();
      setSelectedFile(null);
      setSelectedFiles([]);
      setGalleriesToDelete(new Set()); // Clear deletion marks on successful submit
      onOpenChange(false);
    } catch (error) {
      console.error("Flora form submit error:", error);
      // Error handled by parent
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    setSelectedFiles([]);
    setGalleriesToDelete(new Set()); // Clear deletion marks on cancel
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Data Flora Baru" : "Edit Data Flora"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi formulir di bawah untuk menambahkan data flora baru. Data akan disimpan sebagai draft."
              : "Perbarui informasi flora. Perubahan akan disimpan sebagai draft."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nama_ilmiah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ilmiah *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Rafflesia arnoldii"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nama_umum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Umum</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Bunga Bangkai Raksasa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="kelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Magnoliopsida" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="famili"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Famili</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Rafflesiaceae" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genus</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Rafflesia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sinonim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sinonim</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nama-nama sinonim atau nama lain dari flora ini"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waktu_berbunga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waktu Berbunga</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Januari - Maret, atau sepanjang tahun"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status_iucn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status IUCN</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status IUCN" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {IUCN_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Removed zone field as we now use park_id */}

            <FormField
              control={form.control}
              name="is_endemic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Endemik Indonesia</FormLabel>
                    <FormDescription>
                      Centang jika spesies ini endemik di Indonesia
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="morfologi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Morfologi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Bunga berukuran 50-100 cm dengan warna merah bercak putih, tidak memiliki daun dan batang"
                      className="resize-none"
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
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Lengkap</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi detail tentang flora ini, termasuk ciri-ciri morfologi, distribusi, dan informasi penting lainnya"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="habitat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habitat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informasi tentang habitat flora ini, misalnya: hutan hujan tropis, dataran rendah, pegunungan, dll."
                      className="resize-none"
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
              name="manfaat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manfaat / Kegunaan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Dimanfaatkan sebagai tanaman obat tradisional untuk meredakan demam"
                      className="resize-none"
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
              name="penyebaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penyebaran</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Daerah penyebaran flora ini, misalnya: Sumatra, Kalimantan, Papua"
                      className="resize-none"
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
              name="metode_perbanyakan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Perbanyakan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cara perbanyakan flora ini, misalnya: biji, stek, cangkok, kultur jaringan"
                      className="resize-none"
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
              name="referensi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referensi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Sumber referensi, jurnal, buku, atau literatur lainnya"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {user?.role === "regional_admin" && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_review">
                          Submit untuk Review
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih "Submit untuk Review" untuk mengirim data ke super
                      admin untuk approval.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-6">
              {/* Existing Gallery Images (Edit Mode) */}
              {mode === "edit" && existingGalleries.length > 0 && (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-900">
                      Gambar Gallery Saat Ini
                    </label>
                    <div className="flex items-center gap-2">
                      {galleriesToDelete.size > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {galleriesToDelete.size} akan dihapus
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {existingGalleries.length} gambar
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {existingGalleries.map((gallery) => {
                      // Safe image URL handling
                      const galleryImageUrl = gallery.image_url
                        ? buildImageUrl(gallery.image_url)
                        : "/placeholder-image.png"; // Fallback image

                      const isMarkedForDeletion = galleriesToDelete.has(
                        gallery.id,
                      );

                      return (
                        <div
                          key={gallery.id}
                          className={
                            "relative group" +
                            (isMarkedForDeletion ? " opacity-50" : "")
                          }
                        >
                          <div
                            className={
                              "relative" +
                              (isMarkedForDeletion
                                ? " border-2 border-red-500 rounded"
                                : "")
                            }
                          >
                            <img
                              src={galleryImageUrl}
                              alt={gallery.title || "Gallery image"}
                              className={
                                "w-full h-24 object-cover rounded" +
                                (isMarkedForDeletion ? " grayscale" : "")
                              }
                              onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.src = "/placeholder-image.png";
                              }}
                            />
                            {isMarkedForDeletion && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-70 rounded">
                                <svg
                                  className="w-8 h-8 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {!isMarkedForDeletion ? (
                            <button
                              type="button"
                              onClick={() => markGalleryForDeletion(gallery.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Tandai untuk dihapus"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                unmarkGalleryForDeletion(gallery.id)
                              }
                              className="absolute top-1 right-1 bg-green-500 text-white p-1.5 rounded-full opacity-100 hover:bg-green-600 shadow-lg"
                              title="Batalkan penghapusan"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          )}

                          <p
                            className={
                              "text-xs mt-1 truncate" +
                              (isMarkedForDeletion
                                ? " text-red-600 line-through"
                                : " text-slate-600")
                            }
                            title={gallery.title || "Gallery image"}
                          >
                            {isMarkedForDeletion
                              ? "🗑️ Akan dihapus"
                              : gallery.title || "Untitled"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {loadingGalleries && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                      Memuat gambar...
                    </p>
                  )}
                  {galleriesToDelete.size > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      ⚠️ <strong>{galleriesToDelete.size} gambar</strong>{" "}
                      ditandai untuk dihapus. Klik{" "}
                      <strong>"Submit untuk Review"</strong> untuk menghapus
                      permanent, atau klik <strong>"Batal"</strong> untuk
                      membatalkan semua perubahan.
                    </div>
                  )}
                </div>
              )}

              {/* Single Image Upload */}
              <div>
                <label className="text-sm font-medium">
                  Upload Gambar Utama Flora
                </label>
                <FileUpload
                  onFileSelect={setSelectedFile}
                  onFileRemove={() => setSelectedFile(null)}
                  selectedFile={selectedFile}
                  maxSize={10}
                  className="mt-2"
                />
              </div>

              {/* Multiple Images Upload */}
              <div>
                <label className="text-sm font-medium">
                  Upload Gambar Tambahan (Opsional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {mode === "edit"
                    ? "Upload gambar baru yang akan ditambahkan ke gallery"
                    : "Upload hingga 10 gambar tambahan untuk flora ini"}
                </p>
                <MultipleFileUpload
                  onFilesSelect={handleFilesSelect}
                  onFileRemove={handleFileRemove}
                  selectedFiles={selectedFiles}
                  maxSize={10}
                  maxFiles={10}
                  className="mt-2"
                />
              </div>

              <div className="text-center text-sm text-gray-500">atau</div>

              <FormField
                control={form.control}
                name="gambar_utama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Utama</FormLabel>
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

              {/* Gambar Detail Flora */}
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                  Gambar Detail Flora (Opsional)
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Gambar Daun */}
                  <div className="space-y-3">
                    <FormLabel className="text-sm font-medium">
                      Gambar Pertelaan Daun
                    </FormLabel>
                    <FileUpload
                      onFileSelect={setSelectedLeafImage}
                      onFileRemove={() => setSelectedLeafImage(null)}
                      selectedFile={selectedLeafImage}
                      maxSize={10}
                      className="border-dashed"
                    />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-[10px] text-gray-400">
                          atau URL
                        </span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="gambar_daun"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/daun.jpg"
                              type="url"
                              {...field}
                              className="h-9 text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gambar Batang */}
                  <div className="space-y-3">
                    <FormLabel className="text-sm font-medium">
                      Gambar Batang/Percabangan
                    </FormLabel>
                    <FileUpload
                      onFileSelect={setSelectedStemImage}
                      onFileRemove={() => setSelectedStemImage(null)}
                      selectedFile={selectedStemImage}
                      maxSize={10}
                      className="border-dashed"
                    />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-[10px] text-gray-400">
                          atau URL
                        </span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="gambar_batang"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/batang.jpg"
                              type="url"
                              {...field}
                              className="h-9 text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gambar Bunga */}
                  <div className="space-y-3">
                    <FormLabel className="text-sm font-medium">
                      Gambar Bunga
                    </FormLabel>
                    <FileUpload
                      onFileSelect={setSelectedFlowerImage}
                      onFileRemove={() => setSelectedFlowerImage(null)}
                      selectedFile={selectedFlowerImage}
                      maxSize={10}
                      className="border-dashed"
                    />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-[10px] text-gray-400">
                          atau URL
                        </span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="gambar_bunga"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/bunga.jpg"
                              type="url"
                              {...field}
                              className="h-9 text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gambar Buah */}
                  <div className="space-y-3">
                    <FormLabel className="text-sm font-medium">
                      Gambar Buah
                    </FormLabel>
                    <FileUpload
                      onFileSelect={setSelectedFruitImage}
                      onFileRemove={() => setSelectedFruitImage(null)}
                      selectedFile={selectedFruitImage}
                      maxSize={10}
                      className="border-dashed"
                    />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-[10px] text-gray-400">
                          atau URL
                        </span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="gambar_buah"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/buah.jpg"
                              type="url"
                              {...field}
                              className="h-9 text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button
                type="button"
                disabled={form.formState.isSubmitting || uploading}
                onClick={form.handleSubmit((data) =>
                  handleSubmit(data, "in_review"),
                )}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {uploading || form.formState.isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Data"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
