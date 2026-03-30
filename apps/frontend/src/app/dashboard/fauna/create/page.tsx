"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "../../../../components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Sparkles,
  Check,
  FileText,
  Globe,
  Shield,
  Camera,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { faunaApi } from "../../../../lib/api-client";
import { useAuth } from "../../../../lib/useAuth";
import { FileUpload } from "../../../../components/ui/file-upload";
import { MultipleFileUpload } from "../../../../components/ui/multiple-file-upload";

const iucnStatusOptions = [
  { value: "EX", label: "Extinct (EX) - Punah" },
  { value: "EW", label: "Extinct in the Wild (EW) - Punah di Alam Liar" },
  { value: "CR", label: "Critically Endangered (CR) - Kritis" },
  { value: "EN", label: "Endangered (EN) - Genting" },
  { value: "VU", label: "Vulnerable (VU) - Rentan" },
  { value: "NT", label: "Near Threatened (NT) - Hampir Terancam" },
  { value: "LC", label: "Least Concern (LC) - Risiko Rendah" },
  { value: "DD", label: "Data Deficient (DD) - Data Kurang" },
  { value: "NE", label: "Not Evaluated (NE) - Belum Dievaluasi" },
];

const statusHamaOptions = [
  { value: "Ya", label: "Ya - Merupakan Hama" },
  { value: "Tidak", label: "Tidak - Bukan Hama" },
  { value: "Potensial", label: "Potensial - Berpotensi Menjadi Hama" },
];

const tingkatHamaOptions = [
  { value: "Ringan", label: "Ringan" },
  { value: "Sedang", label: "Sedang" },
  { value: "Berat", label: "Berat" },
];

const STEPS = [
  { id: 1, title: "Informasi Dasar", icon: FileText },
  { id: 2, title: "Ekologi", icon: Globe },
  { id: 3, title: "Status & Konservasi", icon: Shield },
  { id: 4, title: "Galeri Foto", icon: Camera },
  { id: 5, title: "Review", icon: Eye },
];

export default function CreateFaunaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ file: File; preview: string; id: string }>
  >([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nama_ilmiah: "",
    nama_umum: "",
    kelas: "",
    ordo: "",
    deskripsi: "",
    habitat_sumber_makanan: "",
    status_hama: "",
    tingkat_hama: "",
    status_iucn: "",
    is_endemic: false,
    gambar_utama: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // File upload functions
  const uploadFile = async (file: File): Promise<string> => {
    console.log("Uploading fauna image:", file.name, "Size:", file.size);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const base =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://103.125.91.16";
      const response = await fetch(`${base}/api/v1/upload/gallery-image`, {
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
      console.log("Fauna image upload success:", result);
      return result.url;
    } catch (error) {
      console.error("Fauna image upload error:", error);
      throw error;
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    console.log("Uploading multiple fauna images:", files.length);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://103.125.91.16") +
          "/api/v1/upload/multiple-gallery-images",
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
      console.log("Multiple fauna images upload success:", result);
      return result.uploaded_files.map((file: any) => file.url);
    } catch (error) {
      console.error("Multiple fauna images upload error:", error);
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

  // AI Functions
  const generateAllAI = async () => {
    if (user?.role !== "regional_admin") {
      toast.error("AI features hanya dapat digunakan oleh Regional Admin");
      return;
    }

    setAiLoading(true);

    // Create AbortController for timeout
    // Backend timeout: 120s (small models) / 180s (large models)
    // Frontend timeout: 190s (small models) / 240s (large models) for safety margin
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 190000); // 190 second timeout (small models: 120s backend + 70s margin)

    try {
      const aiData = {
        local_name: formData.nama_umum || "",
        scientific_name: formData.nama_ilmiah || "",
        family: formData.ordo || "",
        genus: "",
        is_endemic: formData.is_endemic || false,
        iucn_status: formData.status_iucn || "",
      };

      const base =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://103.125.91.16";

      // Get auth token
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token") || ""
          : "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = "Bearer " + token;
      }

      const descriptionRes = await fetch(
        base + "/api/v1/ai/generate-fauna-description",
        {
          method: "POST",
          headers,
          body: JSON.stringify(aiData),
          signal: controller.signal,
        },
      );

      if (!descriptionRes.ok) {
        throw new Error(
          `Failed to generate description (${descriptionRes.status})`,
        );
      }

      const descriptionResult = await descriptionRes.json();

      // Validate that we got actual content
      if (!descriptionResult.description) {
        throw new Error("AI tidak menghasilkan konten yang valid");
      }

      setFormData((prev) => ({
        ...prev,
        deskripsi: descriptionResult.description,
        habitat_sumber_makanan: descriptionResult.description,
      }));

      toast.success("Deskripsi fauna berhasil dibuat dengan AI!");
    } catch (error) {
      console.error("Error generating AI content:", error);
      const err = error as Error & { name?: string; message?: string };

      if (err.name === "AbortError") {
        toast.error(
          "AI generation timeout (max 190 detik). Pastikan Ollama berjalan dan coba lagi.",
        );
      } else if (err.message?.includes("Failed to fetch")) {
        toast.error(
          "Tidak dapat terhubung ke AI service. Pastikan backend berjalan.",
        );
      } else {
        toast.error(`Gagal membuat deskripsi AI: ${err.message || "Unknown error"}`);
      }
    } finally {
      clearTimeout(timeoutId);
      setAiLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.nama_ilmiah.trim()) {
        toast.error("Nama ilmiah wajib diisi");
        return false;
      }
    }
    return true;
  };

  const nextStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log("Next step clicked. Current step:", currentStep);
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        console.log("Moving to step:", currentStep + 1);
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    submitStatus: "draft" | "in_review" = "in_review",
  ) => {
    e?.preventDefault();

    // Only submit when at review step
    if (currentStep !== STEPS.length) {
      console.log(
        "Submit blocked - not at review step. Current step:",
        currentStep,
      );
      return;
    }

    console.log("Submitting fauna data with status:", submitStatus);

    if (!formData.nama_ilmiah.trim()) {
      toast.error("Nama ilmiah wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploading(true);

      let imageUrl = formData.gambar_utama;
      let uploadedImageUrls: string[] = [];

      if (selectedFile) {
        console.log("Uploading fauna image file:", selectedFile.name);
        imageUrl = await uploadFile(selectedFile);
        console.log("Fauna image uploaded successfully, URL:", imageUrl);
      }

      if (selectedFiles.length > 0) {
        console.log("Uploading multiple fauna images:", selectedFiles.length);
        const files = selectedFiles.map((f) => f.file);
        uploadedImageUrls = await uploadMultipleFiles(files);
        console.log(
          "Multiple fauna images uploaded successfully, URLs:",
          uploadedImageUrls,
        );

        if (!imageUrl && uploadedImageUrls.length > 0) {
          imageUrl = uploadedImageUrls[0];
        }
      }

      const faunaData = {
        ...formData,
        gambar_utama: imageUrl,
        status: submitStatus, // ✅ Use status from button click
      };

      const faunaResult = await faunaApi.create(faunaData);

      if (faunaResult?.id) {
        try {
          const { createGalleryForEntity } = await import(
            "../../../../lib/gallery-integration"
          );

          if (selectedFile && imageUrl) {
            await createGalleryForEntity(imageUrl, {
              entityType: "fauna",
              entityId: faunaResult.id,
              title: `${formData.nama_umum || formData.nama_ilmiah} - ${formData.nama_ilmiah} (Gambar Utama)`,
              description: formData.deskripsi || "",
              parkId: 1,
            });
            console.log(
              "Gallery record created for main fauna image:",
              faunaResult.id,
            );
          }

          for (let i = 0; i < uploadedImageUrls.length; i++) {
            const url = uploadedImageUrls[i];
            const isMainImage = selectedFile && url === imageUrl;

            await createGalleryForEntity(url, {
              entityType: "fauna",
              entityId: faunaResult.id,
              title: `${formData.nama_umum || formData.nama_ilmiah} - ${formData.nama_ilmiah} ${isMainImage ? "(Gambar Utama)" : `(Gambar ${i + 1})`}`,
              description: formData.deskripsi || "",
              parkId: 1,
            });
            console.log(
              `Gallery record created for fauna image ${i + 1}:`,
              faunaResult.id,
            );
          }
        } catch (galleryError) {
          console.error("Failed to create gallery records:", galleryError);
        }
      }

      toast.success("Data fauna berhasil ditambahkan");
      router.push("/dashboard/taman/fauna");
    } catch (error: any) {
      console.error("Error creating fauna:", error);
      toast.error(error.message || "Gagal menyimpan data fauna");
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const getStepIcon = (step: (typeof STEPS)[0], index: number) => {
    const Icon = step.icon;
    const isCompleted = currentStep > index + 1;
    const isCurrent = currentStep === index + 1;

    return (
      <div
        className={`
        relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
        ${isCompleted ? "bg-gray-900 scale-100" : ""}
        ${isCurrent ? "bg-gray-900 scale-110" : ""}
        ${!isCurrent && !isCompleted ? "bg-gray-100 border border-gray-300" : ""}
      `}
      >
        {isCompleted ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <Icon
            className={`w-4 h-4 ${isCurrent ? "text-white" : "text-gray-400"}`}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-medium text-gray-900">
                Tambah Data Fauna
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Langkah {currentStep} dari {STEPS.length}
              </p>
            </div>
          </div>

          {/* Minimalist Progress */}
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-gray-200" />
            <div
              className="absolute top-5 left-0 h-px bg-gray-900 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />

            <div className="relative flex justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {getStepIcon(step, index)}
                  <span
                    className={`mt-2 text-xs font-medium transition-colors ${currentStep === index + 1 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && currentStep !== STEPS.length) {
              e.preventDefault();
            }
          }}
        >
          {/* Step 1: Informasi Dasar */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Informasi Dasar
                </h2>
                <p className="text-sm text-gray-500">
                  Identitas dan klasifikasi taksonomi fauna
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="nama_ilmiah"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nama Ilmiah <span className="text-gray-400">*</span>
                  </Label>
                  <Input
                    id="nama_ilmiah"
                    placeholder="Contoh: Pongo pygmaeus"
                    value={formData.nama_ilmiah}
                    onChange={(e) =>
                      handleChange("nama_ilmiah", e.target.value)
                    }
                    required
                    className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="nama_umum"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nama Umum
                  </Label>
                  <Input
                    id="nama_umum"
                    placeholder="Contoh: Orangutan Kalimantan"
                    value={formData.nama_umum}
                    onChange={(e) => handleChange("nama_umum", e.target.value)}
                    className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="kelas"
                      className="text-sm font-medium text-gray-700"
                    >
                      Kelas
                    </Label>
                    <Input
                      id="kelas"
                      placeholder="Contoh: Mammalia"
                      value={formData.kelas}
                      onChange={(e) => handleChange("kelas", e.target.value)}
                      className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="ordo"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ordo
                    </Label>
                    <Input
                      id="ordo"
                      placeholder="Contoh: Primates"
                      value={formData.ordo}
                      onChange={(e) => handleChange("ordo", e.target.value)}
                      className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ekologi */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    Ekologi
                  </h2>
                  <p className="text-sm text-gray-500">
                    Habitat dan karakteristik fauna
                  </p>
                </div>
                {user?.role === "regional_admin" && (
                  <button
                    type="button"
                    onClick={generateAllAI}
                    disabled={aiLoading}
                    className="text-sm px-3 py-1.5 border border-gray-300 hover:border-gray-900 rounded-md transition-colors disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin inline mr-1.5" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 inline mr-1.5" />
                        AI Generate
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="deskripsi"
                    className="text-sm font-medium text-gray-700"
                  >
                    Deskripsi Umum
                  </Label>
                  <Textarea
                    id="deskripsi"
                    placeholder="Deskripsikan fauna secara umum..."
                    value={formData.deskripsi}
                    onChange={(e) => handleChange("deskripsi", e.target.value)}
                    rows={5}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="habitat_sumber_makanan"
                    className="text-sm font-medium text-gray-700"
                  >
                    Habitat & Sumber Makanan
                  </Label>
                  <Textarea
                    id="habitat_sumber_makanan"
                    placeholder="Deskripsikan habitat dan sumber makanan fauna..."
                    value={formData.habitat_sumber_makanan}
                    onChange={(e) =>
                      handleChange("habitat_sumber_makanan", e.target.value)
                    }
                    rows={5}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Status & Konservasi */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Status & Konservasi
                </h2>
                <p className="text-sm text-gray-500">
                  Status hama, IUCN, dan endemisitas
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="status_hama"
                      className="text-sm font-medium text-gray-700"
                    >
                      Status Hama
                    </Label>
                    <Select
                      value={formData.status_hama}
                      onValueChange={(value) =>
                        handleChange("status_hama", value)
                      }
                    >
                      <SelectTrigger
                        id="status_hama"
                        className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0"
                      >
                        <SelectValue placeholder="Pilih status hama" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusHamaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.status_hama === "Ya" ||
                    formData.status_hama === "Potensial") && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="tingkat_hama"
                        className="text-sm font-medium text-gray-700"
                      >
                        Tingkat Hama
                      </Label>
                      <Select
                        value={formData.tingkat_hama}
                        onValueChange={(value) =>
                          handleChange("tingkat_hama", value)
                        }
                      >
                        <SelectTrigger
                          id="tingkat_hama"
                          className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0"
                        >
                          <SelectValue placeholder="Pilih tingkat hama" />
                        </SelectTrigger>
                        <SelectContent>
                          {tingkatHamaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="status_iucn"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status IUCN
                  </Label>
                  <Select
                    value={formData.status_iucn}
                    onValueChange={(value) =>
                      handleChange("status_iucn", value)
                    }
                  >
                    <SelectTrigger
                      id="status_iucn"
                      className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0"
                    >
                      <SelectValue placeholder="Pilih status IUCN" />
                    </SelectTrigger>
                    <SelectContent>
                      {iucnStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-4 px-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div>
                    <Label
                      htmlFor="is_endemic"
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Fauna Endemik Indonesia
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Tandai jika fauna ini endemik Indonesia
                    </p>
                  </div>
                  <Switch
                    id="is_endemic"
                    checked={formData.is_endemic}
                    onCheckedChange={(checked) =>
                      handleChange("is_endemic", checked)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Galeri Foto */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Galeri Foto
                </h2>
                <p className="text-sm text-gray-500">
                  Upload gambar utama dan tambahan
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Gambar Utama
                  </Label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    onFileRemove={() => setSelectedFile(null)}
                    selectedFile={selectedFile}
                    maxSize={10}
                    className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">atau</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Gambar Tambahan (Opsional)
                  </Label>
                  <p className="text-xs text-gray-500 -mt-1">
                    Upload hingga 10 gambar untuk galeri fauna
                  </p>
                  <MultipleFileUpload
                    onFilesSelect={handleFilesSelect}
                    onFileRemove={handleFileRemove}
                    selectedFiles={selectedFiles}
                    maxSize={10}
                    maxFiles={10}
                    className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">
                      atau gunakan URL
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="gambar_utama"
                    className="text-sm font-medium text-gray-700"
                  >
                    URL Gambar Eksternal
                  </Label>
                  <Input
                    id="gambar_utama"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.gambar_utama}
                    onChange={(e) =>
                      handleChange("gambar_utama", e.target.value)
                    }
                    className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Review Data
                </h2>
                <p className="text-sm text-gray-500">
                  Periksa kembali data sebelum menyimpan
                </p>
              </div>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Informasi Dasar
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama Ilmiah</span>
                      <span className="text-gray-900 font-medium">
                        {formData.nama_ilmiah || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama Umum</span>
                      <span className="text-gray-900 font-medium">
                        {formData.nama_umum || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ordo</span>
                      <span className="text-gray-900 font-medium">
                        {formData.ordo || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Ekologi
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">
                        Deskripsi
                      </span>
                      <p className="text-gray-900 line-clamp-3">
                        {formData.deskripsi || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">
                        Habitat & Sumber Makanan
                      </span>
                      <p className="text-gray-900 line-clamp-3">
                        {formData.habitat_sumber_makanan || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Status & Konservasi
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status IUCN</span>
                      <span className="text-gray-900 font-medium">
                        {formData.status_iucn || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Endemik</span>
                      <span className="text-gray-900 font-medium">
                        {formData.is_endemic ? "Ya" : "Tidak"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status Hama</span>
                      <span className="text-gray-900 font-medium">
                        {formData.status_hama || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Galeri Foto
                  </h3>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Gambar</span>
                      <span className="text-gray-900 font-medium">
                        {(selectedFile ? 1 : 0) + selectedFiles.length} gambar
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={(e) => prevStep(e)}
              disabled={currentStep === 1 || isSubmitting}
              className="text-sm px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4 inline" />
              Sebelumnya
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={(e) => nextStep(e)}
                className="text-sm px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                Selanjutnya
                <ArrowRight className="ml-1.5 h-4 w-4 inline" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={isSubmitting || uploading}
                  className="text-sm px-6 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || uploading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin inline" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4 inline" />
                      Simpan sebagai Draft
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "in_review")}
                  disabled={isSubmitting || uploading}
                  className="text-sm px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || uploading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin inline" />
                      Mengirim...
                    </>
                  ) : (
                    "Submit untuk Review"
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
