"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  Search,
  Info,
  Loader2,
  ShieldCheck,
  Clock,
  Ban,
} from "lucide-react";

import { useAuth } from "../../lib/useAuth";
import { Taman, tamanApi, ZoneUploadResponse } from "../../lib/api-client";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type UploadVariables = {
  file: File;
  name_field?: string;
  simplify_tolerance?: number;
};

export function TamanPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [regionCode, setRegionCode] = useState("");
  const [nameField, setNameField] = useState("name");
  const [tolerance, setTolerance] = useState("");
  const [lastUpload, setLastUpload] = useState<ZoneUploadResponse | null>(null);
  const [recentZoneIds, setRecentZoneIds] = useState<Set<string>>(new Set());
  const [fileInputKey, setFileInputKey] = useState(0);

  const zonesQuery = useQuery({
    queryKey: ["zones", user?.role === "regional_admin" ? user?.id : "all"],
    queryFn: async () => {
      const params: any = { page: 1, size: 200 };

      // Regional admin should only see their own submitted zones
      if (user?.role === "regional_admin") {
        params.submitted_by = user.id;
      }

      const data = await tamanApi.list(params);
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (variables: UploadVariables) => {
      return tamanApi.uploadShapefile(variables);
    },
    onSuccess: (response) => {
      setLastUpload(response);
      setRecentZoneIds(
        new Set(response.zones.map((zone: any) => String(zone.id))),
      );
      if (response.summary.created > 0) {
        toast.success(
          "Shapefile berhasil diproses. Status awal: Menunggu Persetujuan.",
        );
      } else {
        toast.info("Tidak ada fitur baru yang dihasilkan dari berkas ini.");
      }
      if (response.errors.length) {
        toast.warning(
          `Beberapa fitur gagal diproses (${response.errors.length}). Silakan tinjau daftar kesalahan.`,
        );
      }
      setSelectedFile(null);
      setFileInputKey((previous) => previous + 1);
      zonesQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengunggah shapefile");
    },
  });

  const statusToLabel = (status?: Taman["status"]) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "in_review":
        return "Menunggu Persetujuan";
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return "Tidak diketahui";
    }
  };

  const filteredZones = useMemo(() => {
    if (!zonesQuery.data) return [];
    const base = zonesQuery.data.items as unknown as Taman[];
    // Only filter by search query - submitted_by filtering is done on backend
    return base.filter((item) => {
      const matchesKeyword =
        !searchQuery ||
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.wilayah.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesKeyword;
    });
  }, [zonesQuery.data, searchQuery]);

  const handleUploadSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Pilih berkas shapefile (format .zip) terlebih dahulu.");
      return;
    }

    // Region code validation removed - using user-based access control

    let parsedTolerance: number | undefined;
    if (tolerance.trim() !== "") {
      const numeric = Number(tolerance);
      if (Number.isNaN(numeric) || numeric < 0) {
        toast.error(
          "Toleransi simplifikasi harus berupa angka nol atau positif.",
        );
        return;
      }
      parsedTolerance = numeric;
    }

    setRecentZoneIds(new Set());
    uploadMutation.mutate({
      file: selectedFile,
      name_field: nameField.trim() || undefined,
      simplify_tolerance: parsedTolerance,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">
          Pengelolaan Taman dan Zona Konservasi
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Regional Admin dapat mengunggah data batas zona dalam format
          shapefile. Setiap unggahan baru otomatis berstatus{" "}
          <strong>“Menunggu Persetujuan”</strong> dan hanya akan tampil untuk
          publik setelah disetujui oleh Super Admin.
        </p>
      </div>

      <Alert className="bg-emerald-50 text-emerald-900 border border-emerald-100">
        <Info className="h-4 w-4" aria-hidden />
        <AlertTitle>Panduan Unggah</AlertTitle>
        <AlertDescription>
          Kompres berkas <code>.shp</code>, <code>.shx</code>, <code>.dbf</code>
          , dan <code>.prj</code> ke dalam satu <code>.zip</code>. Pastikan
          sistem koordinat terdefinisi pada berkas <code>.prj</code>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Unggah Shapefile Zona</CardTitle>
          <CardDescription>
            Sistem akan memvalidasi geometri, melakukan reproyeksi ke EPSG:4326,
            dan menyederhanakan batas sesuai toleransi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleUploadSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Kode Region
                </label>
                <Input
                  placeholder="Contoh: KALTIM"
                  value={regionCode}
                  onChange={(event) => setRegionCode(event.target.value)}
                  disabled={false}
                />
                <p className="text-xs text-slate-500">
                  Gunakan kode region resmi. Nilai ini digunakan sebagai batas
                  akses konten.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Nama Kolom
                </label>
                <Input
                  placeholder="Kolom atribut untuk nama zona (contoh: name)"
                  value={nameField}
                  onChange={(event) => setNameField(event.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Opsional. Jika kosong, sistem akan membuat nama generik.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Berkas Shapefile (.zip)
                </label>
                <Input
                  key={fileInputKey}
                  type="file"
                  accept=".zip"
                  onChange={(event) =>
                    setSelectedFile(event.target.files?.item(0) ?? null)
                  }
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-xs text-slate-500">
                    {selectedFile.name} •{" "}
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Toleransi Simplifikasi
                </label>
                <Input
                  placeholder="Contoh: 0.0005"
                  value={tolerance}
                  onChange={(event) => setTolerance(event.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Opsional. Kosongkan untuk menggunakan nilai bawaan dari
                  konfigurasi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={uploadMutation.isPending}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Unggah dan Kirim
                  </>
                )}
              </Button>
              <p className="text-sm text-slate-500">
                Unggahan baru menunggu verifikasi. Anda dapat meninjau status di
                tabel.
              </p>
            </div>
          </form>

          {lastUpload && (
            <div className="mt-6 space-y-3">
              <Card className="border-slate-200">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-base">
                    Ringkasan Unggahan Terakhir
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-4 py-3">
                  <p className="text-sm text-slate-600">
                    Zona berhasil dibuat:{" "}
                    <strong>{lastUpload.summary.created}</strong>
                  </p>
                  <p className="text-sm text-slate-600">
                    Fitur dengan kendala:{" "}
                    <strong>{lastUpload.errors.length}</strong>
                  </p>
                  <p className="text-sm text-slate-600">
                    Toleransi simplifikasi:{" "}
                    <strong>{lastUpload.summary.simplify_tolerance}</strong>
                  </p>
                  {lastUpload.zones.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Zona Baru
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-slate-600">
                        {lastUpload.zones.map((zone) => (
                          <li key={`uploaded-zone-${zone.id}`}>
                            <span className="font-medium text-slate-700">
                              {zone.name}
                            </span>
                            <span className="mx-2 text-slate-400">•</span>
                            <span className="capitalize">
                              {statusToLabel(zone.status)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {lastUpload.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Detail Kesalahan</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      {lastUpload.errors.map((item, index) => (
                        <li key={`upload-error-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Daftar Zona</CardTitle>
            <CardDescription>
              Data berikut bersumber dari hasil unggahan yang telah melewati
              proses validasi.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari nama zona atau kode region"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Nama Zona</TableHead>
                  <TableHead>Kode Region</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zonesQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {zonesQuery.isError && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-red-600"
                    >
                      {(zonesQuery.error as Error)?.message ||
                        "Gagal memuat data zona. Coba lagi nanti."}
                    </TableCell>
                  </TableRow>
                )}
                {!zonesQuery.isLoading && filteredZones.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-slate-500"
                    >
                      Data belum tersedia. Silakan ubah filter atau unggah
                      shapefile baru.
                    </TableCell>
                  </TableRow>
                )}
                {filteredZones.map((zone) => {
                  const isNewlyUploaded = recentZoneIds.has(zone.id);
                  const isPending =
                    zone.status === "in_review" || zone.status === "draft";
                  const statusLabel = statusToLabel(zone.status);
                  return (
                    <TableRow
                      key={zone.id}
                      className={cn(
                        (isPending || isNewlyUploaded) && "bg-amber-50/60",
                      )}
                    >
                      <TableCell className="font-medium text-slate-700">
                        {zone.id}
                      </TableCell>
                      <TableCell>{zone.nama}</TableCell>
                      <TableCell>{zone.wilayah}</TableCell>
                      <TableCell>
                        {zone.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                            <ShieldCheck className="h-4 w-4" />
                            {statusLabel}
                          </span>
                        ) : zone.status === "rejected" ? (
                          <Badge
                            variant="destructive"
                            className="inline-flex items-center gap-1 text-xs"
                          >
                            <Ban className="h-3 w-3" />
                            {statusLabel}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="inline-flex items-center gap-1 border-amber-400 text-amber-700 text-xs"
                          >
                            <Clock className="h-3 w-3" />
                            {statusLabel}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
