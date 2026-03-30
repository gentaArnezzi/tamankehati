"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://103.125.91.16";

/**
 * React Query hooks for data fetching
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
 * Fetch news list with filters
 */
const fetchNewsList = async (params: Record<string, any>): Promise<NewsListResponse> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const token = localStorage.getItem("auth_token");
  const response = await fetch(
    `${API_BASE_URL}/api/v1/news/?${searchParams.toString()}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch dashboard comprehensive data
 */
const fetchDashboardComprehensive = async (
  timeRange: string
): Promise<DashboardData> => {
  const token = localStorage.getItem("auth_token");
  
  if (!token) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/dashboard/comprehensive-simple?time_range=${timeRange}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
  }

  return response.json();
};

/**
 * React Query hook for news list
 */
export function useNewsList(
  params: Record<string, any> = {},
  options?: Omit<UseQueryOptions<NewsListResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["news", params],
    queryFn: () => fetchNewsList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * React Query hook for dashboard comprehensive data
 */
export function useDashboardComprehensive(
  timeRange: string = "yearly",
  options?: Omit<UseQueryOptions<DashboardData, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["dashboard", "comprehensive", timeRange],
    queryFn: () => fetchDashboardComprehensive(timeRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

