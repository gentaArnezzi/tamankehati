'use client';

import { useState, useEffect } from 'react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { Alert, AlertDescription } from '../../ui/alert';
import { Input } from '../../ui/input';
import { 
  Search,
  ChevronRight
} from 'lucide-react';
import { publicApi } from '../../../lib/public-api-client';
import Link from 'next/link';
import styles from './ActivitiesPage.module.css';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_date: string;
  location: string;
  park_name: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const itemsPerPage = 12;

  const loadActivities = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        ...(search && { search }),
      };

      const response = await publicApi.getActivities(params);
      
      if (page === 1) {
        setActivities(response.items);
      } else {
        setActivities(prev => [...prev, ...response.items]);
      }
      
      setTotalItems(response.total);
      setHasNextPage(response.hasNext);
      setCurrentPage(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat kegiatan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(1, searchQuery);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (hasNextPage && !loading) {
      loadActivities(currentPage + 1, searchQuery);
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.park_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Kegiatan Taman</h1>
            </div>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Hero Section */}
      <section 
        className="py-24 md:py-32 bg-cover bg-center bg-no-repeat border-b border-gray-200 relative"
        style={{
          backgroundImage: "url('/home/hero.jpg')"
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/90" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-sm text-gray-500 mb-6 tracking-wide uppercase">
              Kegiatan Konservasi
            </div>
            
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Kegiatan
              <span className="block text-gray-600">Konservasi</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Jelajahi berbagai kegiatan konservasi yang dilaksanakan di taman-taman keanekaragaman hayati Indonesia
            </p>
            
            {/* Search */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari kegiatan atau taman..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 border-gray-300 focus:border-gray-900 focus:ring-gray-900 rounded-none bg-white text-sm"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
              <div>
                <span className="text-2xl font-light text-gray-900">{totalItems}</span>
                <span className="ml-2">Kegiatan</span>
              </div>
              <div>
                <span className="text-2xl font-light text-gray-900">50+</span>
                <span className="ml-2">Taman</span>
              </div>
              <div>
                <span className="text-2xl font-light text-gray-900">1000+</span>
                <span className="ml-2">Peserta</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Semua Kegiatan</h2>
            <p className="text-gray-600 mb-6">Koleksi kegiatan konservasi dan edukasi</p>
            
            {/* Results Count */}
            {totalItems > 0 && (
              <div className="text-sm text-gray-500">
                {totalItems} kegiatan ditemukan
              </div>
            )}
          </div>

          {/* Activities Grid */}
          {loading && activities.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-light text-gray-900 mb-4">
                Belum ada kegiatan
              </h3>
              <p className="text-gray-600 mb-8">
                {searchQuery 
                  ? `Tidak ada kegiatan yang cocok dengan pencarian "${searchQuery}"`
                  : 'Belum ada kegiatan yang dipublikasikan'
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => handleSearch('')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Hapus Pencarian
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredActivities.map((activity) => (
                  <Link key={activity.id} href={`/kegiatan/${activity.id}`} className="group block">
                    <div className="bg-white border border-gray-200 hover:border-gray-900 transition-colors duration-200">
                      {/* Image */}
                      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                        <img
                          src={activity.images && activity.images.length > 0 
                            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${activity.images[0]}`
                            : '/placeholder.svg'
                          }
                          alt={activity.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Date Badge */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-white text-gray-900 px-3 py-1 text-xs font-medium">
                            {formatDate(activity.activity_date)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-light text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors">
                          {activity.title}
                        </h3>
                        
                        <p className="text-sm text-gray-500 mb-2">
                          {activity.park_name || 'Taman Konservasi'}
                        </p>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                          {activity.description || 'Deskripsi tidak tersedia'}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="line-clamp-1">{activity.location || 'Lokasi tidak tersedia'}</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="text-center mt-16">
                  <Button 
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Memuat...
                      </>
                    ) : (
                      'Muat Lebih Banyak'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-light text-gray-900 mb-6">
              Pelajari Lebih Lanjut
            </h3>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
              Temukan visi, misi, dan komitmen kami dalam melestarikan keanekaragaman hayati Indonesia
            </p>
            
            <Link href="/misi">
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3"
              >
                Pelajari Misi Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

