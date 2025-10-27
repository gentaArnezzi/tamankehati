'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { News } from './NewsPage';

const newsSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  content: z.string().min(1, 'Konten wajib diisi'),
  summary: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional(),
  slug: z.string().max(255, 'Slug maksimal 255 karakter').optional(),
  category: z.enum(['biodiversity', 'conservation', 'research', 'education', 'events', 'general']),
  priority: z.number().min(0).max(2),
  is_featured: z.boolean(),
  is_pinned: z.boolean(),
  featured_image: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  attachments: z.string().optional(),
  tags: z.string().max(500, 'Tags maksimal 500 karakter').optional(),
  reading_time: z.number().min(0, 'Waktu baca harus positif'),
  expires_at: z.date().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<News>) => Promise<void>;
  initialData?: News | null;
  mode: 'create' | 'edit';
}

const NEWS_CATEGORIES = [
  { value: 'biodiversity', label: 'Keanekaragaman Hayati' },
  { value: 'conservation', label: 'Konservasi' },
  { value: 'research', label: 'Penelitian' },
  { value: 'education', label: 'Pendidikan' },
  { value: 'events', label: 'Acara' },
  { value: 'general', label: 'Umum' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Normal' },
  { value: 1, label: 'Tinggi' },
  { value: 2, label: 'Mendesak' },
];

export function NewsForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: NewsFormProps) {
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      slug: '',
      category: 'general',
      priority: 0,
      is_featured: false,
      is_pinned: false,
      featured_image: '',
      attachments: '',
      tags: '',
      reading_time: 0,
      expires_at: undefined,
    },
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        summary: initialData.summary || '',
        slug: initialData.slug || '',
        category: initialData.category,
        priority: initialData.priority,
        is_featured: initialData.is_featured,
        is_pinned: initialData.is_pinned,
        featured_image: initialData.featured_image || '',
        attachments: initialData.attachments || '',
        tags: initialData.tags || '',
        reading_time: initialData.reading_time,
        expires_at: initialData.expires_at ? new Date(initialData.expires_at) : undefined,
      });
      setExpiresAt(initialData.expires_at ? new Date(initialData.expires_at) : undefined);
    } else {
      form.reset({
        title: '',
        content: '',
        summary: '',
        slug: '',
        category: 'general',
        priority: 0,
        is_featured: false,
        is_pinned: false,
        featured_image: '',
        attachments: '',
        tags: '',
        reading_time: 0,
        expires_at: undefined,
      });
      setExpiresAt(undefined);
    }
  }, [initialData, mode, form]);

  const handleSubmit = async (data: NewsFormData) => {
    try {
      setLoading(true);
      await onSubmit({
        ...data,
        expires_at: expiresAt?.toISOString(),
      });
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleExpiresAtChange = (date: Date | undefined) => {
    setExpiresAt(date);
    form.setValue('expires_at', date);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('title'))) {
      form.setValue('slug', generateSlug(title));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Buat Berita Baru' : 'Edit Berita'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Buat berita atau artikel baru tentang keanekaragaman hayati' 
              : 'Edit berita yang sudah ada'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                  <CardDescription>
                    Informasi utama berita
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan judul berita" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleTitleChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug URL</FormLabel>
                        <FormControl>
                          <Input placeholder="url-slug-berita" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL slug untuk berita (otomatis dibuat dari judul)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ringkasan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ringkasan singkat berita (opsional)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ringkasan akan ditampilkan di daftar berita
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori berita" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NEWS_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioritas</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih prioritas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value.toString()}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pengaturan</CardTitle>
                  <CardDescription>
                    Pengaturan tampilan dan perilaku
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured</FormLabel>
                          <FormDescription>
                            Tampilkan sebagai berita unggulan
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

                  <FormField
                    control={form.control}
                    name="is_pinned"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Pin ke Atas</FormLabel>
                          <FormDescription>
                            Pin berita ke bagian atas daftar
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

                  <FormField
                    control={form.control}
                    name="reading_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waktu Baca (menit)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Perkiraan waktu baca dalam menit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Kedaluwarsa</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !expiresAt && "text-muted-foreground"
                                )}
                              >
                                {expiresAt ? (
                                  format(expiresAt, "PPP", { locale: id })
                                ) : (
                                  <span>Pilih tanggal kedaluwarsa (opsional)</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={expiresAt}
                              onSelect={handleExpiresAtChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Berita akan otomatis diarsipkan setelah tanggal ini
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Konten</CardTitle>
                <CardDescription>
                  Isi berita yang akan ditampilkan kepada pembaca
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konten *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tulis konten berita di sini..."
                          className="min-h-[300px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Gunakan format Markdown untuk styling
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Media & Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Media & Lampiran</CardTitle>
                <CardDescription>
                  Gambar dan file lampiran untuk berita
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="featured_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gambar Utama</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="URL gambar utama (opsional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL gambar yang akan ditampilkan sebagai thumbnail
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lampiran</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="JSON string URL lampiran (opsional)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Format JSON array: ["url1", "url2", "url3"]
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tag1, Tag2, Tag3 (pisahkan dengan koma)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Tags untuk kategorisasi dan pencarian
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Buat Berita' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
