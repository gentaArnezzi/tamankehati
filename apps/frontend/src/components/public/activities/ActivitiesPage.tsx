'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { Alert, AlertDescription } from '../../ui/alert';
import { Input } from '../../ui/input';
import { 
  Calendar, 
  MapPin, 
  Search,
  Activity as ActivityIcon,
  Clock,
  Filter,
  ChevronRight
} from 'lucide-react';
import { publicApi } from '../../../lib/public-api-client';
import Link from 'next/link';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_date: string;
  location: string;
  park_name: string;
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
            <div className="flex items-center gap-2 mb-8">
              <ActivityIcon className="h-6 w-6 text-emerald-600" />
              <h1 className="text-3xl font-bold">Kegiatan Taman</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ActivityIcon className="h-8 w-8 text-emerald-600" />
              <h1 className="text-4xl font-bold text-gray-900">Kegiatan Taman</h1>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Temukan berbagai kegiatan yang dilakukan di taman-taman konservasi Indonesia
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari kegiatan, taman, atau lokasi..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Stats */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">Semua Kegiatan</h2>
                {totalItems > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {totalItems} kegiatan ditemukan
                  </Badge>
                )}
              </div>
            </div>

            {/* Activities Grid */}
            {loading && activities.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-16">
                <ActivityIcon className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-medium text-muted-foreground mb-3">
                  Belum ada kegiatan
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? `Tidak ada kegiatan yang cocok dengan pencarian "${searchQuery}"`
                    : 'Belum ada kegiatan yang dipublikasikan'
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => handleSearch('')}>
                    Hapus Pencarian
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredActivities.map((activity) => (
                    <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2 leading-tight">
                          {activity.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {formatDate(activity.activity_date)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {activity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {activity.description}
                          </p>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          {activity.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span className="line-clamp-1">{activity.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ActivityIcon className="h-4 w-4" />
                            <span className="line-clamp-1">{activity.park_name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(activity.activity_date)}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="text-center mt-12">
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
        </div>
      </section>
    </div>
  );
}

