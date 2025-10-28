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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
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
                  
                  {activity.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </div>
                  )}

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

