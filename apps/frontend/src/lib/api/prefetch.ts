"use client";

import type { QueryClient } from "@tanstack/react-query";
import {
  fetchFloraPage,
  fetchFaunaPage,
  fetchTamanDetail,
  fetchTamanPage,
  fetchGalleryPage,
  fetchArtikelPage,
} from "./public-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://tamankehati-backend-pxnu.onrender.com";

// Helper to fetch detail data
const fetchDetail = async <T>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Prefetch utility functions for React Query
 * Prefetch data sebelum user navigate untuk instant loading
 */
export const prefetch = {
  /**
   * Prefetch flora detail atau list
   */
  floraDetail: (queryClient: QueryClient, id: string) => {
    return queryClient.prefetchQuery({
      queryKey: ["flora", id],
      queryFn: () => fetchDetail(`/api/public/flora/${id}`),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  floraList: (queryClient: QueryClient, params?: Record<string, any>) => {
    const queryParams = {
      offset: 0,
      limit: 12,
      ...params,
    };
    return queryClient.prefetchQuery({
      queryKey: ["flora", queryParams],
      queryFn: () => fetchFloraPage(queryParams),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Prefetch fauna detail atau list
   */
  faunaDetail: (queryClient: QueryClient, id: string) => {
    return queryClient.prefetchQuery({
      queryKey: ["fauna", id],
      queryFn: () => fetchDetail(`/api/public/fauna/${id}`),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  faunaList: (queryClient: QueryClient, params?: Record<string, any>) => {
    const queryParams = {
      offset: 0,
      limit: 12,
      ...params,
    };
    return queryClient.prefetchQuery({
      queryKey: ["fauna", queryParams],
      queryFn: () => fetchFaunaPage(queryParams),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Prefetch gallery detail atau list
   */
  galleryDetail: (queryClient: QueryClient, id: string) => {
    return queryClient.prefetchQuery({
      queryKey: ["gallery", id],
      queryFn: async () => {
        // Gallery detail mungkin perlu fetch dari endpoint yang berbeda
        // Untuk sekarang, kita skip detail karena mungkin tidak ada endpoint spesifik
        return null;
      },
      staleTime: 5 * 60 * 1000,
    });
  },

  galleryList: (queryClient: QueryClient, params?: Record<string, any>) => {
    const queryParams = {
      offset: 0,
      limit: 12,
      ...params,
    };
    return queryClient.prefetchInfiniteQuery({
      queryKey: ["gallery", queryParams],
      queryFn: ({ pageParam }) =>
        fetchGalleryPage({
          ...queryParams,
          offset: pageParam?.offset ?? 0,
        }),
      initialPageParam: { offset: 0 },
      staleTime: 5 * 60 * 1000,
    });
  },

  /**
   * Prefetch article detail atau list
   */
  articleDetail: (queryClient: QueryClient, id: string) => {
    return queryClient.prefetchQuery({
      queryKey: ["article", id],
      queryFn: () => fetchDetail(`/api/public/artikel/${id}`),
      staleTime: 5 * 60 * 1000,
    });
  },

  articlesList: (queryClient: QueryClient, params?: Record<string, any>) => {
    const queryParams = {
      offset: 0,
      limit: 12,
      ...params,
    };
    return queryClient.prefetchInfiniteQuery({
      queryKey: ["artikel", queryParams],
      queryFn: ({ pageParam }) =>
        fetchArtikelPage({
          ...queryParams,
          offset: pageParam?.offset ?? 0,
        }),
      initialPageParam: { offset: 0 },
      staleTime: 5 * 60 * 1000,
    });
  },

  /**
   * Prefetch taman detail atau list
   */
  tamanDetail: (queryClient: QueryClient, id: string) => {
    return queryClient.prefetchQuery({
      queryKey: ["taman", id],
      queryFn: () => fetchTamanDetail(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  tamanList: (queryClient: QueryClient, params?: Record<string, any>) => {
    const queryParams = {
      offset: 0,
      limit: 12,
      ...params,
    };
    return queryClient.prefetchQuery({
      queryKey: ["taman", queryParams],
      queryFn: () => fetchTamanPage(queryParams),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Prefetch news detail atau list
   */
  newsDetail: (queryClient: QueryClient, id: string) => {
    return queryClient.prefetchQuery({
      queryKey: ["news", id],
      queryFn: () => fetchDetail(`/api/public/news/${id}`),
      staleTime: 5 * 60 * 1000,
    });
  },

  newsList: (queryClient: QueryClient, params?: Record<string, any>) => {
    const queryParams = {
      offset: 0,
      limit: 12,
      ...params,
    };
    return queryClient.prefetchQuery({
      queryKey: ["news", queryParams],
      queryFn: () => fetchArtikelPage(queryParams), // News uses same endpoint as articles
      staleTime: 5 * 60 * 1000,
    });
  },

  /**
   * Prefetch dashboard data
   */
  dashboard: (queryClient: QueryClient, timeRange: string = "yearly") => {
    return queryClient.prefetchQuery({
      queryKey: ["dashboard", timeRange],
      queryFn: async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/dashboard?time_range=${timeRange}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            }
          );
          if (!response.ok) return null;
          return await response.json();
        } catch {
          return null;
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes (dashboard data changes more frequently)
    });
  },
};

