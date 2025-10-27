'use client';

import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { getParkPage } from '../../../lib/api/public';
import { ParkCard } from './ParkCard';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';

interface ParksGridProps {
  initialData: any; // Replace with proper type
}

export function ParksGrid({ initialData }: ParksGridProps) {
  const searchParams = useSearchParams();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
  } = useInfiniteQuery({
    queryKey: ['parks', searchParams.toString()],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('offset', String(pageParam));
      return getParkPage(Object.fromEntries(params.entries()));
    },
    initialPageParam: 0,
    initialData: { pages: [initialData], pageParams: [0] },
    getNextPageParam: (lastPage) => {
      const { offset, limit, total } = lastPage;
      return offset + limit < total ? offset + limit : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Gagal memuat data taman. Silakan coba lagi.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Muat Ulang
        </Button>
      </div>
    );
  }

  const parks = data?.pages.flatMap((page) => page.items) || [];

  if (parks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada taman yang ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parks.map((park) => (
          <ParkCard key={park.id} park={park} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          ref={ref}
          variant="outline"
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="w-48"
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memuat...
            </>
          ) : hasNextPage ? (
            'Muat Lebih Banyak'
          ) : (
            'Sudah Sampai Akhir'
          )}
        </Button>
      </div>
    </div>
  );
}
