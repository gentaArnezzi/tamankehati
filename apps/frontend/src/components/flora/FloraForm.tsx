import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Flora } from '../../lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAuth } from '../../lib/useAuth';
import { FileUpload } from '../ui/file-upload';
import { MultipleFileUpload } from '../ui/multiple-file-upload';

const floraSchema = z.object({
  nama_ilmiah: z.string().min(1, 'Nama ilmiah wajib diisi'),
  nama_umum: z.string().optional(),
  famili: z.string().optional(),
  genus: z.string().optional(),
  status_iucn: z.string().optional(),
  deskripsi: z.string().optional(),
  habitat: z.string().optional(),
  morfologi: z.string().optional(),
  manfaat: z.string().optional(),
  is_endemic: z.boolean().optional(),
  park_id: z.number().optional(),
  gambar_utama: z.string().optional(),
  status: z.enum(['draft', 'in_review', 'approved', 'rejected']).optional(),
});

type FloraFormData = z.infer<typeof floraSchema>;

interface FloraFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Flora>) => Promise<Flora | undefined>;
  initialData?: Flora | null;
  mode: 'create' | 'edit';
}

const IUCN_STATUS_OPTIONS = [
  { value: 'LC', label: 'LC - Least Concern (Risiko Rendah)' },
  { value: 'NT', label: 'NT - Near Threatened (Hampir Terancam)' },
  { value: 'VU', label: 'VU - Vulnerable (Rentan)' },
  { value: 'EN', label: 'EN - Endangered (Genting)' },
  { value: 'CR', label: 'CR - Critically Endangered (Kritis)' },
  { value: 'DD', label: 'DD - Data Deficient (Data Kurang)' },
  { value: 'NE', label: 'NE - Not Evaluated (Belum Dievaluasi)' },
];

export function FloraForm({ open, onOpenChange, onSubmit, initialData, mode }: FloraFormProps) {
  const { user } = useAuth();
  // Removed zone-related state as we now use park_id
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Array<{file: File; preview: string; id: string}>>([]);
  const [uploading, setUploading] = useState(false);
  
  const form = useForm<FloraFormData>({
    resolver: zodResolver(floraSchema),
    defaultValues: {
      nama_ilmiah: initialData?.nama_ilmiah ?? '',
      nama_umum: initialData?.nama_umum ?? '',
      famili: initialData?.famili ?? '',
      genus: initialData?.genus ?? '',
      status_iucn: initialData?.status_iucn ?? '',
      deskripsi: initialData?.deskripsi ?? '',
      habitat: initialData?.habitat ?? '',
      morfologi: initialData?.morfologi ?? '',
      manfaat: initialData?.manfaat ?? '',
      status: initialData?.status ?? (user?.role === 'regional_admin' ? 'draft' : 'approved'),
      is_endemic: initialData?.is_endemic ?? false,
      park_id: initialData?.park_id ?? 1,
      gambar_utama: initialData?.gambar_utama ?? '',
    },
  });

  useEffect(() => {
    if (!open) return;
    
    // Debug: Log the initial data
    console.log('FloraForm - initialData:', initialData);
    console.log('FloraForm - mode:', mode);
    
    const formData = {
      nama_ilmiah: initialData?.nama_ilmiah ?? '',
      nama_umum: initialData?.nama_umum ?? '',
      famili: initialData?.famili ?? '',
      genus: initialData?.genus ?? '',
      status_iucn: initialData?.status_iucn ?? '',
      deskripsi: initialData?.deskripsi ?? '',
      habitat: initialData?.habitat ?? '',
      morfologi: initialData?.morfologi ?? '',
      manfaat: initialData?.manfaat ?? '',
      is_endemic: initialData?.is_endemic ?? false,
      park_id: initialData?.park_id ?? 1,
      gambar_utama: initialData?.gambar_utama ?? '',
    };
    
    console.log('FloraForm - formData to reset:', formData);
    form.reset(formData);
  }, [form, initialData, open, mode]);

  // Removed zone loading logic as we now use park_id

  const uploadFile = async (file: File): Promise<string> => {
    console.log('Uploading flora image:', file.name, 'Size:', file.size);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/v1/upload/gallery-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Flora image upload success:', result);
      return result.url;
    } catch (error) {
      console.error('Flora image upload error:', error);
      throw error;
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    console.log('Uploading multiple flora images:', files.length);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('http://localhost:8000/api/v1/upload/multiple-gallery-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Multiple flora images upload success:', result);
      return result.uploaded_files.map((file: any) => file.url);
    } catch (error) {
      console.error('Multiple flora images upload error:', error);
      throw error;
    }
  };

  const handleFilesSelect = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleSubmit = async (data: FloraFormData, submitStatus: 'draft' | 'in_review') => {
    try {
      setUploading(true);
      
      console.log('Flora form submitting - mode:', mode, 'status:', submitStatus);
      console.log('Flora form data:', data);
      
      let imageUrl = data.gambar_utama;
      let uploadedImageUrls: string[] = [];
      
      // If single file is selected, upload it first
      if (selectedFile) {
        console.log('Uploading flora image file:', selectedFile.name);
        imageUrl = await uploadFile(selectedFile);
        console.log('Flora image uploaded successfully, URL:', imageUrl);
      }
      
      // If multiple files are selected, upload them
      if (selectedFiles.length > 0) {
        console.log('Uploading multiple flora images:', selectedFiles.length);
        const files = selectedFiles.map(f => f.file);
        uploadedImageUrls = await uploadMultipleFiles(files);
        console.log('Multiple flora images uploaded successfully, URLs:', uploadedImageUrls);
        
        // Use first uploaded image as main image if no single file was selected
        if (!imageUrl && uploadedImageUrls.length > 0) {
          imageUrl = uploadedImageUrls[0];
        }
      }
      
      const floraData = {
        ...data,
        gambar_utama: imageUrl,
        status: submitStatus, // Use the status from button click
      };
      
      console.log('Flora data to submit:', floraData);
      
      // Submit flora data
      const floraResult = await onSubmit(floraData);
      
      console.log('Flora submit result:', floraResult);
      
      // Create gallery records for all uploaded images
      if (floraResult?.id) {
        try {
          const { createGalleryForEntity } = await import('../../lib/gallery-integration');
          
          // Create gallery record for main image if single file was uploaded
          if (selectedFile && imageUrl) {
            await createGalleryForEntity(imageUrl, {
              entityType: 'flora',
              entityId: Number(floraResult.id),
              title: `${data.nama_umum || data.nama_ilmiah} - ${data.nama_ilmiah} (Gambar Utama)`,
              description: data.deskripsi || '',
              parkId: Number(data.park_id) || 1,
            });
            console.log('Gallery record created for main flora image:', floraResult.id);
          }
          
          // Create gallery records for multiple images
          for (let i = 0; i < uploadedImageUrls.length; i++) {
            const url = uploadedImageUrls[i];
            const isMainImage = selectedFile && url === imageUrl;
            
            await createGalleryForEntity(url, {
              entityType: 'flora',
              entityId: Number(floraResult.id),
              title: `${data.nama_umum || data.nama_ilmiah} - ${data.nama_ilmiah} ${isMainImage ? '(Gambar Utama)' : `(Gambar ${i + 1})`}`,
              description: data.deskripsi || '',
              parkId: Number(data.park_id) || 1,
            });
            console.log(`Gallery record created for flora image ${i + 1}:`, floraResult.id);
          }
        } catch (galleryError) {
          console.error('Failed to create gallery records:', galleryError);
          // Don't fail the entire operation if gallery creation fails
        }
      }
      
      form.reset();
      setSelectedFile(null);
      setSelectedFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Flora form submit error:', error);
      // Error handled by parent
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Data Flora Baru' : 'Edit Data Flora'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Isi formulir di bawah untuk menambahkan data flora baru. Data akan disimpan sebagai draft.'
              : 'Perbarui informasi flora. Perubahan akan disimpan sebagai draft.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nama_ilmiah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ilmiah *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Rafflesia arnoldii" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nama_umum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Umum</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Bunga Bangkai Raksasa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="famili"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Famili</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Rafflesiaceae" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genus</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Rafflesia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status_iucn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status IUCN</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status IUCN" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {IUCN_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Removed zone field as we now use park_id */}

            <FormField
              control={form.control}
              name="is_endemic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Endemik Indonesia</FormLabel>
                    <FormDescription>
                      Centang jika spesies ini endemik di Indonesia
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="morfologi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Morfologi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Bunga berukuran 50-100 cm dengan warna merah bercak putih, tidak memiliki daun dan batang"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Lengkap</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Deskripsi detail tentang flora ini, termasuk ciri-ciri morfologi, distribusi, dan informasi penting lainnya"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="habitat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habitat</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informasi tentang habitat flora ini, misalnya: hutan hujan tropis, dataran rendah, pegunungan, dll."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manfaat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manfaat / Kegunaan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Dimanfaatkan sebagai tanaman obat tradisional untuk meredakan demam"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {user?.role === 'regional_admin' && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">Submit untuk Review</SelectItem>
                  </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih "Submit untuk Review" untuk mengirim data ke super admin untuk approval.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-6">
              {/* Single Image Upload */}
              <div>
                <label className="text-sm font-medium">Upload Gambar Utama Flora</label>
                <FileUpload
                  onFileSelect={setSelectedFile}
                  onFileRemove={() => setSelectedFile(null)}
                  selectedFile={selectedFile}
                  maxSize={10}
                  className="mt-2"
                />
              </div>
              
              {/* Multiple Images Upload */}
              <div>
                <label className="text-sm font-medium">Upload Gambar Tambahan (Opsional)</label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload hingga 10 gambar tambahan untuk flora ini
                </p>
                <MultipleFileUpload
                  onFilesSelect={handleFilesSelect}
                  onFileRemove={handleFileRemove}
                  selectedFiles={selectedFiles}
                  maxSize={10}
                  maxFiles={10}
                  className="mt-2"
                />
              </div>
              
              <div className="text-center text-sm text-gray-500">atau</div>
              
              <FormField
                control={form.control}
                name="gambar_utama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Utama</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/gambar.jpg" 
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL gambar dari sumber eksternal (opsional jika sudah upload file)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button 
                type="button"
                variant="secondary"
                disabled={form.formState.isSubmitting || uploading}
                onClick={form.handleSubmit((data) => handleSubmit(data, 'draft'))}
              >
                {uploading || form.formState.isSubmitting
                  ? 'Menyimpan...' 
                  : 'Simpan sebagai Draft'}
              </Button>
              <Button 
                type="button"
                disabled={form.formState.isSubmitting || uploading}
                onClick={form.handleSubmit((data) => handleSubmit(data, 'in_review'))}
                style={{ backgroundColor: '#233c2b' }}
              >
                {uploading || form.formState.isSubmitting
                  ? 'Mengirim...' 
                  : 'Submit untuk Review'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
