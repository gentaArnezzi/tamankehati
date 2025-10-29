'use client';

import { useState, useEffect } from 'react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { Alert, AlertDescription } from '../../ui/alert';
import { Input } from '../../ui/input';
import { 
  Search,
  ChevronRight,
  Calendar,
  MapPin,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { publicApi } from '../../../lib/public-api-client';
import Link from 'next/link';
import Image from 'next/image';
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

interface Stats {
  total_flora: number;
  total_fauna: number;
  total_taman: number;
  total_artikel: number;
}

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Filter states
  const [selectedPark, setSelectedPark] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [availableParks, setAvailableParks] = useState<{id: string, name: string}[]>([]);
  const [parksLoading, setParksLoading] = useState(true);
  
  const itemsPerPage = 12;

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await publicApi.getStats();
      setStats(response as unknown as Stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
      // Set fallback stats
      setStats({
        total_flora: 0,
        total_fauna: 0,
        total_taman: 0,
        total_artikel: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadParks = async () => {
    try {
      setParksLoading(true);
      const response = await publicApi.getTaman({ limit: 100 });
      console.log('Parks API Response:', response);
      console.log('Response items:', response.items);
      
      if (response.items && response.items.length > 0) {
        console.log('First park item:', response.items[0]);
      }
      
      const parks = response.items.map(park => ({
        id: park.id,
        name: park.nama_taman
      }));
      
      console.log('Mapped parks:', parks);
      setAvailableParks(parks);
    } catch (err) {
      console.error('Failed to load parks:', err);
      setAvailableParks([]);
    } finally {
      setParksLoading(false);
    }
  };

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
    loadStats();
    loadParks();
  }, []);

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

  // Filter and sort activities
  const getFilteredAndSortedActivities = () => {
    console.log('Filtering activities with selectedPark:', selectedPark);
    console.log('Available activities:', activities.map(a => ({ title: a.title, park_name: a.park_name })));
    
    let filtered = activities.filter(activity => {
      // Search filter
      const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.park_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Park filter - filter by park name (case-insensitive)
      const matchesPark = !selectedPark || 
        activity.park_name.toLowerCase().includes(selectedPark.toLowerCase());
      
      if (selectedPark) {
        console.log(`Activity: ${activity.title}, Park: ${activity.park_name}, Selected: ${selectedPark}, Matches: ${matchesPark}`);
      }
      
      // Time filter
      const timeFilterMap: Record<string, () => boolean> = {
        'hari-ini': () => {
          const today = new Date();
          const activityDate = new Date(activity.activity_date);
          return activityDate.toDateString() === today.toDateString();
        },
        'minggu-ini': () => {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const activityDate = new Date(activity.activity_date);
          return activityDate >= weekAgo && activityDate <= now;
        },
        'bulan-ini': () => {
          const now = new Date();
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const activityDate = new Date(activity.activity_date);
          return activityDate >= monthAgo && activityDate <= now;
        },
        'tahun-ini': () => {
          const now = new Date();
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          const activityDate = new Date(activity.activity_date);
          return activityDate >= yearAgo && activityDate <= now;
        }
      };
      
      const matchesTime = !selectedTime || (timeFilterMap[selectedTime]?.() ?? true);
      
      return matchesSearch && matchesPark && matchesTime;
    });

    // Sort activities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'terbaru':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'terlama':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'populer':
          // You can implement popularity logic here
          return 0;
        case 'a-z':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredActivities = getFilteredAndSortedActivities();

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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Background Image */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/home/hero.jpg"
            alt="Kegiatan Konservasi Taman Kehati Indonesia"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Dark black overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Subtle bottom overlay with standard dark brown */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

        {/* Floating elements with brown theme */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400 rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-amber-500 rounded-full animate-float delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-float delay-500"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-block mb-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-950/40 backdrop-blur-sm border border-amber-800/30 rounded-full text-amber-50 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Kegiatan Konservasi
                </div>
              </div>
              
              {/* Main heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 leading-tight animate-slide-up">
                <span className="block">Kegiatan</span>
                <span className="block font-normal text-amber-50">Konservasi</span>
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-amber-50 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300">
                Jelajahi berbagai kegiatan konservasi yang dilaksanakan di taman-taman keanekaragaman hayati Indonesia
              </p>
              
              {/* Search */}
              <div className="max-w-md mx-auto animate-fade-in delay-500">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-200 w-5 h-5" />
                  <Input
                    placeholder="Cari kegiatan atau taman..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-amber-950/20 backdrop-blur-sm border border-amber-800/30 rounded-xl text-white placeholder-amber-200 focus:bg-amber-950/30 focus:border-amber-700 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in delay-700">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-light text-white mb-2">
                    {statsLoading ? '...' : totalItems.toLocaleString()}
                  </div>
                  <div className="text-sm text-amber-100 uppercase tracking-wide">Kegiatan</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-light text-white mb-2">
                    {statsLoading ? '...' : (stats?.total_taman || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-amber-100 uppercase tracking-wide">Taman</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-light text-white mb-2">
                    {statsLoading ? '...' : ((stats?.total_flora || 0) + (stats?.total_fauna || 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-amber-100 uppercase tracking-wide">Spesies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                <Filter className="w-4 h-4" />
                Filter:
              </div>
              
              <div className="relative">
                <select 
                  value={selectedPark}
                  onChange={(e) => setSelectedPark(e.target.value)}
                  disabled={parksLoading}
                  className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {parksLoading ? 'Memuat taman...' : 'Semua Taman'}
                  </option>
                  {availableParks.map((park) => (
                    <option key={park.id} value={park.name}>
                      {park.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {parksLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                  ) : (
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <select 
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 hover:border-slate-400"
                >
                  <option value="">Semua Waktu</option>
                  <option value="hari-ini">Hari Ini</option>
                  <option value="minggu-ini">Minggu Ini</option>
                  <option value="bulan-ini">Bulan Ini</option>
                  <option value="tahun-ini">Tahun Ini</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Sort and View Options */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 hover:border-slate-400"
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                  <option value="populer">Populer</option>
                  <option value="a-z">A-Z</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-slate-100 text-slate-800' 
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-slate-100 text-slate-800' 
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-16">
            <h2 className="text-4xl font-light text-slate-900 mb-4">Semua Kegiatan</h2>
            <p className="text-slate-600 mb-8 text-lg">Koleksi kegiatan konservasi dan edukasi</p>
            
            {/* Results Count and Filter Reset */}
            <div className="flex items-center justify-between">
              {filteredActivities.length > 0 && (
                <div className="text-sm text-slate-500">
                  {filteredActivities.length} dari {totalItems} kegiatan ditemukan
                </div>
              )}
              
              {(selectedPark || selectedTime || sortBy !== 'terbaru') && (
                <button
                  onClick={() => {
                    setSelectedPark('');
                    setSelectedTime('');
                    setSortBy('terbaru');
                  }}
                  className="text-sm text-slate-600 hover:text-slate-800 underline transition-colors duration-200"
                >
                  Reset Filter
                </button>
              )}
            </div>
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
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredActivities.map((activity) => (
                  <Link key={activity.id} href={`/kegiatan/${activity.id}`} className="group block">
                    <div className={`bg-white border border-gray-200 hover:border-gray-900 transition-colors duration-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}>
                      {/* Image */}
                      <div className={`relative overflow-hidden bg-gray-100 ${
                        viewMode === 'list' 
                          ? 'w-64 h-48 flex-shrink-0' 
                          : 'h-64 w-full'
                      }`}>
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
                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <h3 className={`font-light text-gray-900 mb-3 group-hover:text-gray-600 transition-colors ${
                          viewMode === 'list' ? 'text-xl line-clamp-1' : 'text-lg line-clamp-2'
                        }`}>
                          {activity.title}
                        </h3>
                        
                        <p className="text-sm text-gray-500 mb-2">
                          {activity.park_name || 'Taman Konservasi'}
                        </p>
                        
                        <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${
                          viewMode === 'list' ? 'line-clamp-3' : 'line-clamp-2'
                        }`}>
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

