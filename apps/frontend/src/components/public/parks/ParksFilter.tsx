'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useQuery } from '@tanstack/react-query';
import { getParkPage } from '../../../lib/api/public';

export function ParksFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get unique regions from the first page of parks
  const { data: regionsData } = useQuery({
    queryKey: ['park-regions'],
    queryFn: () => getParkPage({ limit: 100 }),
    select: (data) => {
      const regions = new Set<string>();
      data.items.forEach((park) => {
        if (park.region_name) {
          regions.add(park.region_name);
        }
      });
      return Array.from(regions).sort();
    },
  });

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('search', term);
      params.delete('page'); // Reset to first page
    } else {
      params.delete('search');
    }
    router.push(`/parks?${params.toString()}`);
  }, 300);

  const handleRegionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('region', value);
      params.delete('page'); // Reset to first page
    } else {
      params.delete('region');
    }
    router.push(`/parks?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="search">Cari Taman</Label>
        <Input
          id="search"
          placeholder="Cari berdasarkan nama atau deskripsi..."
          defaultValue={searchParams.get('search')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="region">Filter Berdasarkan Wilayah</Label>
        <Select
          onValueChange={handleRegionChange}
          defaultValue={searchParams.get('region')?.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Wilayah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Wilayah</SelectItem>
            {regionsData?.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
