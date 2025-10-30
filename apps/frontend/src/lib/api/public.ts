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
    console.log("[SSR] Fetching from:", url);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: options?.revalidate ?? 3600,
        },
      });

      if (!response.ok) {
        console.error(
          `[SSR] Fetch failed: ${response.status} ${response.statusText}`,
        );
        throw new Error(`Gagal memuat data dari ${path} (${response.status})`);
      }

      const json = await response.json();
      console.log(
        "[SSR] Data received:",
        JSON.stringify(json).substring(0, 200),
      );
      const parsed = schema.parse(json);
      console.log("[SSR] Schema parsed successfully");
      return parsed;
    } catch (error) {
      console.error("[SSR] Error in createFetcher:", error);
      throw error;
    }
  };

const fetchPaginated = <T extends z.ZodTypeAny>(
  schema: T,
  revalidate?: number,
) => createFetcher(PaginatedResponseSchema(schema), { revalidate });

export const getPublicStats = cache(async (): Promise<PublicStats> => {
  const fetcher = createFetcher(PublicStatsSchema, { revalidate: 300 });
  return fetcher("/api/public/stats/");
});

export const getParkStats = cache(
  async (parkId: number): Promise<PublicStats> => {
    const fetcher = createFetcher(PublicStatsSchema, { revalidate: 300 });
    return fetcher(`/api/public/stats/park/${parkId}/`);
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

export const getLatestArticles = cache(async (): Promise<ArtikelPublic[]> => {
  const fetcher = fetchPaginated(ArtikelPublicSchema, 600);
  const data = await fetcher("/api/public/artikel/", { limit: 3, offset: 0 });
  return data.items;
});

export const getGalleryHighlights = cache(
  async (limit = 8): Promise<GalleryItem[]> => {
    const fetcher = createFetcher(GalleryPaginatedSchema, { revalidate: 900 });
    const data = await fetcher("/api/public/galeri/", { limit, offset: 0 });
    return data.items;
  },
);

// Main Taman functions
export const getTamanList = cache(async (params: SearchParams = {}) => {
  // Map frontend parameters to backend parameters
  const backendParams: SearchParams = {};

  if (params.search) backendParams.search = params.search;
  if (params.region) backendParams.wilayah = params.region; // Map region to wilayah
  if (params.status) backendParams.status = params.status;
  if (params.limit) backendParams.limit = params.limit;
  if (params.offset) backendParams.offset = params.offset;

  const url = `${API_BASE_URL}/api/public/parks${buildQuery(backendParams)}`;
  console.log("[SSR] Fetching taman data from:", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 0, // Disable cache to get fresh data with gambar_utama
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
  console.log(
    "[SSR] Parks data received:",
    JSON.stringify(data).substring(0, 200),
  );

  // The backend now returns a proper paginated response with TamanPaginatedSchema format
  return TamanPaginatedSchema.parse(data);
});

// Alias for consistency
export const getTamanPage = getTamanList;

export const getTamanDetail = cache(async (id: string) => {
  const fetcher = createFetcher(TamanDetailSchema);
  return fetcher(`/api/public/parks/${id}`);
});

// Keep Park functions for backward compatibility
export const getParkList = getTamanList;
export const getParkPage = getTamanPage;
export const getParkDetail = getTamanDetail;

export const getFloraList = async (params: SearchParams = {}) => {
  const fetcher = createFetcher(FloraPaginatedSchema, { revalidate: 0 }); // No cache for testing
  return fetcher("/api/public/flora/", params);
};

export const getFloraDetail = cache(async (id: string) => {
  const fetcher = createFetcher(FloraDetailSchema);
  return fetcher(`/api/public/flora/${id}`);
});

export const getFaunaList = cache(async (params: SearchParams = {}) => {
  const fetcher = createFetcher(FaunaPaginatedSchema, { revalidate: 600 });
  return fetcher("/api/public/fauna/", params);
});

export const getFaunaDetail = cache(async (id: string) => {
  const fetcher = createFetcher(FaunaDetailSchema);
  return fetcher(`/api/public/fauna/${id}`);
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
  const fetcher = createFetcher(GalleryPaginatedSchema, { revalidate: 300 });
  return fetcher("/api/public/galeri/", params);
});

export const getGalleryDetail = cache(async (id: string) => {
  const fetcher = createFetcher(GalleryDetailSchema, { revalidate: 3600 });
  return fetcher(`/api/public/galeri/${id}`);
});
