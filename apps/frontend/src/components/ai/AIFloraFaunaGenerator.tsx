"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
import { Switch } from "../ui/switch";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface FloraData {
  local_name?: string;
  scientific_name?: string;
  family?: string;
  genus?: string;
  is_endemic?: boolean;
  iucn_status?: string;
}

interface FaunaData {
  local_name?: string;
  scientific_name?: string;
  family?: string;
  genus?: string;
  is_endemic?: boolean;
  iucn_status?: string;
}

interface AIResponse {
  description: string;
  success: boolean;
  message: string;
}

const IUCN_STATUSES = [
  { value: "EX", label: "Extinct (EX)" },
  { value: "EW", label: "Extinct in the Wild (EW)" },
  { value: "CR", label: "Critically Endangered (CR)" },
  { value: "EN", label: "Endangered (EN)" },
  { value: "VU", label: "Vulnerable (VU)" },
  { value: "NT", label: "Near Threatened (NT)" },
  { value: "LC", label: "Least Concern (LC)" },
  { value: "DD", label: "Data Deficient (DD)" },
  { value: "NE", label: "Not Evaluated (NE)" },
];

export default function AIFloraFaunaGenerator() {
  const [type, setType] = useState<"flora" | "fauna">("flora");
  const [loading, setLoading] = useState(false);
  const [floraData, setFloraData] = useState<FloraData>({});
  const [faunaData, setFaunaData] = useState<FaunaData>({});
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [generatedMorphology, setGeneratedMorphology] = useState("");
  const [generatedBenefits, setGeneratedBenefits] = useState("");
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://38.47.93.167:8080";

  const buildAuthHeaders = () => {
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

    return headers;
  };

  const handleFloraDataChange = (
    field: keyof FloraData,
    value: string | boolean,
  ) => {
    setFloraData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFaunaDataChange = (
    field: keyof FaunaData,
    value: string | boolean,
  ) => {
    setFaunaData((prev) => ({ ...prev, [field]: value }));
  };

  const generateDescription = async () => {
    setLoading(true);
    try {
      const endpoint =
        type === "flora"
          ? base + "/api/v1/ai/generate-flora-description"
          : base + "/api/v1/ai/generate-fauna-description";

      const data = type === "flora" ? floraData : faunaData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const result: AIResponse = await response.json();
      setGeneratedDescription(result.description);
      toast.success(result.message);
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Gagal membuat deskripsi. Pastikan Ollama sudah running.");
    } finally {
      setLoading(false);
    }
  };

  const generateMorphology = async () => {
    if (type !== "flora") return;

    setLoading(true);
    try {
      const response = await fetch(
        base + "/api/v1/ai/generate-flora-morphology",
        {
          method: "POST",
          headers: buildAuthHeaders(),
          body: JSON.stringify(floraData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate morphology");
      }

      const result: AIResponse = await response.json();
      setGeneratedMorphology(result.description);
      toast.success(result.message);
    } catch (error) {
      console.error("Error generating morphology:", error);
      toast.error("Gagal membuat deskripsi morfologi.");
    } finally {
      setLoading(false);
    }
  };

  const generateBenefits = async () => {
    if (type !== "flora") return;

    setLoading(true);
    try {
      const response = await fetch(
        base + "/api/v1/ai/generate-flora-benefits",
        {
          method: "POST",
          headers: buildAuthHeaders(),
          body: JSON.stringify(floraData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate benefits");
      }

      const result: AIResponse = await response.json();
      setGeneratedBenefits(result.description);
      toast.success(result.message);
    } catch (error) {
      console.error("Error generating benefits:", error);
      toast.error("Gagal membuat deskripsi manfaat.");
    } finally {
      setLoading(false);
    }
  };

  const testOllamaConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(base + "/api/v1/ai/test-ollama", {
        method: "GET",
        headers: buildAuthHeaders(),
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Koneksi Ollama berhasil!");
        console.log("Test description:", result.test_description);
      } else {
        toast.error(`Koneksi Ollama gagal: ${result.message}`);
      }
    } catch (error) {
      console.error("Error testing Ollama:", error);
      toast.error("Gagal menguji koneksi Ollama.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFloraData({});
    setFaunaData({});
    setGeneratedDescription("");
    setGeneratedMorphology("");
    setGeneratedBenefits("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Flora & Fauna Generator
          </CardTitle>
          <CardDescription>
            Otomatisasi pembuatan deskripsi flora dan fauna menggunakan AI lokal
            (Ollama)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type Selection */}
          <div className="flex gap-4">
            <Button
              variant={type === "flora" ? "default" : "outline"}
              onClick={() => setType("flora")}
            >
              🌿 Flora
            </Button>
            <Button
              variant={type === "fauna" ? "default" : "outline"}
              onClick={() => setType("fauna")}
            >
              🐅 Fauna
            </Button>
            <Button
              variant="outline"
              onClick={testOllamaConnection}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Test Ollama
            </Button>
          </div>

          {/* Data Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local_name">Nama Lokal</Label>
              <Input
                id="local_name"
                placeholder="Contoh: Pohon Jati"
                value={
                  type === "flora"
                    ? floraData.local_name || ""
                    : faunaData.local_name || ""
                }
                onChange={(e) => {
                  if (type === "flora") {
                    handleFloraDataChange("local_name", e.target.value);
                  } else {
                    handleFaunaDataChange("local_name", e.target.value);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scientific_name">Nama Ilmiah</Label>
              <Input
                id="scientific_name"
                placeholder="Contoh: Tectona grandis"
                value={
                  type === "flora"
                    ? floraData.scientific_name || ""
                    : faunaData.scientific_name || ""
                }
                onChange={(e) => {
                  if (type === "flora") {
                    handleFloraDataChange("scientific_name", e.target.value);
                  } else {
                    handleFaunaDataChange("scientific_name", e.target.value);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family">Famili</Label>
              <Input
                id="family"
                placeholder="Contoh: Lamiaceae"
                value={
                  type === "flora"
                    ? floraData.family || ""
                    : faunaData.family || ""
                }
                onChange={(e) => {
                  if (type === "flora") {
                    handleFloraDataChange("family", e.target.value);
                  } else {
                    handleFaunaDataChange("family", e.target.value);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genus">Genus</Label>
              <Input
                id="genus"
                placeholder="Contoh: Tectona"
                value={
                  type === "flora"
                    ? floraData.genus || ""
                    : faunaData.genus || ""
                }
                onChange={(e) => {
                  if (type === "flora") {
                    handleFloraDataChange("genus", e.target.value);
                  } else {
                    handleFaunaDataChange("genus", e.target.value);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iucn_status">Status IUCN</Label>
              <Select
                value={
                  type === "flora"
                    ? floraData.iucn_status || ""
                    : faunaData.iucn_status || ""
                }
                onValueChange={(value) => {
                  if (type === "flora") {
                    handleFloraDataChange("iucn_status", value);
                  } else {
                    handleFaunaDataChange("iucn_status", value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status IUCN" />
                </SelectTrigger>
                <SelectContent>
                  {IUCN_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_endemic"
                checked={
                  type === "flora"
                    ? floraData.is_endemic || false
                    : faunaData.is_endemic || false
                }
                onCheckedChange={(checked) => {
                  if (type === "flora") {
                    handleFloraDataChange("is_endemic", checked);
                  } else {
                    handleFaunaDataChange("is_endemic", checked);
                  }
                }}
              />
              <Label htmlFor="is_endemic">Endemik Indonesia</Label>
            </div>
          </div>

          {/* Generate Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateDescription}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Deskripsi
            </Button>

            {type === "flora" && (
              <>
                <Button
                  onClick={generateMorphology}
                  disabled={loading}
                  variant="outline"
                >
                  Generate Morfologi
                </Button>
                <Button
                  onClick={generateBenefits}
                  disabled={loading}
                  variant="outline"
                >
                  Generate Manfaat
                </Button>
              </>
            )}

            <Button onClick={clearAll} variant="outline" disabled={loading}>
              Clear All
            </Button>
          </div>

          {/* Generated Content */}
          {generatedDescription && (
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi yang Dihasilkan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedDescription}
                  readOnly
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          )}

          {generatedMorphology && (
            <Card>
              <CardHeader>
                <CardTitle>Morfologi yang Dihasilkan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedMorphology}
                  readOnly
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
          )}

          {generatedBenefits && (
            <Card>
              <CardHeader>
                <CardTitle>Manfaat yang Dihasilkan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedBenefits}
                  readOnly
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
