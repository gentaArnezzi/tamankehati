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
  BookOpen,
  Shield,
  Camera,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { floraApi } from "../../../../lib/api-client";
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

const STEPS = [
  { id: 1, title: "Informasi Dasar", icon: FileText },
  { id: 2, title: "Deskripsi", icon: BookOpen },
  { id: 3, title: "Status Konservasi", icon: Shield },
  { id: 4, title: "Galeri Foto", icon: Camera },
  { id: 5, title: "Review", icon: Eye },
];

export default function CreateFloraPage() {
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
  const [selectedLeafImage, setSelectedLeafImage] = useState<File | null>(null);
  const [selectedStemImage, setSelectedStemImage] = useState<File | null>(null);
  const [selectedFlowerImage, setSelectedFlowerImage] = useState<File | null>(
    null,
  );
  const [selectedFruitImage, setSelectedFruitImage] = useState<File | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nama_ilmiah: "",
    nama_umum: "",
    famili: "",
    genus: "",
    sinonim: "",
    deskripsi: "",
    morfologi: "",
    waktu_berbunga: "",
    penyebaran: "",
    metode_perbanyakan: "",
    manfaat: "",
    referensi: "",
    status_iucn: "",
    is_endemic: false,
    gambar_utama: "",
    gambar_daun: "",
    gambar_batang: "",
    gambar_bunga: "",
    gambar_buah: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // File upload functions
  const uploadFile = async (file: File): Promise<string> => {
    console.log("Uploading flora image:", file.name, "Size:", file.size);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://38.47.93.167:8080") +
          "/api/v1/upload/gallery-image",
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
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
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

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://38.47.93.167:8080") +
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
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
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

  // AI Functions

  // Generate all AI content sequentially (one by one) to avoid timeout
  const generateAllAI = async () => {
    if (user?.role !== "regional_admin") {
      toast.error("AI features hanya dapat digunakan oleh Regional Admin");
      return;
    }

    setAiLoading(true);

    try {
      const aiData = {
        local_name: formData.nama_umum || "",
        scientific_name: formData.nama_ilmiah || "",
        family: formData.famili || "",
        genus: formData.genus || "",
        is_endemic: formData.is_endemic || false,
        iucn_status: formData.status_iucn || "",
      };

      const base =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://38.47.93.167:8080";

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

      // Step 1: Generate Description first
      const descriptionToastId = toast.loading("Membuat deskripsi dengan AI...");
      const descriptionController = new AbortController();
      const descriptionTimeout = setTimeout(() => descriptionController.abort(), 120000); // 120s timeout per request

      const descriptionRes = await fetch(
        base + "/api/v1/ai/generate-flora-description",
        {
          method: "POST",
          headers,
          body: JSON.stringify(aiData),
          signal: descriptionController.signal,
        },
      );

      clearTimeout(descriptionTimeout);

      if (!descriptionRes.ok) {
        toast.error(`Gagal membuat deskripsi (${descriptionRes.status})`, { id: descriptionToastId });
        throw new Error(`Gagal membuat deskripsi (${descriptionRes.status})`);
      }

      const descriptionResult = await descriptionRes.json();

      if (!descriptionResult.description) {
        toast.error("AI tidak menghasilkan deskripsi yang valid", { id: descriptionToastId });
        throw new Error("AI tidak menghasilkan deskripsi yang valid");
      }

      // Update description field
      setFormData((prev) => ({
        ...prev,
        deskripsi: descriptionResult.description,
      }));

      toast.success("Deskripsi berhasil dibuat!", { id: descriptionToastId });

      // Step 2: Generate Morphology after description is done
      const morphologyToastId = toast.loading("Membuat morfologi dengan AI...");
      const morphologyController = new AbortController();
      const morphologyTimeout = setTimeout(() => morphologyController.abort(), 120000);

      const morphologyRes = await fetch(
        base + "/api/v1/ai/generate-flora-morphology",
        {
          method: "POST",
          headers,
          body: JSON.stringify(aiData),
          signal: morphologyController.signal,
        },
      );

      clearTimeout(morphologyTimeout);

      if (!morphologyRes.ok) {
        toast.error(`Gagal membuat morfologi (${morphologyRes.status})`, { id: morphologyToastId });
        throw new Error(`Gagal membuat morfologi (${morphologyRes.status})`);
      }

      const morphologyResult = await morphologyRes.json();

      if (!morphologyResult.description) {
        toast.error("AI tidak menghasilkan morfologi yang valid", { id: morphologyToastId });
        throw new Error("AI tidak menghasilkan morfologi yang valid");
      }

      // Update morphology field
      setFormData((prev) => ({
        ...prev,
        morfologi: morphologyResult.description,
      }));

      toast.success("Morfologi berhasil dibuat!", { id: morphologyToastId });

      // Step 3: Generate Benefits after morphology is done
      const benefitsToastId = toast.loading("Membuat manfaat dengan AI...");
      const benefitsController = new AbortController();
      const benefitsTimeout = setTimeout(() => benefitsController.abort(), 120000);

      const benefitsRes = await fetch(
        base + "/api/v1/ai/generate-flora-benefits",
        {
          method: "POST",
          headers,
          body: JSON.stringify(aiData),
          signal: benefitsController.signal,
        },
      );

      clearTimeout(benefitsTimeout);

      if (!benefitsRes.ok) {
        toast.error(`Gagal membuat manfaat (${benefitsRes.status})`, { id: benefitsToastId });
        throw new Error(`Gagal membuat manfaat (${benefitsRes.status})`);
      }

      const benefitsResult = await benefitsRes.json();

      if (!benefitsResult.description) {
        toast.error("AI tidak menghasilkan manfaat yang valid", { id: benefitsToastId });
        throw new Error("AI tidak menghasilkan manfaat yang valid");
      }

      // Update benefits field
      setFormData((prev) => ({
        ...prev,
        manfaat: benefitsResult.description,
      }));

      toast.success("Semua deskripsi berhasil dibuat dengan AI!", { id: benefitsToastId });
    } catch (error) {
      console.error("Error generating AI content:", error);
      const err = error as Error & { name?: string; message?: string };

      // Dismiss any loading toasts
      toast.dismiss();

      if (err.name === "AbortError") {
        toast.error(
          "AI generation timeout. Pastikan Ollama berjalan dan coba lagi.",
        );
      } else if (err.message?.includes("Failed to fetch")) {
        toast.error(
          "Tidak dapat terhubung ke AI service. Pastikan backend berjalan.",
        );
      } else {
        toast.error(`Gagal membuat deskripsi AI: ${err.message || "Unknown error"}`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    submitStatus: "draft" | "in_review" = "in_review",
  ) => {
    e.preventDefault();

    // Only submit when at review step
    if (currentStep !== STEPS.length) {
      console.log(
        "Submit blocked - not at review step. Current step:",
        currentStep,
      );
      return;
    }

    console.log("Submitting flora data with status:", submitStatus);

    // Validation
    if (!formData.nama_ilmiah.trim()) {
      toast.error("Nama ilmiah wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploading(true);

      let imageUrl = formData.gambar_utama;
      let uploadedImageUrls: string[] = [];
      let leafImageUrl = formData.gambar_daun;
      let stemImageUrl = formData.gambar_batang;
      let flowerImageUrl = formData.gambar_bunga;
      let fruitImageUrl = formData.gambar_buah;

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
        ...formData,
        gambar_utama: imageUrl,
        gambar_daun: leafImageUrl,
        gambar_batang: stemImageUrl,
        gambar_bunga: flowerImageUrl,
        gambar_buah: fruitImageUrl,
        status: submitStatus, // ✅ Use status from button click
      };

      // Submit flora data
      const floraResult = await floraApi.create(floraData);

      // Create gallery records for all uploaded images
      if (floraResult?.id) {
        try {
          const { createGalleryForEntity } = await import(
            "../../../../lib/gallery-integration"
          );

          // Create gallery record for main image if single file was uploaded
          if (selectedFile && imageUrl) {
            await createGalleryForEntity(imageUrl, {
              entityType: "flora",
              entityId: floraResult.id,
              title: `${formData.nama_umum || formData.nama_ilmiah} - ${formData.nama_ilmiah} (Gambar Utama)`,
              description: formData.deskripsi || "",
              parkId: 1,
            });
            console.log(
              "Gallery record created for main flora image:",
              floraResult.id,
            );
          }

          // Create gallery records for multiple images
          for (let i = 0; i < uploadedImageUrls.length; i++) {
            const url = uploadedImageUrls[i];
            const isMainImage = selectedFile && url === imageUrl;

            await createGalleryForEntity(url, {
              entityType: "flora",
              entityId: floraResult.id,
              title: `${formData.nama_umum || formData.nama_ilmiah} - ${formData.nama_ilmiah} ${isMainImage ? "(Gambar Utama)" : `(Gambar ${i + 1})`}`,
              description: formData.deskripsi || "",
              parkId: 1,
            });
            console.log(
              `Gallery record created for flora image ${i + 1}:`,
              floraResult.id,
            );
          }
        } catch (galleryError) {
          console.error("Failed to create gallery records:", galleryError);
          // Don't fail the entire operation if gallery creation fails
        }
      }

      toast.success("Data flora berhasil ditambahkan");
      router.push("/dashboard/taman/flora");
    } catch (error: any) {
      console.error("Error creating flora:", error);
      toast.error(error.message || "Gagal menyimpan data flora");
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.back();
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
                Tambah Data Flora
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
                  Informasi identitas dan taksonomi flora
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
                    placeholder="Contoh: Rafflesia arnoldii"
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
                    placeholder="Contoh: Rafflesia"
                    value={formData.nama_umum}
                    onChange={(e) => handleChange("nama_umum", e.target.value)}
                    className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="famili"
                      className="text-sm font-medium text-gray-700"
                    >
                      Famili
                    </Label>
                    <Input
                      id="famili"
                      placeholder="Contoh: Rafflesiaceae"
                      value={formData.famili}
                      onChange={(e) => handleChange("famili", e.target.value)}
                      className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="genus"
                      className="text-sm font-medium text-gray-700"
                    >
                      Genus
                    </Label>
                    <Input
                      id="genus"
                      placeholder="Contoh: Rafflesia"
                      value={formData.genus}
                      onChange={(e) => handleChange("genus", e.target.value)}
                      className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="sinonim"
                    className="text-sm font-medium text-gray-700"
                  >
                    Sinonim
                  </Label>
                  <Textarea
                    id="sinonim"
                    placeholder="Nama-nama sinonim atau nama lain dari flora ini"
                    value={formData.sinonim}
                    onChange={(e) => handleChange("sinonim", e.target.value)}
                    rows={2}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="waktu_berbunga"
                    className="text-sm font-medium text-gray-700"
                  >
                    Waktu Berbunga
                  </Label>
                  <Input
                    id="waktu_berbunga"
                    placeholder="Contoh: Januari - Maret, atau sepanjang tahun"
                    value={formData.waktu_berbunga}
                    onChange={(e) =>
                      handleChange("waktu_berbunga", e.target.value)
                    }
                    className="h-11 border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Deskripsi */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    Deskripsi
                  </h2>
                  <p className="text-sm text-gray-500">
                    Informasi detail tentang flora
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
                    placeholder="Deskripsikan flora secara umum..."
                    value={formData.deskripsi}
                    onChange={(e) => handleChange("deskripsi", e.target.value)}
                    rows={5}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="morfologi"
                    className="text-sm font-medium text-gray-700"
                  >
                    Morfologi
                  </Label>
                  <Textarea
                    id="morfologi"
                    placeholder="Deskripsikan ciri morfologi (bentuk, ukuran, warna, dll)..."
                    value={formData.morfologi}
                    onChange={(e) => handleChange("morfologi", e.target.value)}
                    rows={5}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="manfaat"
                    className="text-sm font-medium text-gray-700"
                  >
                    Manfaat
                  </Label>
                  <Textarea
                    id="manfaat"
                    placeholder="Deskripsikan manfaat flora (ekologi, ekonomi, medis, dll)..."
                    value={formData.manfaat}
                    onChange={(e) => handleChange("manfaat", e.target.value)}
                    rows={5}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="penyebaran"
                    className="text-sm font-medium text-gray-700"
                  >
                    Penyebaran
                  </Label>
                  <Textarea
                    id="penyebaran"
                    placeholder="Daerah penyebaran flora ini, misalnya: Sumatra, Kalimantan, Papua"
                    value={formData.penyebaran}
                    onChange={(e) => handleChange("penyebaran", e.target.value)}
                    rows={3}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="metode_perbanyakan"
                    className="text-sm font-medium text-gray-700"
                  >
                    Metode Perbanyakan
                  </Label>
                  <Textarea
                    id="metode_perbanyakan"
                    placeholder="Cara perbanyakan flora ini, misalnya: biji, stek, cangkok, kultur jaringan"
                    value={formData.metode_perbanyakan}
                    onChange={(e) =>
                      handleChange("metode_perbanyakan", e.target.value)
                    }
                    rows={3}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="referensi"
                    className="text-sm font-medium text-gray-700"
                  >
                    Referensi
                  </Label>
                  <Textarea
                    id="referensi"
                    placeholder="Sumber referensi, jurnal, buku, atau literatur lainnya"
                    value={formData.referensi}
                    onChange={(e) => handleChange("referensi", e.target.value)}
                    rows={3}
                    className="border-gray-300 focus:border-gray-900 focus:ring-0 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Status Konservasi */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Status Konservasi
                </h2>
                <p className="text-sm text-gray-500">
                  Informasi status dan endemisitas
                </p>
              </div>

              <div className="space-y-6">
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
                      Flora Endemik Indonesia
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Tandai jika flora ini endemik Indonesia
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
                  Upload gambar utama dan gambar tambahan untuk flora
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
                    Upload hingga 10 gambar tambahan untuk flora ini
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
                  {formData.gambar_utama && (
                    <div className="mt-3 rounded-lg border border-gray-200 p-2">
                      <img
                        src={formData.gambar_utama}
                        alt="Preview"
                        className="h-48 w-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Gambar Detail Flora (Opsional)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Tambahkan gambar detail untuk dokumentasi lengkap
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Gambar Daun */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Gambar Pertelaan Daun
                      </Label>
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
                      <Input
                        type="url"
                        placeholder="https://example.com/daun.jpg"
                        value={formData.gambar_daun}
                        onChange={(e) =>
                          handleChange("gambar_daun", e.target.value)
                        }
                        className="h-9 text-xs border-gray-300 focus:border-gray-900 focus:ring-0"
                      />
                    </div>

                    {/* Gambar Batang */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Gambar Batang/Percabangan
                      </Label>
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
                      <Input
                        type="url"
                        placeholder="https://example.com/batang.jpg"
                        value={formData.gambar_batang}
                        onChange={(e) =>
                          handleChange("gambar_batang", e.target.value)
                        }
                        className="h-9 text-xs border-gray-300 focus:border-gray-900 focus:ring-0"
                      />
                    </div>

                    {/* Gambar Bunga */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Gambar Bunga
                      </Label>
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
                      <Input
                        type="url"
                        placeholder="https://example.com/bunga.jpg"
                        value={formData.gambar_bunga}
                        onChange={(e) =>
                          handleChange("gambar_bunga", e.target.value)
                        }
                        className="h-9 text-xs border-gray-300 focus:border-gray-900 focus:ring-0"
                      />
                    </div>

                    {/* Gambar Buah */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Gambar Buah
                      </Label>
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
                      <Input
                        type="url"
                        placeholder="https://example.com/buah.jpg"
                        value={formData.gambar_buah}
                        onChange={(e) =>
                          handleChange("gambar_buah", e.target.value)
                        }
                        className="h-9 text-xs border-gray-300 focus:border-gray-900 focus:ring-0"
                      />
                    </div>
                  </div>
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
                      <span className="text-gray-500">Famili</span>
                      <span className="text-gray-900 font-medium">
                        {formData.famili || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Genus</span>
                      <span className="text-gray-900 font-medium">
                        {formData.genus || "-"}
                      </span>
                    </div>
                    {formData.sinonim && (
                      <div>
                        <span className="text-gray-500 block mb-1">
                          Sinonim
                        </span>
                        <p className="text-gray-900">{formData.sinonim}</p>
                      </div>
                    )}
                    {formData.waktu_berbunga && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Waktu Berbunga</span>
                        <span className="text-gray-900 font-medium">
                          {formData.waktu_berbunga}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Deskripsi
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">
                        Deskripsi Umum
                      </span>
                      <p className="text-gray-900 line-clamp-3">
                        {formData.deskripsi || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">
                        Morfologi
                      </span>
                      <p className="text-gray-900 line-clamp-3">
                        {formData.morfologi || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Manfaat</span>
                      <p className="text-gray-900 line-clamp-3">
                        {formData.manfaat || "-"}
                      </p>
                    </div>
                    {formData.penyebaran && (
                      <div>
                        <span className="text-gray-500 block mb-1">
                          Penyebaran
                        </span>
                        <p className="text-gray-900 line-clamp-2">
                          {formData.penyebaran}
                        </p>
                      </div>
                    )}
                    {formData.metode_perbanyakan && (
                      <div>
                        <span className="text-gray-500 block mb-1">
                          Metode Perbanyakan
                        </span>
                        <p className="text-gray-900 line-clamp-2">
                          {formData.metode_perbanyakan}
                        </p>
                      </div>
                    )}
                    {formData.referensi && (
                      <div>
                        <span className="text-gray-500 block mb-1">
                          Referensi
                        </span>
                        <p className="text-gray-900 line-clamp-2">
                          {formData.referensi}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Status Konservasi
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
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Galeri Foto
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Gambar</span>
                      <span className="text-gray-900 font-medium">
                        {(selectedFile ? 1 : 0) + selectedFiles.length} gambar
                      </span>
                    </div>
                    {(formData.gambar_daun || selectedLeafImage) && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Gambar Daun</span>
                          <span className="text-green-600 text-xs">
                            ✓ Tersedia
                          </span>
                        </div>
                        {selectedLeafImage && (
                          <div className="mt-2 relative w-24 h-24 rounded border border-gray-200 overflow-hidden">
                            <img
                              src={URL.createObjectURL(selectedLeafImage)}
                              alt="Preview Daun"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {(formData.gambar_batang || selectedStemImage) && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Gambar Batang</span>
                          <span className="text-green-600 text-xs">
                            ✓ Tersedia
                          </span>
                        </div>
                        {selectedStemImage && (
                          <div className="mt-2 relative w-24 h-24 rounded border border-gray-200 overflow-hidden">
                            <img
                              src={URL.createObjectURL(selectedStemImage)}
                              alt="Preview Batang"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {(formData.gambar_bunga || selectedFlowerImage) && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Gambar Bunga</span>
                          <span className="text-green-600 text-xs">
                            ✓ Tersedia
                          </span>
                        </div>
                        {selectedFlowerImage && (
                          <div className="mt-2 relative w-24 h-24 rounded border border-gray-200 overflow-hidden">
                            <img
                              src={URL.createObjectURL(selectedFlowerImage)}
                              alt="Preview Bunga"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {(formData.gambar_buah || selectedFruitImage) && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Gambar Buah</span>
                          <span className="text-green-600 text-xs">
                            ✓ Tersedia
                          </span>
                        </div>
                        {selectedFruitImage && (
                          <div className="mt-2 relative w-24 h-24 rounded border border-gray-200 overflow-hidden">
                            <img
                              src={URL.createObjectURL(selectedFruitImage)}
                              alt="Preview Buah"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
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
