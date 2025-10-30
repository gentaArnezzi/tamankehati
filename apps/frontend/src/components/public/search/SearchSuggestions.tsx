"use client";

import { useState, useEffect } from "react";
import { Search, Clock, TrendingUp } from "lucide-react";

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
}

interface Suggestion {
  text: string;
  type: "recent" | "trending" | "suggestion";
  count?: number;
}

const trendingSuggestions = [
  "Rafflesia arnoldii",
  "Orangutan Kalimantan",
  "Taman Nasional Komodo",
  "Biodiversitas Indonesia",
  "Konservasi Flora",
  "Fauna Endemik",
  "Taman Kehati",
  "Ekosistem Hutan",
];

const popularCategories = [
  "Flora Endemik",
  "Fauna Langka",
  "Taman Nasional",
  "Artikel Konservasi",
  "Galeri Kehati",
];

export function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = localStorage.getItem("recentSearches");
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const generateSuggestions = (): Suggestion[] => {
      const allSuggestions: Suggestion[] = [];

      // Add recent searches that match the query
      recentSearches
        .filter(
          (search) =>
            search.toLowerCase().includes(query.toLowerCase()) &&
            search.toLowerCase() !== query.toLowerCase(),
        )
        .slice(0, 3)
        .forEach((search) => {
          allSuggestions.push({
            text: search,
            type: "recent",
          });
        });

      // Add trending suggestions that match the query
      trendingSuggestions
        .filter(
          (suggestion) =>
            suggestion.toLowerCase().includes(query.toLowerCase()) &&
            !allSuggestions.some((s) => s.text === suggestion),
        )
        .slice(0, 3)
        .forEach((suggestion) => {
          allSuggestions.push({
            text: suggestion,
            type: "trending",
          });
        });

      // Add category suggestions
      popularCategories
        .filter(
          (category) =>
            category.toLowerCase().includes(query.toLowerCase()) &&
            !allSuggestions.some((s) => s.text === category),
        )
        .slice(0, 2)
        .forEach((category) => {
          allSuggestions.push({
            text: category,
            type: "suggestion",
          });
        });

      return allSuggestions.slice(0, 8);
    };

    setSuggestions(generateSuggestions());
  }, [query, recentSearches]);

  const handleSelect = (suggestion: string) => {
    // Add to recent searches
    const updatedRecent = [
      suggestion,
      ...recentSearches.filter((s) => s !== suggestion),
    ].slice(0, 10);

    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

    onSelect(suggestion);
  };

  const getIcon = (type: Suggestion["type"]) => {
    switch (type) {
      case "recent":
        return <Clock className="w-4 h-4 text-gray-400" />;
      case "trending":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "suggestion":
        return <Search className="w-4 h-4 text-blue-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLabel = (type: Suggestion["type"]) => {
    switch (type) {
      case "recent":
        return "Pencarian Terbaru";
      case "trending":
        return "Trending";
      case "suggestion":
        return "Kategori Populer";
      default:
        return "";
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
      <div className="p-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${index}`}
            onClick={() => handleSelect(suggestion.text)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
          >
            {getIcon(suggestion.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-600">
                {suggestion.text}
              </div>
              <div className="text-xs text-gray-500">
                {getLabel(suggestion.type)}
              </div>
            </div>
            {suggestion.count && (
              <div className="text-xs text-gray-400">{suggestion.count}</div>
            )}
          </button>
        ))}
      </div>

      {/* Footer with search tips */}
      <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-xl">
        <div className="text-xs text-gray-500 text-center">
          Tekan{" "}
          <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd>{" "}
          untuk mencari
        </div>
      </div>
    </div>
  );
}
