'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { Alert, AlertDescription } from '../../ui/alert';
import { 
  Calendar, 
  MapPin, 
  Search,
  Filter,
  ChevronRight,
  Activity as ActivityIcon,
  Clock
} from 'lucide-react';
import { Input } from '../../ui/input';
import { publicApi } from '@/lib/public-api-client';
import Link from 'next/link';

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

interface ParkActivitiesProps {
  parkId: number;
  parkName: string;
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

export function ParkActivities({ parkId, parkName }: ParkActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const itemsPerPage = 6;

  const loadActivities = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        ...(search && { search }),
      };

      const response = await publicApi.getActivitiesByPark(parkId, params);
      
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
  }, [parkId, searchQuery]);

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
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Kegiatan {parkName}</h2>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ActivityIcon className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-semibold">Kegiatan {parkName}</h2>
        {totalItems > 0 && (
          <Badge variant="secondary" className="ml-2">
            {totalItems} kegiatan
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Cari kegiatan..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Activities Grid */}
      {loading && activities.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Belum ada kegiatan
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery 
              ? `Tidak ada kegiatan yang cocok dengan pencarian "${searchQuery}"`
              : 'Belum ada kegiatan yang dipublikasikan untuk taman ini'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/kegiatan/${activity.id}`}>
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={activity.images && activity.images.length > 0 
                          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${activity.images[0]}`
                          : '/placeholder.svg'
                        }
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          {formatDate(activity.activity_date)}
                        </Badge>
                      </div>
                      {activity.images && activity.images.length > 1 && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-black/50 text-white border-transparent">
                            +{activity.images.length - 1}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {activity.park_name || 'Taman Konservasi'}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {activity.description || 'Deskripsi tidak tersedia'}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-slate-500">
                          {activity.location || 'Lokasi tidak tersedia'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={loadMore}
                disabled={loading}
                className="min-w-32"
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
  );
}

