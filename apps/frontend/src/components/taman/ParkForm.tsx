'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Plus, X, Info, FileText, MapPin, Target } from 'lucide-react';
import { toast } from 'sonner';
import { IndonesiaRegionSelector } from './IndonesiaRegionSelector';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('../ui/interactive-map-client').then(mod => ({ default: mod.InteractiveMap })), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Memuat peta...</p>
      </div>
    </div>
  )
});

interface ParkFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ParkFormData {
  // Profil Taman
  name: string; // Nama Kawasan
  slug: string;
  sk_penetapan: string; // SK Penetapan/Penunjukan
  pengelola: string; // Instansi Pengelola
  
  // Lokasi Administratif (matching database schema)
  provinsi: string; // Provinsi
  kota_kabupaten: string; // Kota/Kabupaten
  kecamatan: string; // Kecamatan
  desa_kelurahan: string; // Desa/Kelurahan
  
  // Karakteristik Kawasan
  area_ha: number | null; // Luas Kawasan (ha)
  kondisi_fisik: string; // Kondisi Fisik Kawasan
  nilai_penting: string; // Nilai Penting Kawasan
  tipe_ekoregion: string; // Tipe Ekoregion
  status: string;
  
  // Koordinat Geografis
  latitude: number | null; // Latitude koordinat
  longitude: number | null; // Longitude koordinat
  
  // Dokumen Taman
  description: string; // Deskripsi Umum
  sejarah: string; // Sejarah Taman
  visi: string; // Visi dan Misi
  misi: string; // Visi dan Misi
  nilai_dasar: string; // Nilai-Nilai Dasar
}

interface Region {
  id: number;
  name: string;
  code: string;
}

export function ParkForm({ onSuccess, onCancel }: ParkFormProps) {
  const [formData, setFormData] = useState<ParkFormData>({
    // Profil Taman
    name: '',
    slug: '',
    sk_penetapan: '',
    pengelola: '',
    
    // Lokasi Administratif
    provinsi: '',
    kota_kabupaten: '',
    kecamatan: '',
    desa_kelurahan: '',
    
    // Karakteristik Kawasan
    area_ha: null,
    kondisi_fisik: '',
    nilai_penting: '',
    tipe_ekoregion: '',
    status: 'draft',
    
    // Koordinat Geografis
    latitude: null,
    longitude: null,
    
    // Dokumen Taman
    description: '',
    sejarah: '',
    visi: '',
    misi: '',
    nilai_dasar: '',
  });
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/crud/regions/`);
      if (!response.ok) {
        throw new Error('Gagal memuat regions');
      }
      const data = await response.json();
      setRegions(data);
    } catch (err) {
      console.error('Failed to load regions:', err);
      toast.error('Gagal memuat daftar region');
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSubmit = async (submitStatus: 'draft' | 'in_review') => {
    setLoading(true);
    setError('');

    console.log('Park form submitting - status:', submitStatus);
    console.log('Park form data:', formData);

    try {
      // Map frontend field names to backend field names
      const dataToSubmit = {
        name: formData.name,
        slug: formData.slug,
        sk_penetapan: formData.sk_penetapan,
        pengelola: formData.pengelola,
        area_ha: formData.area_ha,
        kondisi_fisik: formData.kondisi_fisik,
        nilai_penting: formData.nilai_penting,
        tipe_ekoregion: formData.tipe_ekoregion,
        description: formData.description,
        sejarah: formData.sejarah,
        visi: formData.visi,
        misi: formData.misi,
        nilai_dasar: formData.nilai_dasar,
        // Location fields (already in correct format)
        provinsi: formData.provinsi,
        kota_kabupaten: formData.kota_kabupaten,
        kecamatan: formData.kecamatan,
        desa_kelurahan: formData.desa_kelurahan,
        // Coordinates
        latitude: formData.latitude,
        longitude: formData.longitude,
        status: submitStatus, // Set status based on button clicked
      };

      console.log('Park data to submit:', dataToSubmit);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/parks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal membuat park');
      }

      const result = await response.json();
      console.log('Park create result:', result);
      
      toast.success(
        submitStatus === 'draft' 
          ? `Park "${result.name}" berhasil disimpan sebagai draft!`
          : `Park "${result.name}" berhasil diajukan untuk review!`
      );
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat park';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Park submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ParkFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegionChange = (region: {
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    desa_kelurahan?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      provinsi: region.provinsi || '',
      kota_kabupaten: region.kota_kabupaten || '',
      kecamatan: region.kecamatan || '',
      desa_kelurahan: region.desa_kelurahan || '',
    }));
  };

  const generateSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  };

  const handleNameChange = (name: string) => {
    handleChange('name', name);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleChange('slug', generateSlug(name));
    }
  };

  if (loadingRegions) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Memuat data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Park Baru
        </CardTitle>
        <CardDescription>
          Buat park baru untuk mengelola zona konservasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Profil Taman
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Dokumen & Visi
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lokasi & Koordinat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Informasi Dasar */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">📋 Informasi Dasar</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nama Kawasan <span className="text-red-500">*</span>
                      </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Taman Kehati Cibinong"
                        className="h-10"
                        required
                      />
                      <p className="text-xs text-gray-500">Nama resmi kawasan Taman Kehati</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area_ha" className="text-sm font-medium">
                        Luas Kawasan (hektar) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="area_ha"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.area_ha || ''}
                        onChange={(e) => handleChange('area_ha', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="45.3"
                        className="h-10"
                        required
                      />
                      <p className="text-xs text-gray-500">Luas dalam hektar (1-2 desimal)</p>
                    </div>
                  </div>
                </div>

                {/* Dokumen Legal */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">📄 Dokumen Legal</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sk_penetapan" className="text-sm font-medium">
                        SK Penetapan/Penunjukan <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="sk_penetapan"
                        type="text"
                        value={formData.sk_penetapan}
                        onChange={(e) => handleChange('sk_penetapan', e.target.value)}
                        placeholder="SK Bupati Bogor No. 123/2019"
                        className="h-10"
                        required
                      />
                      <p className="text-xs text-gray-500">Nomor SK penetapan/penunjukan</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pengelola" className="text-sm font-medium">
                        Instansi Pengelola <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="pengelola"
                        type="text"
                        value={formData.pengelola}
                        onChange={(e) => handleChange('pengelola', e.target.value)}
                        placeholder="DLH Kabupaten Bogor"
                        className="h-10"
                        required
                      />
                      <p className="text-xs text-gray-500">Lembaga/instansi pengelola</p>
                    </div>
                  </div>
                </div>

                {/* Karakteristik Kawasan */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">🌿 Karakteristik Kawasan</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kondisi_fisik" className="text-sm font-medium">Kondisi Fisik Kawasan</Label>
                      <Textarea
                        id="kondisi_fisik"
                        value={formData.kondisi_fisik}
                        onChange={(e) => handleChange('kondisi_fisik', e.target.value)}
                        placeholder="Hutan kota dengan vegetasi campuran"
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500">Deskripsi kondisi umum kawasan</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nilai_penting" className="text-sm font-medium">Nilai Penting Kawasan</Label>
                      <Textarea
                        id="nilai_penting"
                        value={formData.nilai_penting}
                        onChange={(e) => handleChange('nilai_penting', e.target.value)}
                        placeholder="Habitat spesies endemik Jabodetabek"
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500">Nilai penting ekologi/keanekaragaman hayati</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipe_ekoregion" className="text-sm font-medium">Tipe Ekoregion</Label>
                      <Select
                        value={formData.tipe_ekoregion}
                        onValueChange={(value) => handleChange('tipe_ekoregion', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Pilih tipe ekoregion" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">DARAT (Terrestrial)</div>
                          <SelectItem value="Hutan Hujan Dataran Rendah">Hutan Hujan Dataran Rendah</SelectItem>
                          <SelectItem value="Hutan Hujan Pegunungan">Hutan Hujan Pegunungan</SelectItem>
                          <SelectItem value="Hutan Gambut">Hutan Gambut</SelectItem>
                          <SelectItem value="Hutan Mangrove">Hutan Mangrove</SelectItem>
                          <SelectItem value="Hutan Musim">Hutan Musim</SelectItem>
                          <SelectItem value="Savana">Savana</SelectItem>
                          <SelectItem value="Karst">Karst</SelectItem>
                          
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">AIR TAWAR (Freshwater)</div>
                          <SelectItem value="Sungai Kapuas">Sungai Kapuas</SelectItem>
                          <SelectItem value="Sungai Mahakam">Sungai Mahakam</SelectItem>
                          <SelectItem value="Sungai Barito">Sungai Barito</SelectItem>
                          <SelectItem value="Sungai Musi">Sungai Musi</SelectItem>
                          <SelectItem value="Sungai Batanghari">Sungai Batanghari</SelectItem>
                          <SelectItem value="Danau Toba">Danau Toba</SelectItem>
                          <SelectItem value="Danau Poso">Danau Poso</SelectItem>
                          <SelectItem value="Danau Sentani">Danau Sentani</SelectItem>
                          <SelectItem value="Sistem Sungai Sumatera">Sistem Sungai Sumatera</SelectItem>
                          <SelectItem value="Sistem Sungai Jawa">Sistem Sungai Jawa</SelectItem>
                          <SelectItem value="Sistem Sungai Kalimantan">Sistem Sungai Kalimantan</SelectItem>
                          <SelectItem value="Sistem Sungai Sulawesi">Sistem Sungai Sulawesi</SelectItem>
                          <SelectItem value="Sistem Sungai Papua">Sistem Sungai Papua</SelectItem>
                          
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">LAUT (Marine)</div>
                          <SelectItem value="Papua">Papua</SelectItem>
                          <SelectItem value="Laut Banda">Laut Banda</SelectItem>
                          <SelectItem value="Nusa Tenggara">Nusa Tenggara</SelectItem>
                          <SelectItem value="Laut Sulawesi/Selat Makassar">Laut Sulawesi/Selat Makassar</SelectItem>
                          <SelectItem value="Halmahera">Halmahera</SelectItem>
                          <SelectItem value="Palawan/Borneo Utara">Palawan/Borneo Utara</SelectItem>
                          <SelectItem value="Sumatera Bagian Barat">Sumatera Bagian Barat</SelectItem>
                          <SelectItem value="Timur Laut Sulawesi/Teluk Tomini">Timur Laut Sulawesi/Teluk Tomini</SelectItem>
                          <SelectItem value="Dangkalan Sunda/Laut Jawa">Dangkalan Sunda/Laut Jawa</SelectItem>
                          <SelectItem value="Laut Arafura">Laut Arafura</SelectItem>
                          <SelectItem value="Jawa Bagian Selatan">Jawa Bagian Selatan</SelectItem>
                          <SelectItem value="Selat Malaka">Selat Malaka</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Pilih kategori ekoregion sesuai karakteristik kawasan (darat, air tawar, atau laut)</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Sejarah Taman */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">📚 Sejarah Taman</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sejarah" className="text-sm font-medium">Riwayat Singkat</Label>
                    <Textarea
                      id="sejarah"
                      value={formData.sejarah}
                      onChange={(e) => handleChange('sejarah', e.target.value)}
                      placeholder="Diresmikan tahun 2019 sebagai kawasan edukasi konservasi"
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">Riwayat singkat berdiri/berkembang taman</p>
                  </div>
                </div>

                {/* Visi dan Misi */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">🎯 Visi dan Misi</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visi" className="text-sm font-medium">Visi</Label>
                      <Textarea
                        id="visi"
                        value={formData.visi}
                        onChange={(e) => handleChange('visi', e.target.value)}
                        placeholder="Menjadi taman konservasi berkelanjutan dan pusat pembelajaran biodiversitas"
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500">Arah pengelolaan taman</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="misi" className="text-sm font-medium">Misi</Label>
                      <Textarea
                        id="misi"
                        value={formData.misi}
                        onChange={(e) => handleChange('misi', e.target.value)}
                        placeholder="Misi pengelolaan taman konservasi"
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500">Tujuan pengelolaan taman</p>
                    </div>
                  </div>
                </div>

                {/* Nilai Dasar */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">💎 Nilai-Nilai Dasar</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nilai_dasar" className="text-sm font-medium">Prinsip Konservasi</Label>
                    <Textarea
                      id="nilai_dasar"
                      value={formData.nilai_dasar}
                      onChange={(e) => handleChange('nilai_dasar', e.target.value)}
                      placeholder="Menjaga keanekaragaman hayati dan nilai ekologi kawasan"
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">Prinsip konservasi inti taman</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Lokasi Detail */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">📍 Lokasi Detail</h4>
                  
                  <IndonesiaRegionSelector
                    onRegionChange={handleRegionChange}
                    initialValues={{
                      provinsi: formData.provinsi,
                      kota_kabupaten: formData.kota_kabupaten,
                      kecamatan: formData.kecamatan,
                      desa_kelurahan: formData.desa_kelurahan,
                    }}
                  />
                </div>

                {/* Status dan Pengelolaan */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">⚙️ Status dan Pengelolaan</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status Publikasi</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange('status', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Status publikasi taman</p>
          </div>

          {/* Region field removed - using user-based access control */}
                  </div>
          </div>

                {/* Deskripsi Umum */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">📝 Deskripsi Umum</h4>

          <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Deskripsi Taman</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Deskripsi umum taman konservasi..."
                      rows={4}
                      className="resize-none"
            />
                    <p className="text-xs text-gray-500">Deskripsi singkat tentang taman</p>
                  </div>
          </div>
          </div>

                {/* Koordinat Geografis */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 border-b pb-2">🗺️ Koordinat Geografis</h4>
                  <p className="text-sm text-gray-600">
                    Pilih koordinat taman konservasi menggunakan peta interaktif. 
                    Anda dapat mengklik pada peta, mencari lokasi, atau menggunakan lokasi saat ini.
                  </p>
                  
                  <InteractiveMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onCoordinatesChange={handleCoordinatesChange}
                    height="400px"
                  />
                </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
            )}
            <Button 
              type="button" 
              variant="secondary"
              disabled={loading} 
              onClick={() => handleSubmit('draft')}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan sebagai Draft'
              )}
            </Button>
            <Button 
              type="button"
              disabled={loading} 
              onClick={() => handleSubmit('in_review')}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit untuk Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
