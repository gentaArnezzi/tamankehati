"use client";

import type { QueryClient } from "@tanstack/react-query";

/**
 * Query helper functions for placeholder data and cache management
 */


interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  featured: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  tags?: string[];
  image_url?: string;
  views?: number;
}

interface NewsListResponse {
  items: NewsItem[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

interface DashboardData {
  user_role: string;
  user_id: number;
  park_id?: number;
  time_range: string;
  chart_type: string;
  date_range: {
    start: string;
    end: string;
  };
  analytics: {
    biodiversity: any;
    conservation: any;
    activities: any;
    content: any;
    users: any;
    geographic: any;
    temporal: any;
    performance: any;
  };
  generated_at: string;
}

/**
 * Get placeholder data for news list from cache
 * Returns cached data if available, undefined otherwise
 */
export function getNewsListPlaceholder(
  queryClient: QueryClient,
  params: Record<string, any>
): NewsListResponse | undefined {
  try {
    const cached = queryClient.getQueryData<NewsListResponse>(["news", params]);
    return cached;
  } catch {
    return undefined;
  }
}

/**
 * Get placeholder data for dashboard from cache
 * Returns cached data if available, undefined otherwise
 */
export function getDashboardPlaceholder(
  queryClient: QueryClient,
  timeRange: string = "yearly"
): DashboardData | undefined {
  try {
    const cached = queryClient.getQueryData<DashboardData>([
      "dashboard",
      "comprehensive",
      timeRange,
    ]);
    return cached;
  } catch {
    return undefined;
  }
}

/**
 * Get any cached query data by key
 */
export function getCachedData<T>(
  queryClient: QueryClient,
  queryKey: unknown[]
): T | undefined {
  try {
    return queryClient.getQueryData<T>(queryKey);
  } catch {
    return undefined;
  }
}

/**
 * Set query data in cache
 */
export function setCachedData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  data: T
): void {
  queryClient.setQueryData(queryKey, data);
}

/**
 * Invalidate query cache
 */
export function invalidateCache(
  queryClient: QueryClient,
  queryKey: unknown[]
): void {
  queryClient.invalidateQueries({ queryKey });
}

