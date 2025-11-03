import "server-only";

import { cache } from "react";
import { z } from "zod";
import {
  ArtikelPublicSchema,
  FloraPublicSchema,
  FaunaPublicSchema,
  GaleriPublicSchema,
  PaginatedResponseSchema,
  PublicStatsSchema,
  TamanPublicSchema,
  ParkPublicSchema,
  type ArtikelPublic,
  type FloraPublic,
  type FaunaPublic,
  type GaleriPublic,
  type PublicStats,
  type TamanPublic,
  type ParkPublic,
} from "../../types/public";
import {
  ArtikelDetailSchema,
  ArtikelPaginatedSchema,
  type ArtikelDetail,
} from "../../types/articles";
import { FloraDetailSchema, FloraPaginatedSchema } from "../../types/flora";
import { FaunaDetailSchema, FaunaPaginatedSchema } from "../../types/fauna";
import {
  GalleryPaginatedSchema,
  GalleryDetailSchema,
  type GalleryItem,
} from "../../types/gallery";
import {
  ParkDetailSchema,
  ParkPaginatedSchema,
  type ParkDetail,
} from "../../types/parks";
import { TamanDetailSchema, TamanPaginatedSchema } from "../../types/taman";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://tamankehati-backend-pxnu.onrender.com";

type PrimitiveParam = string | number | boolean;
type SearchParams = Record<
  string,
  PrimitiveParam | PrimitiveParam[] | undefined | null
>;

const buildQuery = (params?: SearchParams) => {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === "") return;
        query.append(key, String(item));
      });
    } else if (typeof value === "boolean") {
      query.append(key, value ? "true" : "false");
    } else {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const createFetcher =
  <Schema extends z.ZodTypeAny>(
    schema: Schema,
    options?: { revalidate?: number },
  ) =>
  async (path: string, params?: SearchParams) => {
    const url = `${API_BASE_URL}${path}${buildQuery(params)}`;
    
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log("[SSR] Fetching from:", url);
    }

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: options?.revalidate ?? 300, // Default 5 minutes instead of 1 hour for faster updates
        },
      });

      if (!response.ok) {
        // Handle specific error codes gracefully
        const status = response.status;
        
        // Don't throw for 405 (Method Not Allowed) or 404 - handle gracefully
        if (status === 405 || status === 404) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[SSR] Endpoint not available: ${status} ${response.statusText} for ${path}`,
            );
          }
          // Return a default empty response based on schema
          // This will be handled by the calling function
          throw new Error(`Endpoint not available (${status})`);
        }
        
        // Handle server errors (502, 503, 504) - Bad Gateway, Service Unavailable, Gateway Timeout
        if (status === 502 || status === 503 || status === 504) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[SSR] Backend unavailable: ${status} ${response.statusText} for ${path}`,
            );
          }
          // Try to return empty/default response instead of throwing
          // This allows the page to render with empty data instead of crashing
          throw new Error(`Backend service unavailable (${status})`);
        }
        
        if (process.env.NODE_ENV === "development") {
          console.error(
            `[SSR] Fetch failed: ${status} ${response.statusText} for ${path}`,
          );
        }
        throw new Error(`Gagal memuat data dari ${path} (${status})`);
      }

      const json = await response.json();
      
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[SSR] Data received:",
          JSON.stringify(json).substring(0, 200),
        );
      }
      
      const parsed = schema.parse(json);
      
      if (process.env.NODE_ENV === "development") {
        console.log("[SSR] Schema parsed successfully");
      }
      
      return parsed;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[SSR] Error in createFetcher:", error);
      }
      throw error;
    }
  };

const fetchPaginated = <T extends z.ZodTypeAny>(
  schema: T,
  revalidate?: number,
) => createFetcher(PaginatedResponseSchema(schema), { revalidate });

export const getPublicStats = cache(async (): Promise<PublicStats> => {
  const fetcher = createFetcher(PublicStatsSchema, { revalidate: 600 }); // Cache for 10 minutes
  return fetcher("/api/public/stats/");
});

export const getParkStats = cache(
  async (parkId: number): Promise<PublicStats> => {
    try {
      const fetcher = createFetcher(PublicStatsSchema, { revalidate: 300 });
      // Try the endpoint - if 405 or any error, return fallback
      try {
        return await fetcher(`/api/public/stats/park/${parkId}`);
      } catch (error: any) {
        // If it's a 405 or other error, return fallback stats silently
        if (error?.message?.includes("405") || error?.message?.includes("Method Not Allowed")) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[SSR] Park stats endpoint not available (405) for park ${parkId}, using fallback`);
          }
          return {
            total_flora: 0,
            total_fauna: 0,
            total_taman: 0,
            total_artikel: 0,
          };
        }
        throw error; // Re-throw if it's a different error
      }
    } catch (error: any) {
      // If endpoint doesn't exist or returns error, return fallback stats
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SSR] Park stats endpoint error for park ${parkId}:`, error?.message || error);
      }
      return {
        total_flora: 0,
        total_fauna: 0,
        total_taman: 0,
        total_artikel: 0,
      };
    }
  },
);

export const getAvailableRegions = cache(
  async (): Promise<{ id: number; name: string; code: string }[]> => {
    const fetcher = createFetcher(
      z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          code: z.string(),
        }),
      ),
      { revalidate: 300 },
    );
    const response = (await fetcher("/api/public/stats/regions/")) as any;
    return response.regions || [];
  },
);

export const getLatestArticles = cache(async (limit: number = 6): Promise<ArtikelPublic[]> => {
  try {
    const fetcher = fetchPaginated(ArtikelPublicSchema, 300); // Shorter cache for fresher data
    const data = await fetcher("/api/public/artikel/", { limit, offset: 0 });
    return data.items || [];
  } catch (error: any) {
    // Handle 502/503/504 errors gracefully
    if (
      error?.message?.includes("502") ||
      error?.message?.includes("503") ||
      error?.message?.includes("504") ||
      error?.message?.includes("unavailable")
    ) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SSR] Backend unavailable for latest articles, returning empty array",
        );
      }
      return [];
    }
    throw error;
  }
});

export const getGalleryHighlights = cache(
  async (limit = 8): Promise<GalleryItem[]> => {
    try {
      const fetcher = createFetcher(GalleryPaginatedSchema, { revalidate: 300 }); // Shorter cache
      const data = await fetcher("/api/public/galeri/", { limit, offset: 0 });
      return data.items || [];
    } catch (error: any) {
      // Handle 502/503/504 errors gracefully
      if (
        error?.message?.includes("502") ||
        error?.message?.includes("503") ||
        error?.message?.includes("504") ||
        error?.message?.includes("unavailable")
      ) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[SSR] Backend unavailable for gallery highlights, returning empty array",
          );
        }
        return [];
      }
      throw error;
    }
  },
);

// Main Taman functions
// Optimize cache key with params for better cache hits
export const getTamanList = cache(async (params: SearchParams = {}) => {
  // Map frontend parameters to backend parameters
  const backendParams: SearchParams = {};

  if (params.search) backendParams.search = params.search;
  if (params.region) backendParams.wilayah = params.region; // Map region to wilayah
  if (params.status) backendParams.status = params.status;
  if (params.limit) backendParams.limit = params.limit;
  if (params.offset) backendParams.offset = params.offset;

  const url = `${API_BASE_URL}/api/public/parks${buildQuery(backendParams)}`;
  if (process.env.NODE_ENV === "development") {
    console.log("[SSR] Fetching taman data from:", url);
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 300, // Cache for 5 minutes - much faster than 0
    },
  });

  if (!response.ok) {
    console.error(
      `[SSR] Failed to fetch parks: ${response.status} ${response.statusText}`,
    );
    throw new Error(
      `Gagal memuat data dari /api/public/parks (${response.status})`,
    );
  }

  const data = await response.json();
  if (process.env.NODE_ENV === "development") {
    console.log(
      "[SSR] Parks data received:",
      JSON.stringify(data).substring(0, 200),
    );
  }

  // The backend now returns a proper paginated response with TamanPaginatedSchema format
  return TamanPaginatedSchema.parse(data);
});

// Alias for consistency
export const getTamanPage = getTamanList;

export const getTamanDetail = cache(async (id: string) => {
  const fetcher = createFetcher(TamanDetailSchema, { revalidate: 300 }); // Cache for 5 minutes
  return fetcher(`/api/public/parks/${id}`);
});

// Keep Park functions for backward compatibility
export const getParkList = getTamanList;
export const getParkPage = getTamanPage;
export const getParkDetail = getTamanDetail;

export const getFloraList = cache(async (params: SearchParams = {}) => {
  try {
    const fetcher = createFetcher(FloraPaginatedSchema, { revalidate: 300 }); // Cache for 5 minutes
    return await fetcher("/api/public/flora/", params);
  } catch (error: any) {
    // Handle 502/503/504 errors gracefully - return empty list instead of crashing
    if (
      error?.message?.includes("502") ||
      error?.message?.includes("503") ||
      error?.message?.includes("504") ||
      error?.message?.includes("unavailable")
    ) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SSR] Backend unavailable for flora list, returning empty list",
        );
      }
      // Return empty paginated response
      return FloraPaginatedSchema.parse({
        items: [],
        total: 0,
        limit: params?.limit || 20,
        offset: params?.offset || 0,
        has_next: false,
        has_prev: false,
      });
    }
    throw error;
  }
});

export const getFloraDetail = cache(async (id: string) => {
  try {
    const fetcher = createFetcher(FloraDetailSchema, { revalidate: 300 }); // Cache for 5 minutes
    return await fetcher(`/api/public/flora/${id}`);
  } catch (error: any) {
    // Handle 502/503/504 errors gracefully
    if (
      error?.message?.includes("502") ||
      error?.message?.includes("503") ||
      error?.message?.includes("504") ||
      error?.message?.includes("unavailable")
    ) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SSR] Backend unavailable for flora detail, throwing error for proper 404 handling",
        );
      }
      // Re-throw so Next.js can show proper 404 or error page
      throw error;
    }
    throw error;
  }
});

export const getFaunaList = cache(async (params: SearchParams = {}) => {
  try {
    const fetcher = createFetcher(FaunaPaginatedSchema, { revalidate: 600 });
    return await fetcher("/api/public/fauna/", params);
  } catch (error: any) {
    // Handle 502/503/504 errors gracefully
    if (
      error?.message?.includes("502") ||
      error?.message?.includes("503") ||
      error?.message?.includes("504") ||
      error?.message?.includes("unavailable")
    ) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SSR] Backend unavailable for fauna list, returning empty list",
        );
      }
      return FaunaPaginatedSchema.parse({
        items: [],
        total: 0,
        limit: params?.limit || 20,
        offset: params?.offset || 0,
        has_next: false,
        has_prev: false,
      });
    }
    throw error;
  }
});

export const getFaunaDetail = cache(async (id: string) => {
  try {
    const fetcher = createFetcher(FaunaDetailSchema, { revalidate: 300 }); // Cache for 5 minutes
    return await fetcher(`/api/public/fauna/${id}`);
  } catch (error: any) {
    // Handle 502/503/504 errors gracefully
    if (
      error?.message?.includes("502") ||
      error?.message?.includes("503") ||
      error?.message?.includes("504") ||
      error?.message?.includes("unavailable")
    ) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SSR] Backend unavailable for fauna detail, throwing error for proper 404 handling",
        );
      }
      throw error;
    }
    throw error;
  }
});

export const getArtikelPage = cache(async (params: SearchParams = {}) => {
  const fetcher = createFetcher(ArtikelPaginatedSchema, { revalidate: 600 });
  return fetcher("/api/public/artikel/", params);
});

export const getArtikelDetail = cache(
  async (slug: string): Promise<ArtikelDetail> => {
    const fetcher = createFetcher(ArtikelDetailSchema, { revalidate: 900 });
    return fetcher(`/api/public/artikel/${slug}`);
  },
);

// Gallery functions
export const getGalleryPage = cache(async (params: SearchParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", String(params.search));
  if (params.jenis) searchParams.set("jenis", String(params.jenis));
  if (params.entitas) searchParams.set("entitas", String(params.entitas));
  if (params.wilayah) searchParams.set("wilayah", String(params.wilayah));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/public/galeri/?${searchParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error(
      `Gagal memuat data dari /api/public/galeri/ (${response.status})`,
    );
  }
  return GalleryPaginatedSchema.parse(await response.json());
});

export const getGalleryList = cache(async (params: SearchParams = {}) => {
  try {
    const fetcher = createFetcher(GalleryPaginatedSchema, { revalidate: 300 });
    return await fetcher("/api/public/galeri/", params);
  } catch (error: any) {
    // Handle 502/503/504 errors gracefully
    if (
      error?.message?.includes("502") ||
      error?.message?.includes("503") ||
      error?.message?.includes("504") ||
      error?.message?.includes("unavailable")
    ) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SSR] Backend unavailable for gallery list, returning empty list",
        );
      }
      return GalleryPaginatedSchema.parse({
        items: [],
        total: 0,
        limit: params?.limit || 20,
        offset: params?.offset || 0,
        has_next: false,
        has_prev: false,
      });
    }
    throw error;
  }
});

export const getGalleryDetail = cache(async (id: string) => {
  const fetcher = createFetcher(GalleryDetailSchema, { revalidate: 3600 });
  return fetcher(`/api/public/galeri/${id}`);
});
