import { z } from 'zod';

// Server-side API functions for Next.js App Router

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-zxb9.onrender.com'}';

// Taman schemas
const TamanPublicSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  // region_id: z.number().nullable(),  // Removed - using user-based access control
  area_ha: z.number().nullable(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const TamanPaginatedSchema = z.object({
  items: z.array(TamanPublicSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type TamanPublic = z.infer<typeof TamanPublicSchema>;
export type TamanPaginated = z.infer<typeof TamanPaginatedSchema>;

// Keep Park types for backward compatibility
export type ParkPublic = TamanPublic;
export type ParkPaginated = TamanPaginated;

// Server-side fetch function
async function serverFetch<T>(url: string, params?: Record<string, any>): Promise<T> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.set(key, String(value));
      }
    });
  }
  
  const fullUrl = `${API_BASE_URL}${url}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      revalidate: 900, // 15 minutes
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Taman API functions
export async function getTamanPage(params: {
  search?: string;
  region?: string;
  tipe_ekoregion?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<TamanPaginated> {
  try {
    // Map frontend parameters to backend parameters
    const backendParams: Record<string, any> = {
      limit: params.limit || 12,
      offset: params.offset || 0,
    };

    // Map search parameter
    if (params.search) {
      backendParams.search = params.search;
    }

    // Map region parameter (backend uses 'wilayah')
    if (params.region) {
      backendParams.wilayah = params.region;
    }

    // Map tipe_ekoregion parameter
    if (params.tipe_ekoregion) {
      backendParams.tipe_ekoregion = params.tipe_ekoregion;
    }

    // Backend returns paginated format directly
    const response = await serverFetch<TamanPaginated>('/api/public/parks', backendParams);
    
    // Parse and return the response
    return TamanPaginatedSchema.parse(response);
  } catch (error) {
    console.error('Error fetching taman page:', error);
    return {
      items: [],
      total: 0,
      limit: params.limit || 12,
      offset: params.offset || 0,
    };
  }
}

export async function getTamanDetail(id: string): Promise<TamanPublic> {
  return serverFetch<TamanPublic>(`/api/public/parks/${id}`);
}

// Keep Park functions for backward compatibility (deprecated)
export const getParkPage = getTamanPage;
export const getParkDetail = getTamanDetail;

// Flora API functions
export async function getFloraPage(params: {
  search?: string;
  famili?: string;
  status_iucn?: string;
  wilayah?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<any> {
  try {
    const items = await serverFetch<any[]>('/api/public/flora', params);
    
    return {
      items: items,
      total: items.length,
      limit: params.limit || 12,
      offset: params.offset || 0,
    };
  } catch (error) {
    console.error('Error fetching flora page:', error);
    return {
      items: [],
      total: 0,
      limit: params.limit || 12,
      offset: params.offset || 0,
    };
  }
}

// Fauna API functions
export async function getFaunaPage(params: {
  search?: string;
  famili?: string;
  status_iucn?: string;
  wilayah?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<any> {
  try {
    const items = await serverFetch<any[]>('/api/public/fauna', params);
    
    return {
      items: items,
      total: items.length,
      limit: params.limit || 12,
      offset: params.offset || 0,
    };
  } catch (error) {
    console.error('Error fetching fauna page:', error);
    return {
      items: [],
      total: 0,
      limit: params.limit || 12,
      offset: params.offset || 0,
    };
  }
}

// Artikel API functions
export async function getArtikelPage(params: {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<any> {
  try {
    const items = await serverFetch<any[]>('/api/public/artikel', params);
    
    return {
      items: items,
      total: items.length,
      limit: params.limit || 12,
      offset: params.offset || 0,
    };
  } catch (error) {
    console.error('Error fetching artikel page:', error);
    return {
      items: [],
      total: 0,
      limit: params.limit || 12,
      offset: params.offset || 0,
    };
  }
}
