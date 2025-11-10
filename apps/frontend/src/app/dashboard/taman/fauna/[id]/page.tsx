"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { faunaApi, Fauna } from "../../../../../lib/api-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { ArrowLeft, Bird } from "lucide-react";
import { toast } from "sonner";

export default function FaunaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [fauna, setFauna] = useState<Fauna | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaunaDetail();
  }, [id]);

  const loadFaunaDetail = async () => {
    try {
      setLoading(true);
      const data = await faunaApi.getById(id);
      setFauna(data);
    } catch (error) {
      console.error("Failed to load fauna detail:", error);
      toast.error("Gagal memuat detail fauna");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusMap = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      in_review: {
        label: "Menunggu Persetujuan",
        className: "bg-yellow-100 text-yellow-800",
      },
      approved: {
        label: "Disetujui",
        className: "bg-green-100 text-green-800",
      },
      rejected: { label: "Ditolak", className: "bg-red-100 text-red-800" },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat detail fauna...</p>
        </div>
      </div>
    );
  }

  if (!fauna) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Data fauna tidak ditemukan</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        {getStatusBadge(fauna.status)}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100">
              <Bird className="h-8 w-8 text-blue-700" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                <i>{fauna.nama_ilmiah}</i>
              </CardTitle>
              <p className="text-xl text-muted-foreground">{fauna.nama_umum}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image */}
          {fauna.gambar_utama && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={fauna.gambar_utama}
                alt={fauna.nama_umum || "Fauna"}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Information Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-lg">
                Informasi Taksonomi
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Nama Ilmiah</dt>
                  <dd className="font-medium italic">
                    {fauna.nama_ilmiah || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Nama Umum</dt>
                  <dd className="font-medium">{fauna.nama_umum || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Kelas</dt>
                  <dd className="font-medium">{fauna.kelas || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Famili</dt>
                  <dd className="font-medium">{fauna.family || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Ordo</dt>
                  <dd className="font-medium">{fauna.ordo || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status IUCN</dt>
                  <dd className="font-medium">{fauna.status_iucn || "-"}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-lg">Informasi Habitat</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Habitat</dt>
                  <dd className="font-medium">{fauna.habitat || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Wilayah</dt>
                  <dd className="font-medium">{fauna.wilayah || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Endemik</dt>
                  <dd className="font-medium">
                    {fauna.is_endemic ? "Ya" : "Tidak"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Description */}
          {fauna.deskripsi && (
            <div>
              <h3 className="font-semibold mb-3 text-lg">Deskripsi</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {fauna.deskripsi}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
              Metadata
            </h3>
            <dl className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-medium">{fauna.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted By</dt>
                <dd className="font-medium">{fauna.submitted_by || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>{getStatusBadge(fauna.status)}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
