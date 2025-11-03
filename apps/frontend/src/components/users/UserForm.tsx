import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, UserDetail } from "../../lib/api-client";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  MapPin,
  TreePine,
  Flower2,
  Activity,
} from "lucide-react";
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
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

const userSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .optional()
    .or(z.literal("")),
  role: z.enum(["super_admin", "regional_admin"], {
    error: "Role wajib dipilih",
  }),
  is_active: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: User | UserDetail | null;
  mode: "create" | "edit" | "preview";
}

export function UserForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: UserFormProps) {
  const router = useRouter();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama: initialData?.nama || initialData?.display_name || "",
      email: initialData?.email || "",
      password: "",
      role: initialData?.role || "regional_admin",
      is_active: initialData?.is_active ?? true,
    },
  });

  // Reset form ketika initialData berubah (untuk mode edit)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        nama: initialData.nama || initialData.display_name || "",
        email: initialData.email || "",
        password: "", // Password selalu kosong saat edit
        role: initialData.role || "regional_admin",
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData, mode, form]);

  // Helper function untuk mengecek apakah field berubah
  const isFieldChanged = (fieldName: string, currentValue: any) => {
    if (mode !== "edit" || !initialData) return false;

    const originalValue = initialData[fieldName as keyof typeof initialData];
    return originalValue !== currentValue;
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      const submitData = { ...data };
      // Remove password if it's empty for edit mode
      if (mode === "edit" && !data.password) {
        delete submitData.password;
      }
      await onSubmit(submitData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleUserActivityClick = (userId: string | number) => {
    router.push(`/dashboard/users/${userId}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Tambah Pengguna Baru"
              : mode === "edit"
                ? "Edit Data Pengguna"
                : "Detail Pengguna"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi formulir di bawah untuk menambahkan pengguna baru ke sistem."
              : mode === "edit"
                ? "Perbarui informasi pengguna. Kosongkan password jika tidak ingin mengubahnya."
                : "Lihat detail informasi pengguna."}
          </DialogDescription>
        </DialogHeader>

        {mode === "preview" ? (
          // Preview Mode - Display as information cards
          <div className="space-y-6">
            {/* User Information Card - Modern Design */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-8 shadow-sm">
              {/* User Header with Avatar */}
              <div className="flex items-start gap-6 mb-8 pb-6 border-b border-gray-100">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white shadow-lg">
                    <span className="text-2xl font-bold">
                      {(() => {
                        const name =
                          initialData?.nama || initialData?.display_name || "?";
                        const parts = name.trim().split(" ");
                        if (parts.length === 1)
                          return parts[0].charAt(0).toUpperCase();
                        return (
                          parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
                        ).toUpperCase();
                      })()}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate">
                        {initialData?.nama || initialData?.display_name || "-"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 truncate">
                        {initialData?.email || "-"}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            initialData?.role === "super_admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {initialData?.role === "super_admin"
                            ? "Super Admin"
                            : "Admin Regional"}
                        </span>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                            initialData?.is_active
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${initialData?.is_active ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <span>
                            {initialData?.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bergabung
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {initialData?.created_at
                      ? new Date(initialData.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Terakhir Update
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {initialData?.updated_at
                      ? new Date(initialData.updated_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID Pengguna
                  </p>
                  <p className="text-base font-medium text-gray-900 font-mono text-sm">
                    {initialData?.id || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Park and Region Information */}
            {initialData &&
              "park" in initialData &&
              (initialData.park || initialData.region) && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">
                      Informasi Taman & Wilayah
                    </h3>
                    {initialData.park && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserActivityClick(initialData.id)}
                        className="flex items-center gap-2 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Lihat Aktivitas User
                      </Button>
                    )}
                  </div>

                  {initialData.park && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      {/* Header with Icon */}
                      <div className="bg-gradient-to-r from-brand-500 to-emerald-600 p-6">
                        <div className="flex items-center gap-3 text-white">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-brand-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold">
                              Informasi Taman
                            </h4>
                            <p className="text-sm text-white opacity-90">
                              {initialData.park.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                              Informasi Dasar
                            </h5>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                  Status Taman
                                </p>
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                                    initialData.park.status === "approved"
                                      ? "bg-green-50 text-green-700 border border-green-100"
                                      : initialData.park.status === "draft"
                                        ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                        : "bg-red-50 text-red-700 border border-red-100"
                                  }`}
                                >
                                  {initialData.park.status === "approved"
                                    ? "Disetujui"
                                    : initialData.park.status === "draft"
                                      ? "Draft"
                                      : initialData.park.status}
                                </span>
                              </div>
                              {initialData.park.area_ha && (
                                <div>
                                  <p className="text-xs text-gray-500 font-medium mb-1">
                                    Luas Area
                                  </p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {initialData.park.area_ha.toLocaleString()}{" "}
                                    ha
                                  </p>
                                </div>
                              )}
                              {initialData.park.sk_penetapan && (
                                <div>
                                  <p className="text-xs text-gray-500 font-medium mb-1">
                                    SK Penetapan
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {initialData.park.sk_penetapan}
                                  </p>
                                </div>
                              )}
                              {initialData.park.pengelola && (
                                <div>
                                  <p className="text-xs text-gray-500 font-medium mb-1">
                                    Pengelola
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {initialData.park.pengelola}
                                  </p>
                                </div>
                              )}
                              {initialData.park.tipe_ekoregion && (
                                <div>
                                  <p className="text-xs text-gray-500 font-medium mb-1">
                                    Tipe Ekoregion
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {initialData.park.tipe_ekoregion}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Statistics - Modern Cards */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                              Statistik Kelolaan
                            </h5>
                            <div className="space-y-3">
                              <div className="group bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-100 rounded-xl p-4 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <TreePine className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-emerald-700 font-medium">
                                      Fauna
                                    </p>
                                    <p className="text-xl font-bold text-emerald-900">
                                      12{" "}
                                      <span className="text-sm font-normal text-emerald-600">
                                        Spesies
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-100 rounded-xl p-4 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Flower2 className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-blue-700 font-medium">
                                      Flora
                                    </p>
                                    <p className="text-xl font-bold text-blue-900">
                                      28{" "}
                                      <span className="text-sm font-normal text-blue-600">
                                        Spesies
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="group bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-100 rounded-xl p-4 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Activity className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-purple-700 font-medium">
                                      Aktivitas
                                    </p>
                                    <p className="text-xl font-bold text-purple-900">
                                      15{" "}
                                      <span className="text-sm font-normal text-purple-600">
                                        Kegiatan
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Recent Activities - Timeline Style */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                              Aktivitas Terbaru
                            </h5>
                            <div className="space-y-3">
                              <div className="flex gap-3 group">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-brand-500 group-hover:scale-150 transition-transform"></div>
                                  <div className="w-px h-full bg-gray-200 mt-1"></div>
                                </div>
                                <div className="pb-4 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Monitoring fauna
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    2 hari lalu
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3 group">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-brand-400 group-hover:scale-150 transition-transform"></div>
                                  <div className="w-px h-full bg-gray-200 mt-1"></div>
                                </div>
                                <div className="pb-4 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Survey flora
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    1 minggu lalu
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3 group">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-brand-300 group-hover:scale-150 transition-transform"></div>
                                  <div className="w-px h-full bg-gray-200 mt-1"></div>
                                </div>
                                <div className="pb-4 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Pemeliharaan habitat
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    2 minggu lalu
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3 group">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:scale-150 transition-transform"></div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Dokumentasi spesies
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    3 minggu lalu
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description and Details */}
                        {(initialData.park.description ||
                          initialData.park.kondisi_fisik ||
                          initialData.park.nilai_penting) && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                              Deskripsi & Detail
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {initialData.park.description && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    Deskripsi
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {initialData.park.description}
                                  </p>
                                </div>
                              )}
                              {initialData.park.kondisi_fisik && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    Kondisi Fisik
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {initialData.park.kondisi_fisik}
                                  </p>
                                </div>
                              )}
                              {initialData.park.nilai_penting && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    Nilai Penting
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {initialData.park.nilai_penting}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Vision, Mission, etc. */}
                        {(initialData.park.sejarah ||
                          initialData.park.visi ||
                          initialData.park.misi ||
                          initialData.park.nilai_dasar) && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                              Visi, Misi & Nilai
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {initialData.park.sejarah && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    Sejarah
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {initialData.park.sejarah}
                                  </p>
                                </div>
                              )}
                              {initialData.park.visi && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    Visi
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {initialData.park.visi}
                                  </p>
                                </div>
                              )}
                              {initialData.park.misi && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    Misi
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {initialData.park.misi}
                                  </p>
                                </div>
                              )}
                              {initialData.park.nilai_dasar && (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500 font-medium">
                                    Nilai Dasar
                                  </p>
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {initialData.park.nilai_dasar}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {initialData.region && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
                        <div className="flex items-center gap-3 text-white">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold">
                              Informasi Wilayah
                            </h4>
                            <p className="text-sm text-white opacity-90">
                              {initialData.region.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Kode Wilayah
                            </p>
                            <p className="text-base font-bold text-gray-900 font-mono">
                              {initialData.region.code}
                            </p>
                          </div>
                          {initialData.region.timezone && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Timezone
                              </p>
                              <p className="text-base font-medium text-gray-900">
                                {initialData.region.timezone}
                              </p>
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </p>
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                initialData.region.is_active
                                  ? "bg-green-50 text-green-700 border border-green-100"
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${initialData.region.is_active ? "bg-green-500" : "bg-red-500"}`}
                              ></div>
                              <span>
                                {initialData.region.is_active
                                  ? "Aktif"
                                  : "Nonaktif"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Dibuat
                            </p>
                            <p className="text-base font-medium text-gray-900">
                              {initialData.region.created_at
                                ? new Date(
                                    initialData.region.created_at,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Terakhir Update
                            </p>
                            <p className="text-base font-medium text-gray-900">
                              {initialData.region.updated_at
                                ? new Date(
                                    initialData.region.updated_at,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        ) : (
          // Edit/Create Mode - Display as form
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={
                          isFieldChanged("nama", field.value)
                            ? "text-blue-600"
                            : ""
                        }
                      >
                        Nama Lengkap *{" "}
                        {isFieldChanged("nama", field.value) && (
                          <span className="text-xs text-blue-500">
                            (Diubah)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Ahmad Ranger"
                          {...field}
                          className={
                            isFieldChanged("nama", field.value)
                              ? "border-blue-300 bg-blue-50"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={
                          isFieldChanged("email", field.value)
                            ? "text-blue-600"
                            : ""
                        }
                      >
                        Email *{" "}
                        {isFieldChanged("email", field.value) && (
                          <span className="text-xs text-blue-500">
                            (Diubah)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contoh@kehati.org"
                          {...field}
                          className={
                            isFieldChanged("email", field.value)
                              ? "border-blue-300 bg-blue-50"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {mode === "create" ? "Password *" : "Password"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            mode === "edit"
                              ? "Kosongkan jika tidak diubah"
                              : "••••••••"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {mode === "create"
                          ? "Minimal 6 karakter"
                          : "Kosongkan jika tidak ingin mengubah password"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={
                          isFieldChanged("role", field.value)
                            ? "text-blue-600"
                            : ""
                        }
                      >
                        Role *{" "}
                        {isFieldChanged("role", field.value) && (
                          <span className="text-xs text-blue-500">
                            (Diubah)
                          </span>
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={
                              isFieldChanged("role", field.value)
                                ? "border-blue-300 bg-blue-50"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Pilih role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="super_admin">
                            Super Admin
                          </SelectItem>
                          <SelectItem value="regional_admin">
                            Admin Regional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem
                    className={`flex flex-row items-center justify-between rounded-lg border p-4 ${isFieldChanged("is_active", field.value) ? "border-blue-300 bg-blue-50" : ""}`}
                  >
                    <div className="space-y-0.5">
                      <FormLabel
                        className={`text-base ${isFieldChanged("is_active", field.value) ? "text-blue-600" : ""}`}
                      >
                        Status Aktif{" "}
                        {isFieldChanged("is_active", field.value) && (
                          <span className="text-xs text-blue-500">
                            (Diubah)
                          </span>
                        )}
                      </FormLabel>
                      <FormDescription>
                        Pengguna aktif dapat mengakses sistem
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {form.formState.isSubmitting
                    ? "Menyimpan..."
                    : mode === "create"
                      ? "Simpan Data"
                      : "Perbarui Data"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
