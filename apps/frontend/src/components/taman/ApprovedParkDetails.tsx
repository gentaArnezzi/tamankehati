"use client";

import { useState, useEffect } from "react";
import { Park, parksApi } from "../../lib/api-client";
import { toast } from "sonner";
import { apiUrl, imageUrl } from "../../lib/api-url";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  MapPin,
  FileText,
  Building2,
  TreePine,
  Leaf,
  Bird,
  Calendar,
  CheckCircle,
  Ruler,
  Mountain,
  Heart,
  BookOpen,
  Target,
  Lightbulb,
  Edit,
  Save,
  X,
  Clock,
  Camera,
} from "lucide-react";
import dynamic from "next/dynamic";
import { IndonesiaRegionSelector } from "./IndonesiaRegionSelector";
import { FileUpload } from "../ui/file-upload";
import { MultipleFileUpload } from "../ui/multiple-file-upload";

const InteractiveMapDisplay = dynamic(
  () =>
    import("../ui/interactive-map-display").then((mod) => ({
      default: mod.InteractiveMapDisplay,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Memuat peta...</p>
        </div>
      </div>
    ),
  },
);

const InteractiveMapWrapper = dynamic(
  () =>
    import("../ui/interactive-map-wrapper").then((mod) => ({
      default: mod.InteractiveMapWrapper,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Memuat peta...</p>
        </div>
      </div>
    ),
  },
);

interface Gallery {
  id: number;
  title: string;
  image_url: string;
  description?: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface ApprovedParkDetailsProps {
  park: Park;
  onParkUpdate?: (updatedPark: Park) => void;
}

export function ApprovedParkDetails({
  park,
  onParkUpdate,
}: ApprovedParkDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Main image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string>(
    park.gambar_utama || "",
  );
  const [mainImageRemoved, setMainImageRemoved] = useState(false);

  // Gallery upload states
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [editData, setEditData] = useState({
    name: park.name,
    area_ha: park.area_ha || 0,
    description: park.description || "",
    provinsi: park.provinsi || "",
    kota_kabupaten: park.kota_kabupaten || "",
    kecamatan: park.kecamatan || "",
    desa_kelurahan: park.desa_kelurahan || "",
    pengelola: park.pengelola || "",
    sk_penetapan: park.sk_penetapan || "",
    sejarah: park.sejarah || "",
    visi: park.visi || "",
    misi: park.misi || "",
    nilai_dasar: park.nilai_dasar || "",
    tipe_ekoregion: park.tipe_ekoregion || "",
    kondisi_fisik: park.kondisi_fisik || "",
    nilai_penting: park.nilai_penting || "",
    latitude: park.latitude || null,
    longitude: park.longitude || null,
  });

  // Load galleries when component mounts or park changes
  useEffect(() => {
    loadGalleries();
    setMainImageUrl(park.gambar_utama || "");
  }, [park.id, park.gambar_utama]);

  const loadGalleries = async () => {
    if (!park.id) return;

    try {
      setLoadingGallery(true);
      const response = await fetch(
        apiUrl(`/api/v1/galleries/entity/park/${park.id}`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setGalleries(result.data || result.items || []);
      } else {
        console.error("Gallery load failed:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to load galleries:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Use centralized imageUrl helper
  const getImageUrl = (url?: string) => {
    return imageUrl(url);
  };

  // Main image upload handlers
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setMainImageRemoved(false); // Reset removed flag when new file selected
    await uploadFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setMainImageUrl("");
    setMainImageRemoved(true); // Mark as explicitly removed
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        url: apiUrl("/api/v1/upload/gallery-image"),
      });

      const response = await fetch(
        apiUrl("/api/v1/upload/gallery-image"),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        },
      );

      console.log("Upload response:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Upload error response text:", responseText);

        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { detail: responseText || response.statusText };
        }

        const errorMessage =
          errorData?.detail ||
          `Upload failed: ${response.status} ${response.statusText}`;
        console.error("Upload error data:", errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Upload success:", result);
      setMainImageUrl(result.url);
      toast.success("Foto utama berhasil diupload");
    } catch (error) {
      console.error("Upload error:", error);
      const message =
        error instanceof Error ? error.message : "Gagal upload foto";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  // Gallery upload handlers
  const handleGalleryFilesSelect = (files: File[]) => {
    const newFiles: FileWithPreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleGalleryFileRemove = (fileId: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  // Cleanup all previews when component unmounts
  useEffect(() => {
    const currentFiles = selectedFiles;
    return () => {
      currentFiles.forEach((fileWithPreview) => {
        URL.revokeObjectURL(fileWithPreview.preview);
      });
    };
  }, [selectedFiles]);

  const uploadMultipleFiles = async (files: File[]) => {
    const uploadedUrls: string[] = [];

    // Import compression utility
    const { compressImage, needsCompression } = await import("../../utils/imageCompression");

    for (const file of files) {
      try {
        // Compress image if needed (files > 3MB)
        let fileToUpload = file;
        if (needsCompression(file, 3)) {
          try {
            console.log(`📸 Compressing ${file.name} before upload...`);
            fileToUpload = await compressImage(file, {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920,
              quality: 0.8,
            });
          } catch (error) {
            console.warn(`⚠️ Compression failed for ${file.name}, using original:`, error);
          }
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);

        console.log(`Uploading gallery file ${file.name}:`, {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        const response = await fetch(
          apiUrl("/api/v1/upload/gallery-image"),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: formData,
          },
        );

        console.log(`Upload response for ${file.name}:`, {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
        });

        if (!response.ok) {
          const responseText = await response.text();
          console.error(
            `Upload error response text for ${file.name}:`,
            responseText,
          );

          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { detail: responseText || response.statusText };
          }

          const errorMessage =
            errorData?.detail ||
            `Failed to upload ${file.name}: ${response.status} ${response.statusText}`;
          console.error(`Upload error data for ${file.name}:`, errorData);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log(`Upload success for ${file.name}:`, result);
        uploadedUrls.push(result.url);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        const message =
          error instanceof Error ? error.message : `Gagal upload ${file.name}`;
        toast.error(message);
        // Continue with other files even if one fails
      }
    }

    return uploadedUrls;
  };

  const submitGalleryImages = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploadingGallery(true);

      // Extract File objects from FileWithPreview
      const files = selectedFiles.map((f) => f.file);
      const uploadedUrls = await uploadMultipleFiles(files);

      // Create gallery entries for each uploaded image
      for (const imageUrl of uploadedUrls) {
        const galleryData = {
          entity_type: "park",
          entity_id: park.id,
          title: `${park.name} - Gallery`,
          image_url: imageUrl,
          description: "",
          status: "approved", // Auto-approve for regional admin edits
        };

        const response = await fetch(
          apiUrl("/api/v1/galleries/"),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(galleryData),
          },
        );

        if (!response.ok) {
          console.error("Failed to create gallery entry");
        }
      }

      toast.success(
        `${uploadedUrls.length} foto berhasil ditambahkan ke galeri`,
      );

      // Cleanup previews
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);

      await loadGalleries(); // Reload galleries
    } catch (error) {
      console.error("Error submitting gallery:", error);
      toast.error("Gagal menyimpan galeri");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (galleryId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto ini dari galeri?")) {
      return;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/v1/galleries/${galleryId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to delete gallery: ${response.status}`);
      }

      toast.success("Foto berhasil dihapus dari galeri");
      await loadGalleries(); // Reload galleries
    } catch (error) {
      console.error("Failed to delete gallery:", error);
      toast.error("Gagal menghapus foto dari galeri");
    }
  };

  // Test upload endpoint
  const testUploadEndpoint = async () => {
    try {
      const testBlob = new Blob(["test"], { type: "image/jpeg" });
      const testFile = new File([testBlob], "test.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", testFile);

      console.log("Testing upload endpoint...");
      console.log("Auth token:", localStorage.getItem("auth_token"));

      const response = await fetch(
        apiUrl("/api/v1/upload/gallery-image"),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        },
      );

      const responseText = await response.text();
      console.log("Test upload response status:", response.status);
      console.log("Test upload response text:", responseText);

      if (response.ok) {
        toast.success("Upload endpoint test: SUCCESS");
      } else {
        toast.error(`Upload endpoint test: FAILED (${response.status})`);
      }
    } catch (error) {
      console.error("Test upload error:", error);
      toast.error("Upload endpoint test: ERROR");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setIsEditing(false);

    // Reset image states
    setSelectedFile(null);
    setMainImageUrl(park.gambar_utama || "");
    setMainImageRemoved(false);

    // Cleanup gallery previews
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);

    setEditData({
      name: park.name,
      area_ha: park.area_ha || 0,
      description: park.description || "",
      provinsi: park.provinsi || "",
      kota_kabupaten: park.kota_kabupaten || "",
      kecamatan: park.kecamatan || "",
      desa_kelurahan: park.desa_kelurahan || "",
      pengelola: park.pengelola || "",
      sk_penetapan: park.sk_penetapan || "",
      sejarah: park.sejarah || "",
      visi: park.visi || "",
      misi: park.misi || "",
      nilai_dasar: park.nilai_dasar || "",
      tipe_ekoregion: park.tipe_ekoregion || "",
      kondisi_fisik: park.kondisi_fisik || "",
      nilai_penting: park.nilai_penting || "",
      latitude: park.latitude || null,
      longitude: park.longitude || null,
    });

    // Reset image states
    setSelectedFile(null);

    // Cleanup gallery previews
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);

    setMainImageUrl(park.gambar_utama || "");
  };

  const handleSave = async () => {
    try {
      // Include main image URL in the update
      const dataToSave = {
        ...editData,
        gambar_utama: mainImageUrl,
      };

      const updatedPark = await parksApi.update(park.id, dataToSave);

      // Upload gallery images if any
      if (selectedFiles.length > 0) {
        await submitGalleryImages();
      }

      // Set update status based on park status
      if (updatedPark.status === "in_review") {
        setUpdateStatus("in_review");
        toast.success(
          "Perubahan taman berhasil disimpan dan menunggu approval dari super admin",
        );
      } else if (updatedPark.status === "approved") {
        setUpdateStatus("approved");
        toast.success(
          "Perubahan taman berhasil disimpan dan langsung disetujui",
        );
      } else {
        toast.success("Perubahan taman berhasil disimpan");
      }

      setIsEditing(false);
      onParkUpdate?.(updatedPark);
    } catch (error) {
      console.error("Error saving park changes:", error);
      toast.error("Gagal menyimpan perubahan taman");
    }
  };

  const handleRegionChange = (region: {
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    desa_kelurahan: string;
  }) => {
    setEditData((prev) => ({
      ...prev,
      provinsi: region.provinsi || "",
      kota_kabupaten: region.kota_kabupaten || "",
      kecamatan: region.kecamatan || "",
      desa_kelurahan: region.desa_kelurahan || "",
    }));
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setEditData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  // Show edit form
  if (isEditing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Edit Taman</CardTitle>
                <CardDescription>
                  Perubahan akan masuk status review dan memerlukan persetujuan
                  super admin
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Batal
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profil" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profil">Profil & Informasi</TabsTrigger>
                <TabsTrigger value="lokasi">Lokasi & Koordinat</TabsTrigger>
                <TabsTrigger value="karakteristik">Karakteristik</TabsTrigger>
                <TabsTrigger value="visi-misi">Visi & Misi</TabsTrigger>
              </TabsList>

              {/* Tab: Profil */}
              <TabsContent value="profil" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Resmi Kawasan *</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      placeholder="Nama resmi kawasan konservasi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sk_penetapan">
                      SK Penetapan/Penunjukan
                    </Label>
                    <Input
                      id="sk_penetapan"
                      value={editData.sk_penetapan}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          sk_penetapan: e.target.value,
                        })
                      }
                      placeholder="Nomor SK penetapan"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pengelola">Instansi Pengelola</Label>
                    <Input
                      id="pengelola"
                      value={editData.pengelola}
                      onChange={(e) =>
                        setEditData({ ...editData, pengelola: e.target.value })
                      }
                      placeholder="Nama instansi pengelola"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi Umum</Label>
                    <Textarea
                      id="description"
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Deskripsi umum tentang taman"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sejarah">Sejarah Taman</Label>
                    <Textarea
                      id="sejarah"
                      value={editData.sejarah}
                      onChange={(e) =>
                        setEditData({ ...editData, sejarah: e.target.value })
                      }
                      placeholder="Sejarah pembentukan dan pengembangan taman"
                      rows={4}
                    />
                  </div>

                  {/* Main Image Upload */}
                  <div>
                    <Label>Foto Utama Taman</Label>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      selectedFile={selectedFile}
                      previewUrl={
                        mainImageRemoved
                          ? undefined
                          : mainImageUrl ||
                            (park.gambar_utama
                              ? getImageUrl(park.gambar_utama)
                              : undefined)
                      }
                      maxSize={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload foto utama taman (maksimal 5MB)
                    </p>
                  </div>

                  {/* Existing Gallery Photos */}
                  {galleries.length > 0 && (
                    <div>
                      <Label>Galeri Foto Saat Ini ({galleries.length})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 p-4 border rounded-lg bg-gray-50">
                        {galleries.map((gallery) => (
                          <div key={gallery.id} className="relative group">
                            <img
                              src={getImageUrl(gallery.image_url)}
                              alt={gallery.title || "Gallery"}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteGallery(gallery.id)}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              title="Hapus foto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {gallery.title && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {gallery.title}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery Upload */}
                  <div>
                    <Label>Tambah Foto Baru ke Galeri</Label>
                    <MultipleFileUpload
                      onFilesSelect={handleGalleryFilesSelect}
                      onFileRemove={handleGalleryFileRemove}
                      selectedFiles={selectedFiles}
                      maxFiles={10}
                      maxSize={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload hingga 10 foto untuk galeri (maksimal 5MB per foto)
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Lokasi */}
              <TabsContent value="lokasi" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Lokasi Administratif *</Label>
                    <IndonesiaRegionSelector
                      initialValues={{
                        provinsi: editData.provinsi || "",
                        kota_kabupaten: editData.kota_kabupaten || "",
                        kecamatan: editData.kecamatan || "",
                        desa_kelurahan: editData.desa_kelurahan || "",
                      }}
                      onRegionChange={handleRegionChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="area_ha">Luas Kawasan (ha)</Label>
                    <Input
                      id="area_ha"
                      type="number"
                      value={editData.area_ha || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          area_ha: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      placeholder="Luas kawasan dalam hektar"
                    />
                  </div>

                  <div>
                    <Label>Koordinat Geografis</Label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="latitude" className="text-sm">
                          Latitude
                        </Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="0.000001"
                          value={editData.latitude || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              latitude: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          placeholder="-7.376688"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude" className="text-sm">
                          Longitude
                        </Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="0.000001"
                          value={editData.longitude || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              longitude: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          placeholder="108.556031"
                        />
                      </div>
                    </div>
                    <InteractiveMapWrapper
                      latitude={editData.latitude}
                      longitude={editData.longitude}
                      onCoordinatesChange={handleCoordinatesChange}
                      height="400px"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Karakteristik */}
              <TabsContent value="karakteristik" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tipe_ekoregion">Tipe Ekoregion</Label>
                    <Select
                      value={editData.tipe_ekoregion}
                      onValueChange={(value) =>
                        setEditData({ ...editData, tipe_ekoregion: value })
                      }
                    >
                      <SelectTrigger id="tipe_ekoregion">
                        <SelectValue placeholder="Pilih tipe ekoregion" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                          DARAT (Terrestrial)
                        </div>
                        <SelectItem value="Hutan Hujan Dataran Rendah">
                          Hutan Hujan Dataran Rendah
                        </SelectItem>
                        <SelectItem value="Hutan Hujan Pegunungan">
                          Hutan Hujan Pegunungan
                        </SelectItem>
                        <SelectItem value="Hutan Gambut">
                          Hutan Gambut
                        </SelectItem>
                        <SelectItem value="Hutan Mangrove">
                          Hutan Mangrove
                        </SelectItem>
                        <SelectItem value="Hutan Musim">Hutan Musim</SelectItem>
                        <SelectItem value="Savana">Savana</SelectItem>
                        <SelectItem value="Karst">Karst</SelectItem>

                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">
                          AIR TAWAR (Freshwater)
                        </div>
                        <SelectItem value="Sungai Kapuas">
                          Sungai Kapuas
                        </SelectItem>
                        <SelectItem value="Sungai Mahakam">
                          Sungai Mahakam
                        </SelectItem>
                        <SelectItem value="Sungai Barito">
                          Sungai Barito
                        </SelectItem>
                        <SelectItem value="Sungai Musi">Sungai Musi</SelectItem>
                        <SelectItem value="Sungai Batanghari">
                          Sungai Batanghari
                        </SelectItem>
                        <SelectItem value="Danau Toba">Danau Toba</SelectItem>
                        <SelectItem value="Danau Poso">Danau Poso</SelectItem>
                        <SelectItem value="Danau Sentani">
                          Danau Sentani
                        </SelectItem>
                        <SelectItem value="Sistem Sungai Sumatera">
                          Sistem Sungai Sumatera
                        </SelectItem>
                        <SelectItem value="Sistem Sungai Jawa">
                          Sistem Sungai Jawa
                        </SelectItem>
                        <SelectItem value="Sistem Sungai Kalimantan">
                          Sistem Sungai Kalimantan
                        </SelectItem>
                        <SelectItem value="Sistem Sungai Sulawesi">
                          Sistem Sungai Sulawesi
                        </SelectItem>
                        <SelectItem value="Sistem Sungai Papua">
                          Sistem Sungai Papua
                        </SelectItem>

                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">
                          LAUT (Marine)
                        </div>
                        <SelectItem value="Papua">Papua</SelectItem>
                        <SelectItem value="Laut Banda">Laut Banda</SelectItem>
                        <SelectItem value="Nusa Tenggara">
                          Nusa Tenggara
                        </SelectItem>
                        <SelectItem value="Laut Sulawesi/Selat Makassar">
                          Laut Sulawesi/Selat Makassar
                        </SelectItem>
                        <SelectItem value="Halmahera">Halmahera</SelectItem>
                        <SelectItem value="Palawan/Borneo Utara">
                          Palawan/Borneo Utara
                        </SelectItem>
                        <SelectItem value="Sumatera Bagian Barat">
                          Sumatera Bagian Barat
                        </SelectItem>
                        <SelectItem value="Timur Laut Sulawesi/Teluk Tomini">
                          Timur Laut Sulawesi/Teluk Tomini
                        </SelectItem>
                        <SelectItem value="Dangkalan Sunda/Laut Jawa">
                          Dangkalan Sunda/Laut Jawa
                        </SelectItem>
                        <SelectItem value="Laut Arafura">
                          Laut Arafura
                        </SelectItem>
                        <SelectItem value="Jawa Bagian Selatan">
                          Jawa Bagian Selatan
                        </SelectItem>
                        <SelectItem value="Selat Malaka">
                          Selat Malaka
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="kondisi_fisik">Kondisi Fisik Kawasan</Label>
                    <Textarea
                      id="kondisi_fisik"
                      value={editData.kondisi_fisik}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          kondisi_fisik: e.target.value,
                        })
                      }
                      placeholder="Deskripsi kondisi fisik kawasan"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nilai_penting">Nilai Penting Kawasan</Label>
                    <Textarea
                      id="nilai_penting"
                      value={editData.nilai_penting}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nilai_penting: e.target.value,
                        })
                      }
                      placeholder="Deskripsi nilai penting kawasan"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nilai_dasar">Nilai Dasar</Label>
                    <Textarea
                      id="nilai_dasar"
                      value={editData.nilai_dasar}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nilai_dasar: e.target.value,
                        })
                      }
                      placeholder="Deskripsi nilai dasar kawasan"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Visi & Misi */}
              <TabsContent value="visi-misi" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="visi">Visi</Label>
                    <Textarea
                      id="visi"
                      value={editData.visi}
                      onChange={(e) =>
                        setEditData({ ...editData, visi: e.target.value })
                      }
                      placeholder="Visi taman"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="misi">Misi</Label>
                    <Textarea
                      id="misi"
                      value={editData.misi}
                      onChange={(e) =>
                        setEditData({ ...editData, misi: e.target.value })
                      }
                      placeholder="Misi taman"
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show detail view
  return (
    <div className="space-y-6">
      {/* Header with Park Name and Status */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TreePine className="w-8 h-8 text-green-600" />
            {park.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Detail lengkap taman yang Anda kelola
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Detail
          </Button>
          <Badge
            variant="default"
            className="flex items-center gap-1 px-4 py-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approved
          </Badge>
        </div>
      </div>

      {/* Update Status Alert */}
      {updateStatus && (
        <Alert
          className={
            updateStatus === "in_review"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-green-50 border-green-200"
          }
        >
          <div className="flex items-start justify-between">
            <AlertDescription
              className={
                updateStatus === "in_review"
                  ? "text-yellow-800"
                  : "text-green-800"
              }
            >
              {updateStatus === "in_review" ? (
                <>
                  <Clock className="w-4 h-4 inline mr-2" />
                  <strong>Perubahan menunggu approval:</strong> Perubahan yang
                  Anda buat sedang menunggu persetujuan dari super admin. Status
                  akan diperbarui setelah disetujui.
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  <strong>Perubahan telah disetujui:</strong> Perubahan yang
                  Anda buat telah langsung disetujui dan diterapkan.
                </>
              )}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUpdateStatus(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Luas Kawasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {park.area_ha
                  ? `${park.area_ha.toLocaleString("id-ID")} ha`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <span className="text-lg font-semibold">
                {park.kota_kabupaten || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengelola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-semibold line-clamp-1">
                {park.pengelola || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="profil" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="lokasi">Lokasi</TabsTrigger>
          <TabsTrigger value="karakteristik">Karakteristik</TabsTrigger>
          <TabsTrigger value="visi-misi">Visi & Misi</TabsTrigger>
        </TabsList>

        {/* Tab: Profil */}
        <TabsContent value="profil" className="space-y-4">
          {/* Main Image */}
          {park.gambar_utama && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Foto Utama Taman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={getImageUrl(park.gambar_utama)}
                  alt={park.name}
                  className="w-full h-96 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  onError={(e) => {
                    console.error(
                      "Failed to load main image:",
                      park.gambar_utama,
                    );
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Gallery */}
          {galleries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Galeri Foto ({galleries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleries.map((gallery) => (
                    <div key={gallery.id} className="group relative">
                      <img
                        src={getImageUrl(gallery.image_url)}
                        alt={gallery.title}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                        onError={(e) => {
                          console.error(
                            "Failed to load gallery image:",
                            gallery.image_url,
                          );
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {gallery.title && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {gallery.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informasi Umum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Nama Resmi Kawasan
                </h4>
                <p className="text-base">{park.name}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  SK Penetapan/Penunjukan
                </h4>
                <p className="text-base">{park.sk_penetapan || "-"}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Instansi Pengelola
                </h4>
                <p className="text-base">{park.pengelola || "-"}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Deskripsi
                </h4>
                <p className="text-base whitespace-pre-wrap">
                  {park.description || "-"}
                </p>
              </div>

              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Sejarah
                </h4>
                <p className="text-base whitespace-pre-wrap">
                  {park.sejarah || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Lokasi */}
        <TabsContent value="lokasi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Detail Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Provinsi
                  </h4>
                  <p className="text-base">{park.provinsi || "-"}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Kabupaten/Kota
                  </h4>
                  <p className="text-base">{park.kota_kabupaten || "-"}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Kecamatan
                  </h4>
                  <p className="text-base">{park.kecamatan || "-"}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Desa/Kelurahan
                  </h4>
                  <p className="text-base">{park.desa_kelurahan || "-"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Luas Kawasan
                </h4>
                <p className="text-base">
                  {park.area_ha
                    ? `${park.area_ha.toLocaleString("id-ID")} hektar (ha)`
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Peta Lokasi */}
          {park.latitude && park.longitude && (
            <InteractiveMapDisplay
              latitude={park.latitude}
              longitude={park.longitude}
              height="450px"
            />
          )}

          {!park.latitude && !park.longitude && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Koordinat lokasi belum ditambahkan</p>
                  <p className="text-xs mt-1">
                    Koordinat dapat ditambahkan saat membuat atau mengedit taman
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Karakteristik */}
        <TabsContent value="karakteristik" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="w-5 h-5" />
                Karakteristik Kawasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Tipe Ekoregion
                </h4>
                <p className="text-base whitespace-pre-wrap">
                  {park.tipe_ekoregion || "-"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Kondisi Fisik Kawasan
                </h4>
                <p className="text-base whitespace-pre-wrap">
                  {park.kondisi_fisik || "-"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Nilai Penting Kawasan
                </h4>
                <p className="text-base whitespace-pre-wrap">
                  {park.nilai_penting || "-"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Nilai Dasar
                </h4>
                <p className="text-base whitespace-pre-wrap">
                  {park.nilai_dasar || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Visi & Misi */}
        <TabsContent value="visi-misi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Visi & Misi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <Target className="w-4 h-4 inline mr-1" />
                  Visi
                </h4>
                {isEditing ? (
                  <textarea
                    value={editData.visi}
                    onChange={(e) =>
                      setEditData({ ...editData, visi: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded text-base min-h-[100px]"
                    placeholder="Visi taman"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">
                    {park.visi || "-"}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  Misi
                </h4>
                {isEditing ? (
                  <textarea
                    value={editData.misi}
                    onChange={(e) =>
                      setEditData({ ...editData, misi: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded text-base min-h-[100px]"
                    placeholder="Misi taman"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">
                    {park.misi || "-"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links / Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Kelola Data</CardTitle>
          <CardDescription>
            Tambahkan data flora, fauna, dan kegiatan untuk taman ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/taman/flora"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Leaf className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold">Flora</h4>
                <p className="text-sm text-muted-foreground">
                  Kelola data flora
                </p>
              </div>
            </a>

            <a
              href="/dashboard/taman/fauna"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Bird className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold">Fauna</h4>
                <p className="text-sm text-muted-foreground">
                  Kelola data fauna
                </p>
              </div>
            </a>

            <a
              href="/dashboard/taman/activities"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-semibold">Kegiatan</h4>
                <p className="text-sm text-muted-foreground">Kelola kegiatan</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
