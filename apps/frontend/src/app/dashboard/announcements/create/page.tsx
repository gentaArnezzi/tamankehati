'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const announcementTypes = [
  { value: 'news', label: 'Berita' },
  { value: 'announcement', label: 'Pengumuman' },
  { value: 'event', label: 'Event' },
  { value: 'maintenance', label: 'Pemeliharaan' },
];

const priorityOptions = [
  { value: 0, label: 'Rendah' },
  { value: 1, label: 'Sedang' },
  { value: 2, label: 'Mendesak' },
];

const targetAudienceOptions = [
  { value: 'all', label: 'Semua Pengguna' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'regional_admin', label: 'Regional Admin' },
];

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    type: 'announcement',
    status: 'published',
    priority: 1,
    is_featured: false,
    is_pinned: false,
    featured_image: '',
    tags: '',
    expires_at: '',
    target_audience: 'all',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Konten wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('auth_token');
      
      // Prepare payload: convert empty strings to null for optional datetime fields
      const payload = {
        ...formData,
        expires_at: formData.expires_at || null, // Convert empty string to null
        featured_image: formData.featured_image || null, // Convert empty string to null
      };
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}/api/v1/announcements/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        
        // Handle different error formats
        let errorMessage = 'Gagal menyimpan pengumuman';
        
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // FastAPI validation errors (array of objects)
          errorMessage = errorData.detail.map((err: any) => 
            `${err.loc?.join(' → ') || 'Error'}: ${err.msg}`
          ).join('; ');
        } else if (errorData.detail && typeof errorData.detail === 'object') {
          // Object error detail
          errorMessage = JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }

      toast.success('Pengumuman berhasil ditambahkan');
      router.push('/dashboard/announcements');
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      const errorMessage = error.message || 'Gagal menyimpan pengumuman';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Buat Pengumuman Baru</h1>
                <p className="text-sm text-muted-foreground">
                  Buat pengumuman untuk dikirim ke pengguna
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleChange('status', 'draft');
                  handleSubmit(new Event('submit') as any);
                }}
                disabled={isSubmitting}
              >
                Simpan sebagai Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ backgroundColor: '#233c2b' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Publikasikan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Informasi utama pengumuman
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Judul Pengumuman <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Contoh: Pembaruan Sistem Taman Kehati"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Ringkasan</Label>
                <Textarea
                  id="summary"
                  placeholder="Ringkasan singkat pengumuman (opsional)..."
                  value={formData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Ringkasan akan ditampilkan di preview card
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Konten <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Tulis konten pengumuman lengkap di sini..."
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={10}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Konten detail yang akan ditampilkan saat pengumuman dibuka
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Kategori & Prioritas */}
          <Card>
            <CardHeader>
              <CardTitle>Kategori & Prioritas</CardTitle>
              <CardDescription>
                Atur jenis dan tingkat prioritas pengumuman
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Jenis Pengumuman</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {announcementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioritas</Label>
                  <Select
                    value={formData.priority.toString()}
                    onValueChange={(value) => handleChange('priority', parseInt(value))}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value.toString()}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audiens</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => handleChange('target_audience', value)}
                >
                  <SelectTrigger id="target_audience">
                    <SelectValue placeholder="Pilih target audiens" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAudienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tentukan siapa yang akan melihat pengumuman ini
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Pisahkan dengan koma: sistem, pembaruan, penting"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Tags untuk memudahkan pencarian
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pengaturan Tampilan */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>
                Atur bagaimana pengumuman ditampilkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featured_image">URL Gambar Unggulan</Label>
                <Input
                  id="featured_image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.featured_image}
                  onChange={(e) => handleChange('featured_image', e.target.value)}
                />
                {formData.featured_image && (
                  <div className="mt-2 rounded-lg border p-2">
                    <img
                      src={formData.featured_image}
                      alt="Preview"
                      className="h-48 w-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_featured" className="text-base">
                    <Sparkles className="inline-block w-4 h-4 mr-2" />
                    Pengumuman Unggulan
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tampilkan di bagian unggulan
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleChange('is_featured', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_pinned" className="text-base">
                    📌 Pin ke Atas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sematkan pengumuman di bagian atas
                  </p>
                </div>
                <Switch
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => handleChange('is_pinned', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Masa Berlaku */}
          <Card>
            <CardHeader>
              <CardTitle>Masa Berlaku</CardTitle>
              <CardDescription>
                Atur kapan pengumuman kadaluarsa (opsional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expires_at">Tanggal Kadaluarsa</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => handleChange('expires_at', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Kosongkan jika pengumuman tidak memiliki tanggal kadaluarsa
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions - Mobile */}
          <div className="md:hidden sticky bottom-0 bg-white border-t p-4 -mx-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                style={{ backgroundColor: '#233c2b' }}
              >
                {isSubmitting ? 'Menyimpan...' : 'Publikasikan'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

