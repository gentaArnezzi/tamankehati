'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  MoreHorizontal,
  Image as ImageIcon,
  Type,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/useAuth';

interface MediumStyleArtikelPageProps {
  articleId?: string;
  mode?: 'create' | 'edit';
}

export function MediumStyleArtikelPage({ articleId, mode = 'create' }: MediumStyleArtikelPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load article data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && articleId) {
      loadArticle();
    }
  }, [mode, articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Anda harus login terlebih dahulu');
        router.push('/login');
        return;
      }

      console.log('Loading article:', articleId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/articles/${articleId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Response status:', response.status);

      if (response.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        router.push('/login');
        return;
      }

      if (response.status === 404) {
        toast.error('Artikel tidak ditemukan');
        router.push('/dashboard/taman/berita');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to load article (${response.status})`);
      }

      const data = await response.json();
      console.log('Loaded article data:', data);
      
      setTitle(data.title || '');
      setContent(data.content || '');
      setExcerpt(data.summary || '');
      setCategory(data.category || '');
      setFeaturedImage(data.featured_image || '');
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memuat artikel');
      router.push('/dashboard/taman/berita');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'approved') => {
    if (!title || !content) {
      toast.error('Judul dan konten wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Anda harus login terlebih dahulu');
        router.push('/login');
        return;
      }

      const url = mode === 'edit' && articleId
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/articles/${articleId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/articles/`;
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          summary: excerpt || content.substring(0, 200) + '...',
          category: category || 'Artikel',
          featured_image: featuredImage || null,
          status,
        }),
      });

      if (response.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Gagal menyimpan artikel');
      }

      const successMessage = mode === 'edit'
        ? (status === 'draft' ? 'Artikel berhasil diperbarui' : 'Artikel berhasil dipublikasikan!')
        : (status === 'draft' ? 'Artikel disimpan sebagai draft' : 'Artikel berhasil dipublikasikan!');
      
      toast.success(successMessage);
      router.push('/dashboard/taman/berita');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan artikel');
    } finally {
      setSubmitting(false);
    }
  };

  const insertFormatting = (format: string) => {
    // Simple text formatting helper
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'tebal'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'miring'}*`;
        break;
      case 'heading':
        newText = `\n## ${selectedText || 'Heading'}\n`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'Item list'}\n`;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'Quote'}\n`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  // Show loading state when fetching article data
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="text-gray-600">Memuat artikel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-500">
              {mode === 'edit' ? `Edit artikel` : `Draft di ${user?.display_name || 'Taman Kehati'}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('draft')}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {mode === 'edit' ? 'Update' : 'Simpan'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave('approved')}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {submitting ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Cover Image */}
        {featuredImage ? (
          <div className="mb-8 relative group">
            <img 
              src={featuredImage} 
              alt="Cover" 
              className="w-full rounded-lg"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setFeaturedImage('')}
            >
              Hapus
            </Button>
          </div>
        ) : (
          <div 
            className="mb-8 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center hover:border-gray-300 cursor-pointer transition-colors group"
            onClick={() => {
              const url = prompt('Masukkan URL gambar cover:');
              if (url) setFeaturedImage(url);
            }}
          >
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 group-hover:text-gray-400 transition-colors" />
            <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-600">
              Klik untuk menambahkan cover image
            </p>
          </div>
        )}

        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul"
          className="border-0 text-5xl font-bold placeholder:text-gray-300 focus-visible:ring-0 px-0 mb-4"
          style={{ 
            fontSize: '42px',
            lineHeight: '1.2',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />

        {/* Excerpt */}
        <Input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Ringkasan artikel (opsional)"
          className="border-0 text-xl text-gray-500 placeholder:text-gray-300 focus-visible:ring-0 px-0 mb-8"
        />

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 mb-6 pb-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('heading')}
            title="Heading"
          >
            <Type className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('list')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('quote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('code')}
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = prompt('Masukkan URL gambar:');
              if (url) {
                setContent(content + `\n![Alt text](${url})\n`);
              }
            }}
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Editor */}
        <textarea
          id="content-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Mulai menulis cerita Anda..."
          className="w-full min-h-[600px] text-xl leading-relaxed resize-none border-0 focus:outline-none placeholder:text-gray-300"
          style={{ 
            fontFamily: 'Georgia, serif',
            lineHeight: '1.8'
          }}
        />

        {/* Tips */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm text-gray-500">
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Tips Penulisan:</p>
              <ul className="space-y-1">
                <li>• Gunakan <code className="bg-gray-100 px-1 rounded">**tebal**</code> untuk teks bold</li>
                <li>• Gunakan <code className="bg-gray-100 px-1 rounded">*miring*</code> untuk teks italic</li>
                <li>• Gunakan <code className="bg-gray-100 px-1 rounded">## Judul</code> untuk heading</li>
                <li>• Gunakan <code className="bg-gray-100 px-1 rounded">![alt](url)</code> untuk gambar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg z-50 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pengaturan</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Konservasi">Konservasi</option>
                  <option value="Penelitian">Penelitian</option>
                  <option value="Edukasi">Edukasi</option>
                  <option value="Berita">Berita</option>
                  <option value="Laporan Lapangan">Laporan Lapangan</option>
                  <option value="Kebijakan">Kebijakan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL Cover Image</label>
                <Input
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ringkasan</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat artikel..."
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {excerpt.length}/200 karakter
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

