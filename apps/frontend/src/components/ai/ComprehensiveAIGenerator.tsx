"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Upload,
  FileText,
  Newspaper,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { userApi } from "@/lib/api-client";

interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface ArticleResponse {
  title: string;
  summary: string;
  content: string;
  success: boolean;
  message: string;
}

interface NewsResponse {
  headline: string;
  lead: string;
  content: string;
  success: boolean;
  message: string;
}

interface CSVExtractionResponse {
  success: boolean;
  message: string;
  analysis?: any;
  flora_data: any[];
  fauna_data: any[];
  articles_data: any[];
  total_records: number;
  valid_records: number;
}

export default function ComprehensiveAIGenerator() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("flora-fauna");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");
  const [parkLoading, setParkLoading] = useState(true);

  // Flora/Fauna states
  const [floraFaunaType, setFloraFaunaType] = useState<"flora" | "fauna">(
    "flora",
  );
  const [floraFaunaData, setFloraFaunaData] = useState({
    local_name: "",
    scientific_name: "",
    family: "",
    genus: "",
    is_endemic: false,
    iucn_status: "",
  });
  const [generatedFloraFauna, setGeneratedFloraFauna] = useState({
    description: "",
    morphology: "",
    benefits: "",
  });

  // Article states
  const [articleData, setArticleData] = useState({
    topic: "",
    category: "Konservasi",
    park_name: "",
    key_points: [""],
  });
  const [generatedArticle, setGeneratedArticle] =
    useState<ArticleResponse | null>(null);

  // News states
  const [newsData, setNewsData] = useState({
    event: "",
    location: "",
    park_name: "",
    impact: "",
  });
  const [generatedNews, setGeneratedNews] = useState<NewsResponse | null>(null);

  // CSV states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parkInfo, setParkInfo] = useState({
    park_id: "",
    park_name: "",
  });
  const [csvExtraction, setCsvExtraction] =
    useState<CSVExtractionResponse | null>(null);
  const [csvPreview, setCsvPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  // ✅ FIXED: Properly typed to avoid 'any' type errors
  const [editableMapping, setEditableMapping] = useState<{
    flora: Record<string, string>;
    fauna: Record<string, string>;
    articles: Record<string, string>;
  } | null>(null);

  // Fetch user detail with park information
  useEffect(() => {
    const fetchUserParkInfo = async () => {
      if (user?.id) {
        setParkLoading(true);
        try {
          // Fetch user detail with park information
          const userDetail = await userApi.getDetail(user.id, "park");

          if (userDetail.park_id && userDetail.park) {
            setParkInfo({
              park_id: userDetail.park_id.toString(),
              park_name: userDetail.park.name,
            });
          } else {
            // User doesn't have park assigned
            setParkInfo({
              park_id: "",
              park_name: "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user park info:", error);
          setParkInfo({
            park_id: "",
            park_name: "",
          });
        } finally {
          setParkLoading(false);
        }
      } else {
        setParkLoading(false);
      }
    };

    fetchUserParkInfo();
  }, [user]);

  // Auto-test Ollama connection on mount
  useEffect(() => {
    testOllamaConnection();
  }, []);

  const testOllamaConnection = async () => {
    setConnectionStatus("checking");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Request timeout after 15 seconds"));
    }, 15000); // 15 second timeout (backend optimized - ping only, max 10 seconds)

    try {
      console.log("Testing Ollama connection...");
      
      // Get auth token
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://38.47.93.167:8080") +
          "/api/v1/ai/test-ollama",
        {
          method: "GET",
          headers,
          signal: controller.signal,
        },
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        setConnectionStatus("connected");
        toast.success("Koneksi Ollama berhasil!");
      } else {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        setConnectionStatus("error");
        toast.error("Gagal terhubung ke Ollama: " + response.status);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus("error");
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Timeout: Ollama tidak merespons dalam 20 detik");
      } else {
        toast.error(
          "Gagal terhubung ke Ollama: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const generateFloraFauna = async (
    type: "description" | "morphology" | "benefits",
  ) => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Request timeout after 190 seconds"));
    }, 190000); // 190 second timeout (backend max 180 seconds for large models)

    try {
      const endpoint =
        type === "description"
          ? floraFaunaType === "flora"
            ? (process.env.NEXT_PUBLIC_API_URL ||
                "http://38.47.93.167:8080") +
              "/api/v1/ai/generate-flora-description"
            : (process.env.NEXT_PUBLIC_API_URL ||
                "http://38.47.93.167:8080") +
              "/api/v1/ai/generate-fauna-description"
          : floraFaunaType === "flora"
            ? (process.env.NEXT_PUBLIC_API_URL ||
                "http://38.47.93.167:8080") +
              "/api/v1/ai/generate-flora-" +
              type
            : (process.env.NEXT_PUBLIC_API_URL ||
                "http://38.47.93.167:8080") +
              "/api/v1/ai/generate-fauna-" +
              type;

      // Get auth token
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(floraFaunaData),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setGeneratedFloraFauna((prev) => ({
          ...prev,
          [type]: result.description,
        }));
        toast.success(
          (type === "description"
            ? "Deskripsi"
            : type === "morphology"
              ? "Morfologi"
              : "Manfaat") + " berhasil dibuat!",
        );
      } else {
        toast.error(result.message || "Gagal membuat deskripsi");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Timeout: Generate memakan waktu terlalu lama (max 70 detik)");
      } else {
        toast.error("Terjadi kesalahan saat generate deskripsi: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const generateArticle = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Request timeout after 190 seconds"));
    }, 190000); // 190 second timeout (backend max 180 seconds for large models)

    try {
      // Get auth token
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://38.47.93.167:8080") +
          "/api/v1/ai/generate-article",
        {
          method: "POST",
          headers,
          body: JSON.stringify(articleData),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ArticleResponse = await response.json();
      setGeneratedArticle(result);

      if (result.success) {
        toast.success("Artikel berhasil dibuat!");
      } else {
        toast.error(result.message || "Gagal membuat artikel");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Timeout: Generate artikel memakan waktu terlalu lama (max 70 detik)");
      } else {
        toast.error("Terjadi kesalahan saat generate artikel: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const generateNews = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Request timeout after 190 seconds"));
    }, 190000); // 190 second timeout (backend max 180 seconds for large models)

    try {
      // Get auth token
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://38.47.93.167:8080") +
          "/api/v1/ai/generate-news",
        {
          method: "POST",
          headers,
          body: JSON.stringify(newsData),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NewsResponse = await response.json();
      setGeneratedNews(result);

      if (result.success) {
        toast.success("Berita berhasil dibuat!");
      } else {
        toast.error(result.message || "Gagal membuat berita");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Timeout: Generate berita memakan waktu terlalu lama (max 70 detik)");
      } else {
        toast.error("Terjadi kesalahan saat generate berita: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleCsvPreview = async () => {
    if (!csvFile) {
      toast.error("Pilih file CSV terlebih dahulu");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Request timeout after 30 seconds"));
    }, 30000); // 30 second timeout for CSV preview

    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("park_id", parkInfo.park_id);
      formData.append("park_name", parkInfo.park_name);

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://38.47.93.167:8080") +
          "/api/v1/ai/preview-csv-mapping",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setCsvPreview(result);
        setEditableMapping(result.mapping);
        setShowPreview(true);
        toast.success("Preview mapping berhasil dibuat");
      } else {
        toast.error(result.message || "Gagal membuat preview mapping");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Timeout: Preview CSV memakan waktu terlalu lama (max 30 detik)");
      } else {
        toast.error("Terjadi kesalahan saat membuat preview: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error("Pilih file CSV terlebih dahulu");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Request timeout after 60 seconds"));
    }, 60000); // 60 second timeout for CSV extraction (could be large file)

    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("park_id", parkInfo.park_id);
      formData.append("park_name", parkInfo.park_name);

      // Get auth token
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "http://38.47.93.167:8080") +
          "/api/v1/ai/test-extract-csv",
        {
          method: "POST",
          headers,
          body: formData,
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CSVExtractionResponse = await response.json();
      setCsvExtraction(result);

      if (result.success) {
        toast.success(
          "Data CSV berhasil diekstrak: " +
            result.valid_records +
            " dari " +
            result.total_records +
            " record",
        );
      } else {
        toast.error(result.message || "Gagal mengekstrak data CSV");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Timeout: Upload CSV memakan waktu terlalu lama (max 60 detik)");
      } else {
        toast.error("Terjadi kesalahan saat upload CSV: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const addKeyPoint = () => {
    setArticleData((prev) => ({
      ...prev,
      key_points: [...prev.key_points, ""],
    }));
  };

  const updateKeyPoint = (index: number, value: string) => {
    setArticleData((prev) => ({
      ...prev,
      key_points: prev.key_points.map((point, i) =>
        i === index ? value : point,
      ),
    }));
  };

  const removeKeyPoint = (index: number) => {
    setArticleData((prev) => ({
      ...prev,
      key_points: prev.key_points.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          AI Comprehensive Generator
        </h1>
        <p className="text-muted-foreground">
          Sistem AI lengkap untuk otomatisasi konten keanekaragaman hayati
          Indonesia
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status Koneksi Ollama
          </CardTitle>
          <CardDescription>
            Pastikan Ollama terhubung sebelum menggunakan fitur AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={testOllamaConnection}
              disabled={loading}
              className="gap-2"
            >
              {connectionStatus === "checking" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : connectionStatus === "connected" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              Test Koneksi Ollama
            </Button>
            <Badge
              variant={
                connectionStatus === "connected" ? "default" : "destructive"
              }
              className="text-sm"
            >
              {connectionStatus === "checking"
                ? "Memeriksa..."
                : connectionStatus === "connected"
                  ? "Terhubung"
                  : "Terputus"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flora-fauna" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Flora & Fauna
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Artikel
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Berita
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        {/* Flora & Fauna Tab */}
        <TabsContent value="flora-fauna">
          <Card>
            <CardHeader>
              <CardTitle>Generate Flora & Fauna</CardTitle>
              <CardDescription>
                Buat deskripsi, morfologi, dan manfaat untuk flora/fauna
                Indonesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type Selection */}
              <div className="flex gap-4">
                <Button
                  variant={floraFaunaType === "flora" ? "default" : "outline"}
                  onClick={() => setFloraFaunaType("flora")}
                >
                  🌿 Flora
                </Button>
                <Button
                  variant={floraFaunaType === "fauna" ? "default" : "outline"}
                  onClick={() => setFloraFaunaType("fauna")}
                >
                  🐅 Fauna
                </Button>
              </div>

              {/* Data Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="local_name">Nama Lokal</Label>
                  <Input
                    id="local_name"
                    value={floraFaunaData.local_name}
                    onChange={(e) =>
                      setFloraFaunaData((prev) => ({
                        ...prev,
                        local_name: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Pohon Jati"
                  />
                </div>
                <div>
                  <Label htmlFor="scientific_name">Nama Ilmiah</Label>
                  <Input
                    id="scientific_name"
                    value={floraFaunaData.scientific_name}
                    onChange={(e) =>
                      setFloraFaunaData((prev) => ({
                        ...prev,
                        scientific_name: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Tectona grandis"
                  />
                </div>
                <div>
                  <Label htmlFor="family">Famili</Label>
                  <Input
                    id="family"
                    value={floraFaunaData.family}
                    onChange={(e) =>
                      setFloraFaunaData((prev) => ({
                        ...prev,
                        family: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Lamiaceae"
                  />
                </div>
                <div>
                  <Label htmlFor="genus">Genus</Label>
                  <Input
                    id="genus"
                    value={floraFaunaData.genus}
                    onChange={(e) =>
                      setFloraFaunaData((prev) => ({
                        ...prev,
                        genus: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Tectona"
                  />
                </div>
                <div>
                  <Label htmlFor="iucn_status">Status IUCN</Label>
                  <Select
                    value={floraFaunaData.iucn_status}
                    onValueChange={(value) =>
                      setFloraFaunaData((prev) => ({
                        ...prev,
                        iucn_status: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status IUCN" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LC">LC - Least Concern</SelectItem>
                      <SelectItem value="NT">NT - Near Threatened</SelectItem>
                      <SelectItem value="VU">VU - Vulnerable</SelectItem>
                      <SelectItem value="EN">EN - Endangered</SelectItem>
                      <SelectItem value="CR">
                        CR - Critically Endangered
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_endemic"
                    checked={floraFaunaData.is_endemic}
                    onChange={(e) =>
                      setFloraFaunaData((prev) => ({
                        ...prev,
                        is_endemic: e.target.checked,
                      }))
                    }
                  />
                  <Label htmlFor="is_endemic">Endemik Indonesia</Label>
                </div>
              </div>

              {/* Generate Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => generateFloraFauna("description")}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate Deskripsi
                </Button>
                {floraFaunaType === "flora" && (
                  <>
                    <Button
                      onClick={() => generateFloraFauna("morphology")}
                      disabled={loading}
                      variant="outline"
                    >
                      Generate Morfologi
                    </Button>
                    <Button
                      onClick={() => generateFloraFauna("benefits")}
                      disabled={loading}
                      variant="outline"
                    >
                      Generate Manfaat
                    </Button>
                  </>
                )}
              </div>

              {/* Generated Content */}
              {(generatedFloraFauna.description ||
                generatedFloraFauna.morphology ||
                generatedFloraFauna.benefits) && (
                <div className="space-y-4">
                  {generatedFloraFauna.description && (
                    <div>
                      <Label className="text-sm font-semibold">
                        Deskripsi:
                      </Label>
                      <Textarea
                        value={generatedFloraFauna.description}
                        readOnly
                        className="mt-1"
                        rows={6}
                      />
                    </div>
                  )}
                  {generatedFloraFauna.morphology && (
                    <div>
                      <Label className="text-sm font-semibold">
                        Morfologi:
                      </Label>
                      <Textarea
                        value={generatedFloraFauna.morphology}
                        readOnly
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  )}
                  {generatedFloraFauna.benefits && (
                    <div>
                      <Label className="text-sm font-semibold">Manfaat:</Label>
                      <Textarea
                        value={generatedFloraFauna.benefits}
                        readOnly
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>Generate Artikel</CardTitle>
              <CardDescription>
                Buat artikel lengkap tentang keanekaragaman hayati Indonesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="topic">Topik Artikel</Label>
                  <Input
                    id="topic"
                    value={articleData.topic}
                    onChange={(e) =>
                      setArticleData((prev) => ({
                        ...prev,
                        topic: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Konservasi Harimau Sumatera"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={articleData.category}
                    onValueChange={(value) =>
                      setArticleData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Konservasi">Konservasi</SelectItem>
                      <SelectItem value="Penelitian">Penelitian</SelectItem>
                      <SelectItem value="Edukasi">Edukasi</SelectItem>
                      <SelectItem value="Berita">Berita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="park_name">Nama Taman</Label>
                  <Input
                    id="park_name"
                    value={articleData.park_name}
                    onChange={(e) =>
                      setArticleData((prev) => ({
                        ...prev,
                        park_name: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Taman Nasional Gunung Leuser"
                  />
                </div>
              </div>

              <div>
                <Label>Poin-poin Penting</Label>
                <div className="space-y-2 mt-2">
                  {articleData.key_points.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) => updateKeyPoint(index, e.target.value)}
                        placeholder={"Poin " + (index + 1)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyPoint(index)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addKeyPoint}>
                    Tambah Poin
                  </Button>
                </div>
              </div>

              <Button onClick={generateArticle} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Artikel
              </Button>

              {generatedArticle && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Judul:</Label>
                    <Input
                      value={generatedArticle.title}
                      readOnly
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Ringkasan:</Label>
                    <Textarea
                      value={generatedArticle.summary}
                      readOnly
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Konten:</Label>
                    <Textarea
                      value={generatedArticle.content}
                      readOnly
                      className="mt-1"
                      rows={10}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>Generate Berita</CardTitle>
              <CardDescription>
                Buat berita profesional tentang keanekaragaman hayati Indonesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event">Peristiwa</Label>
                  <Input
                    id="event"
                    value={newsData.event}
                    onChange={(e) =>
                      setNewsData((prev) => ({
                        ...prev,
                        event: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Penemuan Spesies Baru"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Lokasi</Label>
                  <Input
                    id="location"
                    value={newsData.location}
                    onChange={(e) =>
                      setNewsData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Taman Nasional Kerinci Seblat"
                  />
                </div>
                <div>
                  <Label htmlFor="park_name">Nama Taman</Label>
                  <Input
                    id="park_name"
                    value={newsData.park_name}
                    onChange={(e) =>
                      setNewsData((prev) => ({
                        ...prev,
                        park_name: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Taman Nasional Kerinci Seblat"
                  />
                </div>
                <div>
                  <Label htmlFor="impact">Dampak</Label>
                  <Input
                    id="impact"
                    value={newsData.impact}
                    onChange={(e) =>
                      setNewsData((prev) => ({
                        ...prev,
                        impact: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Meningkatkan Status Konservasi"
                  />
                </div>
              </div>

              <Button onClick={generateNews} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Berita
              </Button>

              {generatedNews && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Headline:</Label>
                    <Input
                      value={generatedNews.headline}
                      readOnly
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Lead:</Label>
                    <Textarea
                      value={generatedNews.lead}
                      readOnly
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Konten:</Label>
                    <Textarea
                      value={generatedNews.content}
                      readOnly
                      className="mt-1"
                      rows={8}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle>CSV Data Import</CardTitle>
              <CardDescription>
                Upload file CSV taman dan biarkan AI mengekstrak data flora,
                fauna, dan artikel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parkLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">
                    Memuat informasi taman...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="park_id"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      ID Taman (Terkunci)
                    </Label>
                    <Input
                      id="park_id"
                      type="number"
                      value={parkInfo.park_id}
                      readOnly
                      className={
                        parkInfo.park_id
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-medium cursor-not-allowed"
                          : "bg-red-50 border-red-200 text-red-900 font-medium cursor-not-allowed"
                      }
                      placeholder={
                        parkInfo.park_id
                          ? "ID Taman"
                          : "User belum memiliki Park ID"
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ID Taman terkunci sesuai dengan user yang login
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="park_name"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Nama Taman (Terkunci)
                    </Label>
                    <Input
                      id="park_name"
                      value={parkInfo.park_name}
                      readOnly
                      className={
                        parkInfo.park_name
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-medium cursor-not-allowed"
                          : "bg-red-50 border-red-200 text-red-900 font-medium cursor-not-allowed"
                      }
                      placeholder={
                        parkInfo.park_name
                          ? "Nama Taman"
                          : "User belum memiliki Park Name"
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nama Taman terkunci sesuai dengan user yang login
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="csv_file">File CSV</Label>
                <Input
                  id="csv_file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCsvPreview}
                  disabled={loading || !csvFile || !parkInfo.park_id}
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Preview Mapping
                </Button>
                <Button
                  onClick={handleCsvUpload}
                  disabled={loading || !csvFile || !parkInfo.park_id}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {!parkInfo.park_id
                    ? "User belum memiliki Park ID"
                    : "Upload & Extract Data"}
                </Button>
              </div>

              {!parkInfo.park_id && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    User belum memiliki Park ID yang di-assign. Silakan hubungi
                    administrator untuk mengassign park ke user Anda.
                  </AlertDescription>
                </Alert>
              )}

              {csvExtraction && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {csvExtraction.success
                        ? "Data berhasil diekstrak: " +
                          csvExtraction.valid_records +
                          " dari " +
                          csvExtraction.total_records +
                          " record"
                        : csvExtraction.message}
                    </AlertDescription>
                  </Alert>

                  {csvExtraction.success && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {csvExtraction.flora_data.length}
                        </div>
                        <div className="text-sm text-green-800">Flora</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {csvExtraction.fauna_data.length}
                        </div>
                        <div className="text-sm text-blue-800">Fauna</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {csvExtraction.articles_data.length}
                        </div>
                        <div className="text-sm text-purple-800">Artikel</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CSV Preview Mapping */}
              {showPreview && csvPreview && (
                <div className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Preview Mapping CSV
                      </CardTitle>
                      <CardDescription>
                        Review dan edit mapping kolom CSV sebelum melakukan
                        import data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-600">
                            {csvPreview.total_rows}
                          </div>
                          <div className="text-sm text-gray-800">
                            Total Rows
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-600">
                            {csvPreview.columns.length}
                          </div>
                          <div className="text-sm text-gray-800">Columns</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-600">
                            {csvPreview.mapping?.mapping_strategy ||
                              "intelligent"}
                          </div>
                          <div className="text-sm text-gray-800">Strategy</div>
                        </div>
                      </div>

                      {/* Flora Mapping */}
                      {editableMapping?.flora &&
                        Object.keys(editableMapping.flora).length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-700 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Flora Mapping
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(editableMapping.flora).map(
                                ([field, csvCol]) => (
                                  <div
                                    key={field}
                                    className="flex items-center gap-2 p-2 bg-green-50 rounded border"
                                  >
                                    <span className="font-medium text-green-800 w-32">
                                      {field}
                                    </span>
                                    <span className="text-gray-600">→</span>
                                    <Select
                                      value={csvCol as string}
                                      onValueChange={(value) => {
                                        setEditableMapping((prev) => {
                                          if (!prev) return prev;
                                          return {
                                            ...prev,
                                            flora: {
                                              ...prev.flora,
                                              [field]: value,
                                            },
                                          };
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {csvPreview.columns.map(
                                          (col: string) => (
                                            <SelectItem key={col} value={col}>
                                              {col}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Fauna Mapping */}
                      {editableMapping?.fauna &&
                        Object.keys(editableMapping.fauna).length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Fauna Mapping
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(editableMapping.fauna).map(
                                ([field, csvCol]) => (
                                  <div
                                    key={field}
                                    className="flex items-center gap-2 p-2 bg-blue-50 rounded border"
                                  >
                                    <span className="font-medium text-blue-800 w-32">
                                      {field}
                                    </span>
                                    <span className="text-gray-600">→</span>
                                    <Select
                                      value={csvCol as string}
                                      onValueChange={(value) => {
                                        setEditableMapping((prev) => {
                                          if (!prev) return prev;
                                          return {
                                            ...prev,
                                            fauna: {
                                              ...prev.fauna,
                                              [field]: value,
                                            },
                                          };
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {csvPreview.columns.map(
                                          (col: string) => (
                                            <SelectItem key={col} value={col}>
                                              {col}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Articles Mapping */}
                      {editableMapping?.articles &&
                        Object.keys(editableMapping.articles).length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Articles Mapping
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(editableMapping.articles).map(
                                ([field, csvCol]) => (
                                  <div
                                    key={field}
                                    className="flex items-center gap-2 p-2 bg-purple-50 rounded border"
                                  >
                                    <span className="font-medium text-purple-800 w-32">
                                      {field}
                                    </span>
                                    <span className="text-gray-600">→</span>
                                    <Select
                                      value={csvCol as string}
                                      onValueChange={(value) => {
                                        setEditableMapping((prev) => {
                                          if (!prev) return prev;
                                          return {
                                            ...prev,
                                            articles: {
                                              ...prev.articles,
                                              [field]: value,
                                            },
                                          };
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {csvPreview.columns.map(
                                          (col: string) => (
                                            <SelectItem key={col} value={col}>
                                              {col}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Sample Data Preview */}
                      {csvPreview.sample_data && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-700">
                            Sample Data (First 5 rows)
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200 rounded-lg">
                              <thead className="bg-gray-50">
                                <tr>
                                  {csvPreview.columns.map((col: string) => (
                                    <th
                                      key={col}
                                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {Array.from(
                                  {
                                    length: Math.min(5, csvPreview.total_rows),
                                  },
                                  (_, i) => (
                                    <tr key={i}>
                                      {csvPreview.columns.map((col: string) => (
                                        <td
                                          key={col}
                                          className="px-3 py-2 text-sm text-gray-900 border-b"
                                        >
                                          {csvPreview.sample_data[col]?.[i] ||
                                            "-"}
                                        </td>
                                      ))}
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => setShowPreview(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            // TODO: Implement upload with custom mapping
                            toast.success(
                              "Mapping berhasil disimpan! Silakan klik Upload & Extract Data untuk melanjutkan.",
                            );
                            setShowPreview(false);
                          }}
                        >
                          Save Mapping & Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
