'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { 
  Calendar, 
  Eye, 
  Pin, 
  Star, 
  Tag, 
  Clock,
  FileText,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface NewsDetail {
  id: number;
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  category: string;
  priority: number;
  is_featured: boolean;
  is_pinned: boolean;
  featured_image?: string;
  tags?: string;
  reading_time: number;
  published_at?: string;
  expires_at?: string;
  view_count: number;
  created_at: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadNewsDetail();
    }
  }, [params.id]);

  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}/api/v1/news/public/${params.id}`
      );

      if (!response.ok) {
        throw new Error('Berita tidak ditemukan');
      }

      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat berita');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      biodiversity: 'bg-green-100 text-green-800',
      conservation: 'bg-blue-100 text-blue-800',
      research: 'bg-purple-100 text-purple-800',
      education: 'bg-yellow-100 text-yellow-800',
      events: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      biodiversity: 'Keanekaragaman Hayati',
      conservation: 'Konservasi',
      research: 'Penelitian',
      education: 'Pendidikan',
      events: 'Acara',
      general: 'Umum',
    };

    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[category as keyof typeof labels] || category}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>Berita tidak ditemukan</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/news">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Berita
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {news.is_pinned && (
              <Pin className="h-4 w-4 text-blue-600" />
            )}
            {news.is_featured && (
              <Star className="h-4 w-4 text-yellow-600" />
            )}
            {getCategoryBadge(news.category)}
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
          
          {news.summary && (
            <p className="text-xl text-muted-foreground mb-6">{news.summary}</p>
          )}
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {news.published_at 
                  ? formatDate(news.published_at)
                  : formatDate(news.created_at)
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{news.view_count} views</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{news.reading_time} menit baca</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {news.featured_image && (
          <div className="mb-8">
            <img
              src={news.featured_image}
              alt={news.title}
              className="w-full h-auto rounded-lg shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{news.content}</div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {news.tags && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {news.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
