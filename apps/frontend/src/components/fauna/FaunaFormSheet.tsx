'use client';

import { useState, useEffect } from 'react';
import { FormSheet, FormSection } from '../ui/form-sheet';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { Fauna } from '../../lib/api-client';
import { faunaApi } from '../../lib/api-client';

interface FaunaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fauna?: Fauna | null;
  onSuccess?: () => void;
}

const iucnStatusOptions = [
  { value: 'EX', label: 'Extinct (EX) - Punah' },
  { value: 'EW', label: 'Extinct in the Wild (EW) - Punah di Alam Liar' },
  { value: 'CR', label: 'Critically Endangered (CR) - Kritis' },
  { value: 'EN', label: 'Endangered (EN) - Genting' },
  { value: 'VU', label: 'Vulnerable (VU) - Rentan' },
  { value: 'NT', label: 'Near Threatened (NT) - Hampir Terancam' },
  { value: 'LC', label: 'Least Concern (LC) - Risiko Rendah' },
  { value: 'DD', label: 'Data Deficient (DD) - Data Kurang' },
  { value: 'NE', label: 'Not Evaluated (NE) - Belum Dievaluasi' },
];

const statusHamaOptions = [
  { value: 'Ya', label: 'Ya - Merupakan Hama' },
  { value: 'Tidak', label: 'Tidak - Bukan Hama' },
  { value: 'Potensial', label: 'Potensial - Berpotensi Menjadi Hama' },
];

const tingkatHamaOptions = [
  { value: 'Ringan', label: 'Ringan' },
  { value: 'Sedang', label: 'Sedang' },
  { value: 'Berat', label: 'Berat' },
];

export function FaunaFormSheet({ open, onOpenChange, fauna, onSuccess }: FaunaFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_ilmiah: '',
    nama_umum: '',
    ordo: '',
    deskripsi: '',
    habitat_sumber_makanan: '',
    status_hama: '',
    tingkat_hama: '',
    status_iucn: '',
    is_endemic: false,
    gambar_utama: '',
  });

  useEffect(() => {
    if (fauna) {
      setFormData({
        nama_ilmiah: fauna.nama_ilmiah || '',
        nama_umum: fauna.nama_umum || '',
        ordo: fauna.ordo || '',
        deskripsi: fauna.deskripsi || '',
        habitat_sumber_makanan: fauna.habitat_sumber_makanan || '',
        status_hama: fauna.status_hama || '',
        tingkat_hama: fauna.tingkat_hama || '',
        status_iucn: fauna.status_iucn || '',
        is_endemic: fauna.is_endemic || false,
        gambar_utama: fauna.gambar_utama || '',
      });
    } else {
      setFormData({
        nama_ilmiah: '',
        nama_umum: '',
        ordo: '',
        deskripsi: '',
        habitat_sumber_makanan: '',
        status_hama: '',
        tingkat_hama: '',
        status_iucn: '',
        is_endemic: false,
        gambar_utama: '',
      });
    }
  }, [fauna, open]);

  const handleSubmit = async () => {
    if (!formData.nama_ilmiah.trim()) {
      toast.error('Nama ilmiah wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      if (fauna?.id) {
        await faunaApi.update(fauna.id, formData);
        toast.success('Data fauna berhasil diperbarui');
      } else {
        await faunaApi.create(formData);
        toast.success('Data fauna berhasil ditambahkan');
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving fauna:', error);
      toast.error(error.message || 'Gagal menyimpan data fauna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={fauna ? 'Edit Data Fauna' : 'Tambah Data Fauna'}
      description={fauna ? 'Perbarui informasi data fauna' : 'Tambahkan data fauna baru ke sistem'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      width="xl"
    >
      {/* Informasi Dasar */}
      <FormSection
        title="Informasi Dasar"
        description="Informasi identitas dan taksonomi fauna"
      >
        <div className="space-y-2">
          <Label htmlFor="nama_ilmiah">
            Nama Ilmiah <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nama_ilmiah"
            placeholder="Contoh: Pongo pygmaeus"
            value={formData.nama_ilmiah}
            onChange={(e) => handleChange('nama_ilmiah', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nama_umum">Nama Umum</Label>
          <Input
            id="nama_umum"
            placeholder="Contoh: Orangutan Kalimantan"
            value={formData.nama_umum}
            onChange={(e) => handleChange('nama_umum', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ordo">Ordo</Label>
          <Input
            id="ordo"
            placeholder="Contoh: Primates"
            value={formData.ordo}
            onChange={(e) => handleChange('ordo', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Ekologi */}
      <FormSection
        title="Ekologi"
        description="Informasi habitat dan perilaku"
      >
        <div className="space-y-2">
          <Label htmlFor="deskripsi">Deskripsi Umum</Label>
          <Textarea
            id="deskripsi"
            placeholder="Deskripsikan fauna secara umum..."
            value={formData.deskripsi}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="habitat_sumber_makanan">Habitat & Sumber Makanan</Label>
          <Textarea
            id="habitat_sumber_makanan"
            placeholder="Deskripsikan habitat dan sumber makanan fauna..."
            value={formData.habitat_sumber_makanan}
            onChange={(e) => handleChange('habitat_sumber_makanan', e.target.value)}
            rows={4}
          />
        </div>
      </FormSection>

      {/* Status Hama */}
      <FormSection
        title="Status Hama"
        description="Informasi terkait potensi sebagai hama"
      >
        <div className="space-y-2">
          <Label htmlFor="status_hama">Status Hama</Label>
          <Select
            value={formData.status_hama}
            onValueChange={(value) => handleChange('status_hama', value)}
          >
            <SelectTrigger id="status_hama">
              <SelectValue placeholder="Pilih status hama" />
            </SelectTrigger>
            <SelectContent>
              {statusHamaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(formData.status_hama === 'Ya' || formData.status_hama === 'Potensial') && (
          <div className="space-y-2">
            <Label htmlFor="tingkat_hama">Tingkat Hama</Label>
            <Select
              value={formData.tingkat_hama}
              onValueChange={(value) => handleChange('tingkat_hama', value)}
            >
              <SelectTrigger id="tingkat_hama">
                <SelectValue placeholder="Pilih tingkat hama" />
              </SelectTrigger>
              <SelectContent>
                {tingkatHamaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </FormSection>

      {/* Status Konservasi */}
      <FormSection
        title="Status Konservasi"
        description="Informasi status dan endemisitas"
      >
        <div className="space-y-2">
          <Label htmlFor="status_iucn">Status IUCN</Label>
          <Select
            value={formData.status_iucn}
            onValueChange={(value) => handleChange('status_iucn', value)}
          >
            <SelectTrigger id="status_iucn">
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

        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="is_endemic" className="text-base">
              Fauna Endemik
            </Label>
            <p className="text-sm text-muted-foreground">
              Tandai jika fauna ini endemik Indonesia
            </p>
          </div>
          <Switch
            id="is_endemic"
            checked={formData.is_endemic}
            onCheckedChange={(checked) => handleChange('is_endemic', checked)}
          />
        </div>
      </FormSection>

      {/* Gambar */}
      <FormSection
        title="Gambar"
        description="URL gambar utama fauna"
      >
        <div className="space-y-2">
          <Label htmlFor="gambar_utama">URL Gambar</Label>
          <Input
            id="gambar_utama"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.gambar_utama}
            onChange={(e) => handleChange('gambar_utama', e.target.value)}
          />
          {formData.gambar_utama && (
            <div className="mt-2 rounded-lg border p-2">
              <img
                src={formData.gambar_utama.startsWith('http') ? formData.gambar_utama : `http://localhost:8000${formData.gambar_utama}`}
                alt="Preview"
                className="h-32 w-full object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            </div>
          )}
        </div>
      </FormSection>
    </FormSheet>
  );
}

