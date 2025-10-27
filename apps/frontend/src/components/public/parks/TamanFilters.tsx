'use client';

import { useState } from 'react';
import { X, MapPin, Filter, Calendar, TreePine, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TamanFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  statusFilter: string;
  areaFilter: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onAreaChange: (area: string) => void;
  onClearFilters: () => void;
  totalResults: number;
}

// Region options removed - using user-based access control

const STATUS_OPTIONS = [
  { value: 'published', label: 'Aktif', color: 'bg-green-100 text-green-800' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'archived', label: 'Diarsipkan', color: 'bg-red-100 text-red-800' },
];

const AREA_OPTIONS = [
  { value: 'small', label: 'Kecil (< 10 ha)' },
  { value: 'medium', label: 'Sedang (10-50 ha)' },
  { value: 'large', label: 'Besar (> 50 ha)' },
];

export function TamanFilters({
  isOpen,
  onClose,
  searchQuery,
  statusFilter,
  areaFilter,
  onSearchChange,
  onStatusChange,
  onAreaChange,
  onClearFilters,
  totalResults
}: TamanFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchQuery);
  };

  const activeFiltersCount = [statusFilter, areaFilter].filter(Boolean).length;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Filter Sidebar - Only show when isOpen is true */}
      {isOpen && (
        <div className={`
          fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-30 transform transition-transform duration-300 ease-in-out
          lg:relative lg:transform-none lg:shadow-none lg:z-auto lg:max-w-none lg:w-80
          translate-x-0
        `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Filter className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filter Taman</h2>
                <p className="text-sm text-gray-500">{totalResults} taman ditemukan</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-emerald-600" />
                  Pencarian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <Input
                    placeholder="Cari nama taman, lokasi..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit" className="w-full" size="sm">
                    Cari
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Region Filter removed - using user-based access control */}

            {/* Status Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onStatusChange(option.value)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${statusFilter === option.value 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Area Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-emerald-600" />
                  Ukuran Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={areaFilter} onValueChange={onAreaChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Ukuran" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} filter aktif
                </Badge>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex-1"
                size="sm"
              >
                Reset Filter
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 lg:hidden"
                size="sm"
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
