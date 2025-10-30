'use client';

import { useState, useEffect } from 'react';
import { FormSheet, FormSection } from '../ui/form-sheet';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Flora } from '../../lib/api-client';
import { floraApi } from '../../lib/api-client';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';

interface FloraFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flora?: Flora | null;
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

export function FloraFormSheet({ open, onOpenChange, flora, onSuccess }: FloraFormSheetProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_ilmiah: '',
    nama_umum: '',
    famili: '',
    genus: '',
    deskripsi: '',
    morfologi: '',
    manfaat: '',
    status_iucn: '',
    is_endemic: false,
    gambar_utama: '',
  });

  useEffect(() => {
    if (flora) {
      setFormData({
        nama_ilmiah: flora.nama_ilmiah || '',
        nama_umum: flora.nama_umum || '',
        famili: flora.famili || '',
        genus: flora.genus || '',
        deskripsi: flora.deskripsi || '',
        morfologi: flora.morfologi || '',
        manfaat: flora.manfaat || '',
        status_iucn: flora.status_iucn || '',
        is_endemic: flora.is_endemic || false,
        gambar_utama: flora.gambar_utama || '',
      });
    } else {
      // Reset form for new entry
      setFormData({
        nama_ilmiah: '',
        nama_umum: '',
        famili: '',
        genus: '',
        deskripsi: '',
        morfologi: '',
        manfaat: '',
        status_iucn: '',
        is_endemic: false,
        gambar_utama: '',
      });
    }
  }, [flora, open]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.nama_ilmiah.trim()) {
      toast.error('Nama ilmiah wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      if (flora?.id) {
        // Update existing flora
        await floraApi.update(flora.id, formData);
        toast.success('Data flora berhasil diperbarui');
      } else {
        // Create new flora
        await floraApi.create(formData);
        toast.success('Data flora berhasil ditambahkan');
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving flora:', error);
      toast.error(error.message || 'Gagal menyimpan data flora');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // AI Functions
  const generateAIDescription = async () => {
    if (user?.role !== 'regional_admin') {
      toast.error('AI features hanya dapat digunakan oleh Regional Admin');
      return;
    }

    setAiLoading(true);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const aiData = {
        local_name: formData.nama_umum || '',
        scientific_name: formData.nama_ilmiah || '',
        family: formData.famili || '',
        genus: formData.genus || '',
        is_endemic: formData.is_endemic || false,
        iucn_status: formData.status_iucn || ''
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/ai/public/generate-flora-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aiData),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Failed to generate description (${response.status})`);
      }

      const result = await response.json();
      
      // Validate that we got actual content
      if (!result.description) {
        throw new Error('AI tidak menghasilkan konten yang valid');
      }
      
      setFormData(prev => ({ ...prev, deskripsi: result.description }));
      toast.success('Deskripsi berhasil dibuat dengan AI!');
    } catch (error) {
      console.error('Error generating AI description:', error);
      
      if (error.name === 'AbortError') {
        toast.error('AI generation timeout. Pastikan Ollama berjalan dan coba lagi.');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Tidak dapat terhubung ke AI service. Pastikan backend berjalan.');
      } else {
        toast.error(`Gagal membuat deskripsi: ${error.message}`);
      }
    } finally {
      clearTimeout(timeoutId);
      setAiLoading(false);
    }
  };

  const generateAIMorphology = async () => {
    if (user?.role !== 'regional_admin') {
      toast.error('AI features hanya dapat digunakan oleh Regional Admin');
      return;
    }

    setAiLoading(true);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const aiData = {
        local_name: formData.nama_umum || '',
        scientific_name: formData.nama_ilmiah || '',
        family: formData.famili || '',
        genus: formData.genus || '',
        is_endemic: formData.is_endemic || false,
        iucn_status: formData.status_iucn || ''
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/ai/public/generate-flora-morphology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aiData),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Failed to generate morphology (${response.status})`);
      }

      const result = await response.json();
      
      // Validate that we got actual content
      if (!result.description) {
        throw new Error('AI tidak menghasilkan konten yang valid');
      }
      
      setFormData(prev => ({ ...prev, morfologi: result.description }));
      toast.success('Morfologi berhasil dibuat dengan AI!');
    } catch (error) {
      console.error('Error generating AI morphology:', error);
      
      if (error.name === 'AbortError') {
        toast.error('AI generation timeout. Pastikan Ollama berjalan dan coba lagi.');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Tidak dapat terhubung ke AI service. Pastikan backend berjalan.');
      } else {
        toast.error(`Gagal membuat morfologi: ${error.message}`);
      }
    } finally {
      clearTimeout(timeoutId);
      setAiLoading(false);
    }
  };

  const generateAIBenefits = async () => {
    if (user?.role !== 'regional_admin') {
      toast.error('AI features hanya dapat digunakan oleh Regional Admin');
      return;
    }

    setAiLoading(true);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const aiData = {
        local_name: formData.nama_umum || '',
        scientific_name: formData.nama_ilmiah || '',
        family: formData.famili || '',
        genus: formData.genus || '',
        is_endemic: formData.is_endemic || false,
        iucn_status: formData.status_iucn || ''
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/ai/public/generate-flora-benefits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aiData),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Failed to generate benefits (${response.status})`);
      }

      const result = await response.json();
      
      // Validate that we got actual content
      if (!result.description) {
        throw new Error('AI tidak menghasilkan konten yang valid');
      }
      
      setFormData(prev => ({ ...prev, manfaat: result.description }));
      toast.success('Manfaat berhasil dibuat dengan AI!');
    } catch (error) {
      console.error('Error generating AI benefits:', error);
      
      if (error.name === 'AbortError') {
        toast.error('AI generation timeout. Pastikan Ollama berjalan dan coba lagi.');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Tidak dapat terhubung ke AI service. Pastikan backend berjalan.');
      } else {
        toast.error(`Gagal membuat manfaat: ${error.message}`);
      }
    } finally {
      clearTimeout(timeoutId);
      setAiLoading(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={flora ? 'Edit Data Flora' : 'Tambah Data Flora'}
      description={flora ? 'Perbarui informasi data flora' : 'Tambahkan data flora baru ke sistem'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      width="xl"
    >
      {/* Informasi Dasar */}
      <FormSection
        title="Informasi Dasar"
        description="Informasi identitas dan taksonomi flora"
      >
        <div className="space-y-2">
          <Label htmlFor="nama_ilmiah">
            Nama Ilmiah <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nama_ilmiah"
            placeholder="Contoh: Rafflesia arnoldii"
            value={formData.nama_ilmiah}
            onChange={(e) => handleChange('nama_ilmiah', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nama_umum">Nama Umum</Label>
          <Input
            id="nama_umum"
            placeholder="Contoh: Rafflesia"
            value={formData.nama_umum}
            onChange={(e) => handleChange('nama_umum', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="famili">Famili</Label>
            <Input
              id="famili"
              placeholder="Contoh: Rafflesiaceae"
              value={formData.famili}
              onChange={(e) => handleChange('famili', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genus">Genus</Label>
            <Input
              id="genus"
              placeholder="Contoh: Rafflesia"
              value={formData.genus}
              onChange={(e) => handleChange('genus', e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      {/* Deskripsi */}
      <FormSection
        title="Deskripsi"
        description="Informasi detail tentang flora"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="deskripsi">Deskripsi Umum</Label>
            {user?.role === 'regional_admin' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIDescription}
                disabled={aiLoading}
                className="flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate AI
              </Button>
            )}
          </div>
          <Textarea
            id="deskripsi"
            placeholder="Deskripsikan flora secara umum..."
            value={formData.deskripsi}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="morfologi">Morfologi</Label>
            {user?.role === 'regional_admin' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIMorphology}
                disabled={aiLoading}
                className="flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate AI
              </Button>
            )}
          </div>
          <Textarea
            id="morfologi"
            placeholder="Deskripsikan ciri morfologi (bentuk, ukuran, warna, dll)..."
            value={formData.morfologi}
            onChange={(e) => handleChange('morfologi', e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="manfaat">Manfaat</Label>
            {user?.role === 'regional_admin' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIBenefits}
                disabled={aiLoading}
                className="flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate AI
              </Button>
            )}
          </div>
          <Textarea
            id="manfaat"
            placeholder="Deskripsikan manfaat flora (ekologi, ekonomi, medis, dll)..."
            value={formData.manfaat}
            onChange={(e) => handleChange('manfaat', e.target.value)}
            rows={4}
          />
        </div>
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
              Flora Endemik
            </Label>
            <p className="text-sm text-muted-foreground">
              Tandai jika flora ini endemik Indonesia
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
        description="URL gambar utama flora"
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
                src={formData.gambar_utama.startsWith('http') ? formData.gambar_utama : `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}${formData.gambar_utama}`}
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

