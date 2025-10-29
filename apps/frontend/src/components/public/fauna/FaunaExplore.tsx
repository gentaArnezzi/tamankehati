'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { fetchFaunaPage } from '../../../lib/api/public-client';
import { type FaunaPaginated } from '../../../types/fauna';
import { EntityCard } from '../cards/EntityCard';
import { FacetFilters } from '../filters/FacetFilters';
import { Pagination } from '../../ui/pagination';

const ITEMS_PER_PAGE = 12;
const FAMILI_OPTIONS = ['Felidae', 'Cervidae', 'Psittacidae', 'Varanidae', 'Testudinidae'];
const STATUS_IUCN_OPTIONS = ['CR', 'EN', 'VU', 'NT', 'LC'];
const PROVINSI_OPTIONS = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bengkulu',
  'Lampung',
  'Kepulauan Bangka Belitung',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Banten',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Selatan',
  'Papua Barat Daya',
];

type FaunaExploreProps = {
  initialData: FaunaPaginated;
  initialParams: URLSearchParams;
};

export function FaunaExplore({ initialData, initialParams }: FaunaExploreProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Ensure initialParams is a proper URLSearchParams object
  const params = useMemo(() => {
    if (initialParams instanceof URLSearchParams) {
      return initialParams;
    }
    return new URLSearchParams();
  }, [initialParams]);

  const paramObj = useMemo(() => {
    const entries: Record<string, string> = {};
    searchParams?.forEach?.((value, key) => {
      entries[key] = value;
    });
    return entries;
  }, [searchParams]);

  // Get current page from params
  const currentPage = Number(paramObj.page || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data, status } = useQuery({
    queryKey: ['fauna', paramObj],
    queryFn: () =>
      fetchFaunaPage({
        ...paramObj,
        offset,
        limit: ITEMS_PER_PAGE,
      }),
    initialData,
    refetchOnWindowFocus: false,
  });

  const items = data?.items ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        {/* Filters Section */}
        <div className="mb-12">
          <FacetFilters
            defaultValues={{
              search: params.get('search') ?? '',
              famili: params.get('famili') ?? '',
              status_iucn: params.get('status_iucn') ?? '',
              wilayah: params.get('provinsi') ?? params.get('wilayah') ?? '',
            }}
            options={{
              famili: FAMILI_OPTIONS,
              status_iucn: STATUS_IUCN_OPTIONS,
              wilayah: PROVINSI_OPTIONS,
            }}
            targetPath="/fauna"
            title="Filter Fauna"
            fieldLabels={{
              famili: 'Famili / Ordo',
              search: 'Kata kunci',
              status_iucn: 'Status IUCN',
              wilayah: 'Provinsi (Lokasi Taman)',
            }}
          />
        </div>

        {/* Results Section */}
        <div>
          {/* Header with View Controls */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-light text-slate-900 mb-3">
                Hasil Pencarian
              </h2>
              <p className="text-slate-600 text-lg">
                {data?.total ?? 0} spesies fauna ditemukan
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Card
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Row
              </button>
            </div>
          </div>

          {/* Error State */}
          {status === 'error' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-red-600 font-medium mb-2">Terjadi Kesalahan</div>
              <p className="text-red-500">Gagal memuat data fauna. Silakan coba lagi nanti.</p>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && status !== 'error' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
              <div className="text-slate-600 font-medium mb-2">Tidak Ada Data</div>
              <p className="text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          )}

          {/* Results Grid/List */}
          {items.length > 0 && (
            <div className={
              viewMode === 'grid' 
                ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'space-y-6'
            }>
              {items.map((fauna, index) => (
                <div key={fauna.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <EntityCard
                    href={`/fauna/${fauna.id}`}
                    title={fauna.nama_ilmiah}
                    subtitle={fauna.nama_umum}
                    image={fauna.gambar_utama}
                    status={fauna.status_iucn}
                    tags={[fauna.famili, fauna.wilayah].filter(Boolean) as string[]}
                    variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {items.length > 0 && (
            <div className="mt-16">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data?.total ?? 0}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
