'use client';

import { useMemo, useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { fetchTamanPage } from '../../../lib/api/public-client';
import { getAvailableRegions } from '../../../lib/api/client';
import { type TamanPaginated } from '../../../types/taman';
import { EntityCard } from '../cards/EntityCard';
import { TamanFilters } from './TamanFilters';
import { Button } from '../../ui/button';

// Region options will be loaded dynamically from API

type TamanExploreProps = {
  initialData: TamanPaginated;
  initialParams: URLSearchParams;
};

export function TamanExplore({ initialData, initialParams }: TamanExploreProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [availableRegions, setAvailableRegions] = useState<{ id: number; name: string; code: string }[]>([]);

  // Load available regions
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regions = await getAvailableRegions();
        setAvailableRegions(regions);
      } catch (error) {
        console.error('Failed to load regions:', error);
        setAvailableRegions([]);
      }
    };

    loadRegions();
  }, []);

  // Ensure initialParams is a proper URLSearchParams object
  const params = useMemo(() => {
    if (initialParams instanceof URLSearchParams) {
      return initialParams;
    }
    // If it's not a URLSearchParams, create one from the current search params or empty
    return new URLSearchParams();
  }, [initialParams]);

  const paramObj = useMemo(() => {
    const entries: Record<string, string> = {};
    searchParams?.forEach?.((value, key) => {
      entries[key] = value;
    });
    return entries;
  }, [searchParams]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['taman', paramObj],
    queryFn: ({ pageParam }) =>
      fetchTamanPage({
        ...paramObj,
        offset: pageParam?.offset ?? 0,
        limit: 12,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.items.length, 0);
      if (totalFetched < lastPage.total) {
        return { offset: totalFetched };
      }
      return undefined;
    },
    initialPageParam: { offset: Number(params.get('offset') ?? 0) },
    initialData: {
      pages: [initialData],
      pageParams: [{ offset: Number(params.get('offset') ?? 0) }],
    },
    refetchOnWindowFocus: false,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-7xl px-6 py-20">
        {/* Modern Filters Section */}
        <div className="mb-12">
          <TamanFilters isOpen={false} onClose={() => {}} searchQuery={''} statusFilter={''} areaFilter={''} onSearchChange={() => {}} onStatusChange={() => {}} onAreaChange={() => {}} onClearFilters={() => {}} totalResults={0} />
        </div>

        {/* Results Section */}
        <div>
          {/* Header with View Controls */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                Hasil Pencarian
              </h2>
              <p className="text-gray-600">
                {allItems.length} taman ditemukan
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Error State */}
          {status === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-red-600 font-medium mb-2">Terjadi Kesalahan</div>
              <p className="text-red-500">Gagal memuat data taman. Silakan coba lagi nanti.</p>
            </div>
          )}

          {/* Empty State */}
          {allItems.length === 0 && status !== 'error' && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
              <div className="text-gray-600 font-medium mb-2">Tidak Ada Data</div>
              <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          )}

          {/* Results Grid/List */}
          {allItems.length > 0 && (
            <div className={
              viewMode === 'grid' 
                ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' 
                : 'space-y-4'
            }>
              {allItems.map((taman) => {
                // Region-based addressing removed - using user-based access control
                const regionName = 'Indonesia';
                
                return (
                  <EntityCard
                    key={taman.id}
                    href={`/taman/${taman.id}`}
                    title={taman.name}
                    subtitle={taman.description || undefined}
                    image={null} // Parks don't have images in current schema
                    region={regionName}
                    area={taman.area_ha || undefined}
                    created_at={taman.created_at}
                    tags={[]} // No tags for now
                    variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                  />
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-12 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors"
              >
                {isFetchingNextPage ? 'Memuat...' : 'Muat Lebih Banyak'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}