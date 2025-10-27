'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { fetchGalleryPage } from '../../../lib/api/public-client';
import { type GalleryPaginated } from '../../../types/gallery';
import { MasonryGrid } from './MasonryGrid';
import { FacetFilters } from '../filters/FacetFilters';
import { Button } from '../../ui/button';

const JENIS_OPTIONS = ['Flora', 'Fauna', 'Taman', 'Konservasi', 'Lingkungan'];
const WILAYAH_OPTIONS = [
  'Jakarta',
  'Jawa Barat', 
  'Jawa Tengah',
  'Jawa Timur',
  'Bali',
  'Sumatra',
  'Kalimantan',
  'Sulawesi',
  'Papua'
];

type GalleryExploreProps = {
  initialData: GalleryPaginated;
  initialParams: URLSearchParams;
};

export function GalleryExplore({ initialData, initialParams }: GalleryExploreProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');

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
    queryKey: ['gallery', paramObj],
    queryFn: ({ pageParam }) =>
      fetchGalleryPage({
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
        {/* Filters Section */}
        <div className="mb-12">
          <FacetFilters
            defaultValues={{
              search: params.get('search') ?? '',
              famili: params.get('famili') ?? '',
              wilayah: params.get('wilayah') ?? '',
            }}
            options={{
              famili: JENIS_OPTIONS,
              status_iucn: [],
              wilayah: WILAYAH_OPTIONS,
            }}
            targetPath="/galeri"
            title="Filter Galeri"
            fieldLabels={{
              famili: 'Jenis Media',
              search: 'Kata kunci',
              wilayah: 'Wilayah',
            }}
          />
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
                {allItems.length} foto ditemukan
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('masonry')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'masonry'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Masonry
              </button>
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
            </div>
          </div>

          {/* Error State */}
          {status === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-red-600 font-medium mb-2">Terjadi Kesalahan</div>
              <p className="text-red-500">Gagal memuat data galeri. Silakan coba lagi nanti.</p>
            </div>
          )}

          {/* Empty State */}
          {allItems.length === 0 && status !== 'error' && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
              <div className="text-gray-600 font-medium mb-2">Tidak Ada Data</div>
              <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          )}

          {/* Results Grid/Masonry */}
          {allItems.length > 0 && (
            <div>
              {viewMode === 'masonry' ? (
                <MasonryGrid items={allItems} />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {allItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={item.thumbnail || item.url || '/hero/forest.webp'}
                          alt={item.judul}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.judul}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          {item.wilayah && <span>{item.wilayah}</span>}
                          {item.jenis && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                              {item.jenis}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
