"use client";

import { useAuth } from "../../../lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { CollapsibleDashboardLayout } from "../../../components/CollapsibleDashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  HelpCircle,
  Mail,
  Book,
  MessageCircle,
  ExternalLink,
  TreePine,
  Bird,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Shield,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Clock,
} from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sections = [
    { id: "overview", label: "Ringkasan", icon: Book },
    { id: "getting-started", label: "Memulai", icon: CheckCircle },
    { id: "flora-fauna", label: "Flora & Fauna", icon: TreePine },
    { id: "parks", label: "Taman", icon: MapPin },
    { id: "approval", label: "Persetujuan", icon: Shield },
    { id: "faq", label: "FAQ", icon: MessageCircle },
  ];

  return (
    <CollapsibleDashboardLayout
      user={user}
      currentPath={pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-7 w-7 text-[#356447]" />
            <h1 className="text-3xl font-bold text-gray-900">Pusat Bantuan</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Panduan lengkap penggunaan Sistem Informasi Taman Keanekaragaman
            Hayati Indonesia
          </p>
          <Badge variant="outline" className="mt-2">
            {user?.role === "super_admin"
              ? "👑 Super Admin"
              : "🛡️ Regional Admin"}
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                className={`gap-2 whitespace-nowrap ${activeSection === section.id ? "bg-[#356447]" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Button>
            );
          })}
        </div>

        {/* Overview Section */}
        {activeSection === "overview" && (
          <div className="space-y-4">
            <Card className="border-l-4 border-l-[#356447]">
              <CardHeader>
                <CardTitle>Selamat Datang di Sistem Taman Kehati</CardTitle>
                <CardDescription>
                  Sistem Informasi Manajemen Keanekaragaman Hayati Indonesia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  Sistem ini dirancang untuk mengelola data keanekaragaman
                  hayati di seluruh taman konservasi Indonesia. Anda dapat
                  mendokumentasikan flora, fauna, kegiatan konservasi, dan
                  melakukan monitoring biodiversitas secara terintegrasi.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <TreePine className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-sm mb-1">
                      Manajemen Flora
                    </h4>
                    <p className="text-xs text-gray-600">
                      Dokumentasi spesies tumbuhan dengan data lengkap
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Bird className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-sm mb-1">
                      Manajemen Fauna
                    </h4>
                    <p className="text-xs text-gray-600">
                      Katalog satwa dengan informasi habitat dan status
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-sm mb-1">Data Taman</h4>
                    <p className="text-xs text-gray-600">
                      Informasi lengkap kawasan konservasi
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600 mb-2" />
                    <h4 className="font-semibold text-sm mb-1">Kegiatan</h4>
                    <p className="text-xs text-gray-600">
                      Dokumentasi aktivitas dan program konservasi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-Specific Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Akses & Peran Anda
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.role === "super_admin" ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          Super Administrator
                        </p>
                        <p className="text-xs text-gray-600">
                          Akses penuh ke seluruh sistem
                        </p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1 ml-8">
                      <p>✓ Melihat & mengelola semua data</p>
                      <p>✓ Approve/reject submission dari regional admin</p>
                      <p>✓ Manajemen pengguna & hak akses</p>
                      <p>✓ Manajemen pengumuman & artikel</p>
                      <p>✓ Analytics & reporting komprehensif</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          Regional Administrator
                        </p>
                        <p className="text-xs text-gray-600">
                          Mengelola data wilayah yang ditugaskan
                        </p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1 ml-8">
                      <p>✓ Submit data flora & fauna</p>
                      <p>✓ Manajemen taman yang ditugaskan</p>
                      <p>✓ Dokumentasi kegiatan konservasi</p>
                      <p>✓ Dashboard analytics data Anda</p>
                      <p className="text-orange-600">
                        ⚠ Data perlu approval Super Admin
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Getting Started Section */}
        {activeSection === "getting-started" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Panduan Memulai</CardTitle>
                <CardDescription>
                  Langkah-langkah untuk memulai menggunakan sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#356447] text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Login ke Sistem</h4>
                      <p className="text-sm text-gray-600">
                        Gunakan email dan password yang telah diberikan oleh
                        administrator
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#356447] text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Lengkapi Profil</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Pergi ke menu Pengaturan untuk melengkapi informasi
                        profil Anda
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/dashboard/settings")}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Buka Pengaturan
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#356447] text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        Eksplorasi Dashboard
                      </h4>
                      <p className="text-sm text-gray-600">
                        Lihat statistik dan visualisasi data keanekaragaman
                        hayati
                      </p>
                    </div>
                  </div>

                  {user?.role === "regional_admin" && (
                    <>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#356447] text-white rounded-full flex items-center justify-center font-bold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
                            Daftarkan Taman Anda
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Mulai dengan mendaftarkan taman konservasi yang Anda
                            kelola
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push("/dashboard/taman")}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Kelola Taman
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#356447] text-white rounded-full flex items-center justify-center font-bold">
                          5
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
                            Mulai Input Data
                          </h4>
                          <p className="text-sm text-gray-600">
                            Submit data flora, fauna, dan kegiatan konservasi
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips Penggunaan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Gunakan{" "}
                      <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">
                        Ctrl+S
                      </kbd>{" "}
                      untuk quick save saat mengisi form
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Upload foto berkualitas tinggi (minimal 1MB) untuk
                      dokumentasi yang baik
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Isi nama ilmiah (Latin) dengan benar untuk validasi data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Gunakan fitur AI untuk generate deskripsi otomatis
                      (opsional)
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Flora & Fauna Section */}
        {activeSection === "flora-fauna" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  Manajemen Data Flora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Cara Menambah Data Flora:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>
                      Pergi ke menu <strong>Flora</strong> di sidebar
                    </li>
                    <li>
                      Klik tombol <strong>+ Tambah Flora</strong>
                    </li>
                    <li>
                      Isi formulir dengan data lengkap:
                      <ul className="ml-8 mt-1 space-y-1 text-xs list-disc list-inside">
                        <li>
                          <strong>Nama Ilmiah</strong> (wajib) - Nama Latin
                          spesies
                        </li>
                        <li>
                          <strong>Nama Umum</strong> - Nama lokal/populer
                        </li>
                        <li>
                          <strong>Famili & Genus</strong> - Klasifikasi
                          taksonomi
                        </li>
                        <li>
                          <strong>Status IUCN</strong> - Status konservasi
                        </li>
                        <li>
                          <strong>Endemik</strong> - Ya/Tidak
                        </li>
                        <li>
                          <strong>Morfologi</strong> - Ciri fisik tumbuhan
                        </li>
                        <li>
                          <strong>Manfaat</strong> - Kegunaan ekologis/ekonomis
                        </li>
                      </ul>
                    </li>
                    <li>
                      Upload <strong>gambar utama</strong> dan{" "}
                      <strong>galeri foto</strong>
                    </li>
                    <li>Review data di halaman preview</li>
                    <li>
                      Klik <strong>Submit</strong> - Data akan masuk review
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-900">
                    💡 <strong>Tips:</strong> Gunakan fitur AI untuk generate
                    deskripsi morfologi dan manfaat secara otomatis berdasarkan
                    nama ilmiah.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bird className="h-5 w-5 text-blue-600" />
                  Manajemen Data Fauna
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Cara Menambah Data Fauna:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>
                      Pergi ke menu <strong>Fauna</strong> di sidebar
                    </li>
                    <li>
                      Klik tombol <strong>+ Tambah Fauna</strong>
                    </li>
                    <li>
                      Isi formulir dengan data lengkap:
                      <ul className="ml-8 mt-1 space-y-1 text-xs list-disc list-inside">
                        <li>
                          <strong>Nama Ilmiah</strong> (wajib) - Nama Latin
                          spesies
                        </li>
                        <li>
                          <strong>Nama Umum</strong> - Nama lokal/populer
                        </li>
                        <li>
                          <strong>Ordo</strong> - Klasifikasi taksonomi
                        </li>
                        <li>
                          <strong>Status IUCN</strong> - Status konservasi
                        </li>
                        <li>
                          <strong>Endemik</strong> - Ya/Tidak
                        </li>
                        <li>
                          <strong>Status Hama</strong> -
                          Invasif/Non-invasif/Native
                        </li>
                        <li>
                          <strong>Habitat & Makanan</strong> - Deskripsi habitat
                          dan diet
                        </li>
                      </ul>
                    </li>
                    <li>
                      Upload <strong>gambar utama</strong> dan{" "}
                      <strong>galeri foto</strong>
                    </li>
                    <li>Review data di halaman preview</li>
                    <li>
                      Klik <strong>Submit</strong> - Data akan masuk review
                    </li>
                  </ol>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <Upload className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs font-medium">Upload</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <Eye className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs font-medium">Preview</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-center">
                    <CheckCircle className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs font-medium">Submit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mengelola Data yang Sudah Ada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Melihat Detail</p>
                      <p className="text-xs text-gray-600">
                        Klik pada item untuk melihat informasi lengkap
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Edit3 className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Mengubah Data</p>
                      <p className="text-xs text-gray-600">
                        Klik tombol Edit, ubah data, lalu Submit ulang untuk
                        review
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Menghapus Data</p>
                      <p className="text-xs text-gray-600">
                        Klik tombol Delete, konfirmasi penghapusan
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Parks Section */}
        {activeSection === "parks" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Manajemen Taman Konservasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Cara Mendaftarkan Taman:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>
                      Pergi ke menu <strong>Taman</strong> di sidebar
                    </li>
                    <li>
                      Klik tombol <strong>+ Tambah Taman</strong>
                    </li>
                    <li>
                      Isi informasi taman:
                      <ul className="ml-8 mt-1 space-y-1 text-xs list-disc list-inside">
                        <li>
                          <strong>Nama Taman</strong> (wajib)
                        </li>
                        <li>
                          <strong>Provinsi & Kabupaten/Kota</strong> - Lokasi
                          administratif
                        </li>
                        <li>
                          <strong>Luas Area (ha)</strong> - Luas kawasan dalam
                          hektar
                        </li>
                        <li>
                          <strong>Koordinat</strong> - Latitude dan Longitude
                        </li>
                        <li>
                          <strong>Deskripsi</strong> - Informasi umum taman
                        </li>
                        <li>
                          <strong>Status</strong> - Taman Nasional/Hutan
                          Lindung/dsb
                        </li>
                      </ul>
                    </li>
                    <li>Upload foto taman (landscape, flora/fauna khas)</li>
                    <li>Submit untuk approval</li>
                  </ol>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-900">
                    📍 <strong>Catatan:</strong> Setelah taman diapprove, Anda
                    dapat mulai menambahkan data flora dan fauna yang ada di
                    taman tersebut.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mengelola Flora & Fauna di Taman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-700">
                  Setelah taman terdaftar, Anda dapat:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Menambahkan data flora yang ditemukan di taman</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Mendokumentasikan fauna yang menghuni kawasan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Mencatat kegiatan konservasi yang dilakukan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Melihat statistik biodiversitas taman</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Approval Section */}
        {activeSection === "approval" && (
          <div className="space-y-4">
            {user?.role === "super_admin" ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#356447]" />
                      Sistem Persetujuan (Super Admin)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Cara Mereview Submission:
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>
                          Pergi ke menu <strong>Persetujuan</strong>
                        </li>
                        <li>Pilih tab Flora, Fauna, atau Taman</li>
                        <li>Klik pada item untuk melihat detail lengkap</li>
                        <li>
                          Review data yang disubmit:
                          <ul className="ml-8 mt-1 space-y-1 text-xs list-disc list-inside">
                            <li>Periksa kelengkapan informasi</li>
                            <li>Validasi nama ilmiah dan klasifikasi</li>
                            <li>Cek kualitas foto dan dokumentasi</li>
                            <li>Verifikasi lokasi dan data geografis</li>
                          </ul>
                        </li>
                        <li>
                          Pilih aksi:
                          <ul className="ml-8 mt-1 space-y-1 text-xs list-disc list-inside">
                            <li>
                              <strong>Approve</strong> - Data valid dan layak
                              dipublikasi
                            </li>
                            <li>
                              <strong>Reject</strong> - Data tidak lengkap atau
                              salah (berikan alasan)
                            </li>
                            <li>
                              <strong>Request Changes</strong> - Perlu revisi
                              minor
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-orange-900">
                        ⚠️ <strong>Penting:</strong> Data yang sudah diapprove
                        akan tampil di website publik dan dashboard analytics.
                        Pastikan data akurat sebelum approval.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Approval</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">Menunggu Review</p>
                          <p className="text-xs text-gray-600">
                            Submission baru dari regional admin
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Approved</p>
                          <p className="text-xs text-gray-600">
                            Data terverifikasi dan dipublikasi
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Rejected</p>
                          <p className="text-xs text-gray-600">
                            Data ditolak (perlu submit ulang)
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Status Submission Anda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Semua data yang Anda submit akan melalui proses review oleh
                    Super Administrator sebelum dipublikasi.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        ⏳ Menunggu Review
                      </p>
                      <p className="text-xs text-gray-600">
                        Data Anda sedang dalam antrian review. Biasanya
                        membutuhkan 1-3 hari kerja.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-1">
                        ✓ Approved
                      </p>
                      <p className="text-xs text-gray-600">
                        Data telah diverifikasi dan dipublikasi di website.
                        Terima kasih!
                      </p>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-1">
                        ✗ Perlu Revisi
                      </p>
                      <p className="text-xs text-gray-600">
                        Data perlu diperbaiki. Silakan edit dan submit ulang.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600">
                      💡 <strong>Tips:</strong> Untuk mempercepat approval,
                      pastikan semua field terisi lengkap, foto berkualitas
                      baik, dan nama ilmiah akurat.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* FAQ Section */}
        {activeSection === "faq" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Pertanyaan yang Sering Diajukan (FAQ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Bagaimana cara mengubah password?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Pergi ke menu <strong>Pengaturan</strong> →{" "}
                    <strong>Keamanan</strong>, lalu klik "Ubah Password".
                    Masukkan password lama dan password baru.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Format gambar apa yang didukung?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Sistem mendukung JPG, JPEG, PNG, dan WebP. Ukuran maksimal
                    10MB per file. Disarankan ukuran minimal 1MB untuk kualitas
                    terbaik.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Berapa lama proses approval?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Biasanya 1-3 hari kerja. Anda akan menerima notifikasi
                    ketika data telah direview.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Apakah bisa menghapus data yang sudah diapprove?
                  </h4>
                  <p className="text-sm text-gray-600">
                    {user?.role === "super_admin"
                      ? "Ya, Super Admin dapat menghapus data kapanpun melalui menu management."
                      : "Tidak langsung. Hubungi Super Admin untuk request penghapusan data yang sudah approved."}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Bagaimana cara menggunakan fitur AI?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Pada form Flora/Fauna, setelah mengisi nama ilmiah, klik
                    tombol "Generate dengan AI" untuk otomatis mengisi
                    deskripsi, morfologi, dan manfaat.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Data saya hilang setelah logout?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Tidak. Semua data yang sudah disubmit tersimpan aman di
                    database. Login kembali untuk melihat data Anda.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Bagaimana cara export data?
                  </h4>
                  <p className="text-sm text-gray-600">
                    {user?.role === "super_admin"
                      ? 'Pada Dashboard Analytics, klik tombol "Export" untuk download data dalam format Excel atau PDF.'
                      : "Fitur export hanya tersedia untuk Super Admin. Hubungi admin jika memerlukan data export."}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    ❓ Sistem tidak merespons/lambat?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Coba refresh halaman (Ctrl+R/Cmd+R). Jika masih lambat,
                    clear cache browser atau gunakan browser berbeda. Jika
                    masalah berlanjut, hubungi support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Support */}
        <Card className="border-2 border-[#356447] bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#356447]" />
              Butuh Bantuan Lebih Lanjut?
            </CardTitle>
            <CardDescription>
              Hubungi tim support kami untuk assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Email Support
                </p>
                <a
                  href="mailto:support@tamankehati.org"
                  className="text-sm text-[#356447] font-semibold hover:underline"
                >
                  support@tamankehati.org
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Jam Operasional
                </p>
                <p className="text-sm text-gray-600">Senin - Jumat</p>
                <p className="text-sm text-gray-600">09:00 - 17:00 WIB</p>
              </div>
            </div>
            <Button
              className="gap-2 bg-[#356447] hover:bg-[#2d5239]"
              onClick={() =>
                (window.location.href = "mailto:support@tamankehati.org")
              }
            >
              <Mail className="h-4 w-4" />
              Kirim Email ke Support
            </Button>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Versi Sistem</dt>
                <dd className="font-semibold">1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Terakhir Diperbarui</dt>
                <dd className="font-semibold">Oktober 2025</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Status Server</dt>
                <dd className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-semibold text-green-600">Online</span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Browser</dt>
                <dd className="font-semibold text-xs">
                  {typeof window !== "undefined"
                    ? window.navigator.userAgent.split(" ").slice(-1)[0]
                    : "-"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </CollapsibleDashboardLayout>
  );
}
