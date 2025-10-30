"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface RegionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RegionFormData {
  name: string;
  code: string;
  timezone: string;
  is_active: boolean;
}

export function RegionForm({ onSuccess, onCancel }: RegionFormProps) {
  const [formData, setFormData] = useState<RegionFormData>({
    name: "",
    code: "",
    timezone: "Asia/Jakarta",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/v1/crud/regions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Gagal membuat region");
      }

      const result = await response.json();
      toast.success(`Region "${result.name}" berhasil dibuat`);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal membuat region";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof RegionFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Region Baru
        </CardTitle>
        <CardDescription>
          Buat region baru untuk mengelola taman konservasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Region</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Contoh: DKI Jakarta"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Kode Region</Label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              placeholder="Contoh: JKT"
              required
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              type="text"
              value={formData.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              placeholder="Asia/Jakarta"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_active">Region Aktif</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Membuat...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Region
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
