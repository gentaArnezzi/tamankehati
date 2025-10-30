"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { SearchResultCard } from "@/components/public/search/SearchResultCard";
import { SearchFilters } from "@/components/public/search/SearchFilters";
import { SearchSuggestions } from "@/components/public/search/SearchSuggestions";

interface SearchResult {
  id: string;
  type: "flora" | "fauna" | "taman" | "artikel" | "galeri";
  title: string;
  description: string;
  score: number;
  url: string;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    sort: "relevance",
  });

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}`,
      );
      if (!response.ok) {
        throw new Error("Gagal melakukan pencarian");
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(
        {},
        "",
        `/search?q=${encodeURIComponent(searchQuery)}`,
      );
      performSearch(searchQuery);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Apply filters to current results
    // This is a simplified implementation - in a real app you'd want to re-fetch with filters
  };

  const filteredResults = searchResults.filter((result) => {
    if (filters.type === "all") return true;
    return result.type === filters.type;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (filters.sort === "relevance") {
      return b.score - a.score;
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hasil Pencarian
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Cari spesies, taman, atau artikel..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (
              <SearchSuggestions
                query={searchQuery}
                onSelect={(suggestion) => {
                  setSearchQuery(suggestion);
                  setShowSuggestions(false);
                  window.history.pushState(
                    {},
                    "",
                    `/search?q=${encodeURIComponent(suggestion)}`,
                  );
                  performSearch(suggestion);
                }}
              />
            )}
          </form>
        </div>

        {/* Search Filters */}
        <SearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          totalResults={searchResults.length}
        />

        {/* Search Results */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Mencari data...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Terjadi kesalahan</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : sortedResults.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="text-gray-600">
                Tidak ada hasil pencarian untuk
                <span className="font-semibold"> "{searchQuery}"</span>.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Coba kata kunci lain atau periksa ejaan Anda.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedResults.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
