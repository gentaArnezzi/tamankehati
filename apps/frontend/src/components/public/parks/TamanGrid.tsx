'use client';

import { useState } from 'react';
import { Grid, List, Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import { TamanCard } from './TamanCard';
import { Skeleton } from '../../ui/skeleton';
import type { TamanPublic } from '../../../types/public';

interface TamanGridProps {
  tamanList: TamanPublic[];
  isLoading?: boolean;
  total?: number;
  onFilterToggle?: () => void;
}

export function TamanGrid({ tamanList, isLoading = false, total = 0, onFilterToggle }: TamanGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            Taman Kehati
          </h2>
          <p className="text-gray-600">
            {total} taman ditemukan
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterToggle}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {tamanList.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada taman ditemukan
          </h3>
          <p className="text-gray-500">
            Coba ubah filter pencarian Anda
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {tamanList.map((taman) => (
            <TamanCard key={taman.id} taman={taman} />
          ))}
        </div>
      )}
    </div>
  );
}
