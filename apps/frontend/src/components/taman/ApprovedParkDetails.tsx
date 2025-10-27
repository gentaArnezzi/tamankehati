'use client';

import { useState } from 'react';
import { Park, parksApi } from '../../lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
} from 'lucide-react';

interface ApprovedParkDetailsProps {
  park: Park;
  onParkUpdate?: (updatedPark: Park) => void;
}

export function ApprovedParkDetails({ park, onParkUpdate }: ApprovedParkDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: park.name,
    area_ha: park.area_ha || 0,
    description: park.description || '',
    provinsi: park.provinsi || '',
    kota_kabupaten: park.kota_kabupaten || '',
    kecamatan: park.kecamatan || '',
    desa_kelurahan: park.desa_kelurahan || '',
    pengelola: park.pengelola || '',
    sk_penetapan: park.sk_penetapan || '',
    sejarah: park.sejarah || '',
    visi: park.visi || '',
    misi: park.misi || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: park.name,
      area_ha: park.area_ha || 0,
      description: park.description || '',
      provinsi: park.provinsi || '',
      kota_kabupaten: park.kota_kabupaten || '',
      kecamatan: park.kecamatan || '',
      desa_kelurahan: park.desa_kelurahan || '',
      pengelola: park.pengelola || '',
      sk_penetapan: park.sk_penetapan || '',
      sejarah: park.sejarah || '',
      visi: park.visi || '',
      misi: park.misi || '',
    });
  };

  const handleSave = async () => {
    try {
      const updatedPark = await parksApi.update(park.id, editData);
      
      // Set update status based on park status
      if (updatedPark.status === 'pending_approval') {
        setUpdateStatus('pending_approval');
        toast.success('Perubahan taman berhasil disimpan dan menunggu approval dari super admin');
      } else if (updatedPark.status === 'approved') {
        setUpdateStatus('approved');
        toast.success('Perubahan taman berhasil disimpan dan langsung disetujui');
      }
      
      setIsEditing(false);
      onParkUpdate?.(updatedPark);
    } catch (error) {
      console.error('Error saving park changes:', error);
      toast.error('Gagal menyimpan perubahan taman');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Park Name and Status */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TreePine className="w-8 h-8 text-green-600" />
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="bg-transparent border-b-2 border-green-600 outline-none"
              />
            ) : (
              park.name
            )}
          </h1>
          <p className="text-muted-foreground mt-2">Detail lengkap taman yang Anda kelola</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Batal
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Detail
            </Button>
          )}
          <Badge variant="default" className="flex items-center gap-1 px-4 py-2">
            <CheckCircle className="w-4 h-4" />
            Approved
          </Badge>
        </div>
      </div>

      {/* Update Status Alert */}
      {updateStatus && (
        <Alert className={updateStatus === 'pending_approval' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}>
          <div className="flex items-start justify-between">
            <AlertDescription className={updateStatus === 'pending_approval' ? 'text-yellow-800' : 'text-green-800'}>
              {updateStatus === 'pending_approval' ? (
                <>
                  <Clock className="w-4 h-4 inline mr-2" />
                  <strong>Perubahan menunggu approval:</strong> Perubahan yang Anda buat sedang menunggu persetujuan dari super admin. Status akan diperbarui setelah disetujui.
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  <strong>Perubahan telah disetujui:</strong> Perubahan yang Anda buat telah langsung disetujui dan diterapkan.
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
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editData.area_ha}
                    onChange={(e) => setEditData({ ...editData, area_ha: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 border rounded text-2xl font-bold"
                    placeholder="0"
                  />
                  <span className="text-lg">ha</span>
                </div>
              ) : (
                <span className="text-2xl font-bold">
                  {park.area_ha ? `${park.area_ha.toLocaleString('id-ID')} ha` : 'N/A'}
                </span>
              )}
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
                {park.kota_kabupaten || 'N/A'}
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
              {isEditing ? (
                <input
                  type="text"
                  value={editData.pengelola}
                  onChange={(e) => setEditData({ ...editData, pengelola: e.target.value })}
                  className="flex-1 px-2 py-1 border rounded text-lg font-semibold"
                  placeholder="Nama pengelola"
                />
              ) : (
                <span className="text-lg font-semibold line-clamp-1">
                  {park.pengelola || 'N/A'}
                </span>
              )}
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
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.sk_penetapan}
                    onChange={(e) => setEditData({ ...editData, sk_penetapan: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-base"
                    placeholder="SK Penetapan/Penunjukan"
                  />
                ) : (
                  <p className="text-base">{park.sk_penetapan || '-'}</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Instansi Pengelola
                </h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.pengelola}
                    onChange={(e) => setEditData({ ...editData, pengelola: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-base"
                    placeholder="Instansi Pengelola"
                  />
                ) : (
                  <p className="text-base">{park.pengelola || '-'}</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Deskripsi
                </h4>
                {isEditing ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-base min-h-[100px]"
                    placeholder="Deskripsi taman"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">{park.description || '-'}</p>
                )}
              </div>

              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Sejarah
                </h4>
                {isEditing ? (
                  <textarea
                    value={editData.sejarah}
                    onChange={(e) => setEditData({ ...editData, sejarah: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-base min-h-[100px]"
                    placeholder="Sejarah taman"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">{park.sejarah || '-'}</p>
                )}
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
                  <p className="text-base">{park.provinsi || '-'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Kabupaten/Kota
                  </h4>
                  <p className="text-base">{park.kota_kabupaten || '-'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Kecamatan
                  </h4>
                  <p className="text-base">{park.kecamatan || '-'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Desa/Kelurahan
                  </h4>
                  <p className="text-base">{park.desa_kelurahan || '-'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Luas Kawasan
                </h4>
                <p className="text-base">
                  {park.area_ha ? `${park.area_ha.toLocaleString('id-ID')} hektar (ha)` : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
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
                  Kondisi Fisik Kawasan
                </h4>
                <p className="text-base whitespace-pre-wrap">{park.kondisi_fisik || '-'}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Nilai Penting Kawasan
                </h4>
                <p className="text-base whitespace-pre-wrap">{park.nilai_penting || '-'}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Tipe Ekoregion
                </h4>
                <p className="text-base">{park.tipe_ekoregion || '-'}</p>
              </div>

              {park.nilai_dasar && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Nilai Dasar
                    </h4>
                    <p className="text-base whitespace-pre-wrap">{park.nilai_dasar}</p>
                  </div>
                </>
              )}
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
                    onChange={(e) => setEditData({ ...editData, visi: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-base min-h-[100px]"
                    placeholder="Visi taman"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">{park.visi || '-'}</p>
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
                    onChange={(e) => setEditData({ ...editData, misi: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-base min-h-[100px]"
                    placeholder="Misi taman"
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">{park.misi || '-'}</p>
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
                <p className="text-sm text-muted-foreground">Kelola data flora</p>
              </div>
            </a>

            <a
              href="/dashboard/taman/fauna"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Bird className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold">Fauna</h4>
                <p className="text-sm text-muted-foreground">Kelola data fauna</p>
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

