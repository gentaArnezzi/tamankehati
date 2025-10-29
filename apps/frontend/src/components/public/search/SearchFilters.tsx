'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchFiltersProps {
  filters: {
    type: string;
    sort: string;
  };
  onFilterChange: (filters: { type: string; sort: string }) => void;
  totalResults: number;
}

const typeOptions = [
  { value: 'all', label: 'Semua', count: 0 },
  { value: 'flora', label: 'Flora', count: 0 },
  { value: 'fauna', label: 'Fauna', count: 0 },
  { value: 'taman', label: 'Taman', count: 0 },
  { value: 'artikel', label: 'Artikel', count: 0 },
  { value: 'galeri', label: 'Galeri', count: 0 },
];

const sortOptions = [
  { value: 'relevance', label: 'Relevansi' },
  { value: 'title', label: 'Judul A-Z' },
  { value: 'newest', label: 'Terbaru' },
];

export function SearchFilters({ filters, onFilterChange, totalResults }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type });
  };

  const handleSortChange = (sort: string) => {
    onFilterChange({ ...filters, sort });
  };

  const clearFilters = () => {
    onFilterChange({ type: 'all', sort: 'relevance' });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.sort !== 'relevance';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filter & Urutkan</h3>
          <span className="text-sm text-gray-500">({totalResults} hasil)</span>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            {showFilters ? 'Sembunyikan' : 'Filter'}
          </Button>
        </div>
      </div>

      <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Konten
          </label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTypeChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.type === option.value
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({option.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urutkan Berdasarkan
          </label>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.sort === option.value
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
