"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter, MapPin, Calendar, TreePine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TamanSearchBarProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onFilterToggle: () => void;
  totalResults: number;
  isMobile?: boolean;
}

const QUICK_FILTERS = [
  { key: "status", value: "published", label: "Aktif", icon: Calendar },
  { key: "status", value: "draft", label: "Draft", icon: Calendar },
];

const SEARCH_SUGGESTIONS = [
  "Taman Nasional",
  "Konservasi",
  "Biodiversitas",
  "Ekosistem",
  "Flora Endemik",
  "Fauna Langka",
];

export function TamanSearchBar({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onFilterToggle,
  totalResults,
  isMobile = false,
}: TamanSearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion);
    onSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const handleQuickFilter = (key: string, value: string) => {
    if (key === "status") {
      onStatusChange(statusFilter === value ? "" : value);
    }
  };

  const activeFiltersCount = [statusFilter].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari taman, lokasi, atau jenis konservasi..."
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(localQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-12 pr-20 h-12 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
            />
            {localQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setLocalQuery("");
                  onSearchChange("");
                }}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4"
            size="sm"
          >
            Cari
          </Button>
        </form>

        {/* Search Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Saran pencarian:
              </div>
              {SEARCH_SUGGESTIONS.filter((suggestion) =>
                suggestion.toLowerCase().includes(localQuery.toLowerCase()),
              ).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter, index) => {
          const isActive =
            filter.key === "status" && statusFilter === filter.value;

          return (
            <Button
              key={index}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter(filter.key, filter.value)}
              className={`
                flex items-center gap-2 transition-all duration-200
                ${
                  isActive
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "hover:bg-emerald-50 hover:border-emerald-200"
                }
              `}
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Aktif</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Diarsipkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Toggle & Results */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalResults}</span> taman ditemukan
          </div>

          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filter
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onFilterToggle}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {isMobile ? "Filter" : "Filter Lanjutan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
