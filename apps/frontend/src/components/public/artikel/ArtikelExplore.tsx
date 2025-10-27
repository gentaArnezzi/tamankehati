'use client';

import { useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchArtikelPage } from '../../../lib/api/public-client';
import { type ArtikelPaginated } from '../../../types/articles';
import { trackEvent } from '../../../lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import Link from 'next/link';

const CATEGORIES = ['Artikel Edukasi', 'Berita Konservasi', 'Riset', 'Opini'];

type ArtikelExploreProps = {
  initialData: ArtikelPaginated;
  initialParams: URLSearchParams;
};

export function ArtikelExplore({ initialData, initialParams }: ArtikelExploreProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['artikel', paramObj],
    queryFn: ({ pageParam }) =>
      fetchArtikelPage({
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

  const allArticles = data?.pages.flatMap((page) => page.items) ?? [];

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = (formData.get('search') as string) ?? '';
    const kategori = (formData.get('kategori') as string) ?? '';
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (kategori && kategori !== '__all__') query.set('kategori', kategori);
    trackEvent({
      event: 'public_articles_search',
      payload: {
        search,
        kategori: kategori === '__all__' ? '' : kategori,
      },
    });
    router.push(query.toString() ? `/artikel?${query.toString()}` : '/artikel');
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-7xl px-6 py-20">
        {/* Filters Section */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
        <div>
          <label htmlFor="search" className="text-sm font-medium text-slate-700">
            Kata kunci
          </label>
          <Input
            id="search"
            name="search"
            value={params.get('search') ?? ''}
            onChange={(e) => {
              const query = new URLSearchParams();
              const kategori = params.get('kategori');
              if (e.target.value) query.set('search', e.target.value);
              if (kategori) query.set('kategori', kategori);
              query.set('offset', '0'); // Reset offset when searching

              // Clear previous debounce
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }

              // Set new debounce
              debounceRef.current = setTimeout(() => {
                router.push(query.toString() ? `/artikel?${query.toString()}` : '/artikel');
              }, 300);
            }}
            placeholder="Cari judul atau topik"
            className="mt-2"
          />
        </div>
        <div>
          <label htmlFor="kategori" className="text-sm font-medium text-slate-700">
            Kategori
          </label>
          <Select name="kategori" value={params.get('kategori') ?? '__all__'} onValueChange={(value) => {
            const query = new URLSearchParams();
            const search = params.get('search');
            if (search) query.set('search', search);
            if (value && value !== '__all__') query.set('kategori', value);
            query.set('offset', '0'); // Reset offset when changing category
            router.push(query.toString() ? `/artikel?${query.toString()}` : '/artikel');
          }}>
            <SelectTrigger id="kategori" className="mt-2">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Semua kategori</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500">
            Terapkan
          </Button>
        </div>
      </form>
        </div>

        {/* Results Section */}
        <div>
          {/* Header with Results Count */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                Hasil Pencarian
              </h2>
              <p className="text-gray-600">
                {allArticles.length} artikel ditemukan
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isFetchingNextPage && allArticles.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <div className="text-gray-600 font-medium mb-2">Memuat Artikel</div>
              <p className="text-gray-500">Sedang mengambil data artikel...</p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-red-600 font-medium mb-2">Terjadi Kesalahan</div>
              <p className="text-red-500">Gagal memuat data artikel. Silakan coba lagi nanti.</p>
            </div>
          )}

          {/* Empty State */}
          {allArticles.length === 0 && status !== 'error' && !isFetchingNextPage && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
              <div className="text-gray-600 font-medium mb-2">Tidak Ada Artikel</div>
              <p className="text-gray-500">Coba ubah kata kunci atau kategori pencarian.</p>
            </div>
          )}

          {/* Results Grid */}
          {allArticles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {allArticles.map((artikel) => (
            <Card key={artikel.id} className="flex h-full flex-col overflow-hidden border border-emerald-100">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="self-start border-emerald-200 text-emerald-700">
                  {artikel.kategori}
                </Badge>
                <CardTitle className="text-xl text-slate-900">
                  <Link href={`/artikel/${artikel.slug}`} className="hover:text-emerald-600">
                    {artikel.judul}
                  </Link>
                </CardTitle>
                <p className="text-xs text-slate-500">
                  {new Date(artikel.tanggal_publish).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <CardDescription className="flex-1 text-sm leading-relaxed text-slate-600">
                  {artikel.excerpt}
                </CardDescription>
                <Link
                  href={`/artikel/${artikel.slug}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                >
                  Baca selengkapnya
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </CardContent>
            </Card>
          ))}
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
