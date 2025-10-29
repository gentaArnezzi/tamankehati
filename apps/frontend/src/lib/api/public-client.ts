'use client';

import { z } from 'zod';
import { ArtikelPaginatedSchema } from '../../types/articles';
import { FloraPaginatedSchema } from '../../types/flora';
import { FaunaPaginatedSchema } from '../../types/fauna';
import { GalleryPaginatedSchema } from '../../types/gallery';
import { TamanDetailSchema, TamanPaginatedSchema } from '../../types/taman';
import {
  ArtikelPublicSchema,
  FloraPublicSchema,
  FaunaPublicSchema,
  GaleriPublicSchema,
  PaginatedResponseSchema,
  PublicStatsSchema,
  TamanPublicSchema,
} from '../../types/public';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === 'production' ? 'https://tamankehati-backend.onrender.com' : 'http://localhost:8000');

type Primitive = string | number | boolean;
type SearchParams = Record<string, Primitive | Primitive[] | undefined | null>;

const toQuery = (params?: SearchParams) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === '') return;
        query.append(key, String(item));
      });
    } else if (typeof value === 'boolean') {
      query.append(key, value ? 'true' : 'false');
    } else {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

const clientFetch = async <Schema extends z.ZodTypeAny>(
  schema: Schema,
  path: string,
  params?: SearchParams,
  init?: RequestInit
) => {
  const response = await fetch(`${API_BASE_URL}${path}${toQuery(params)}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Gagal memuat data (${response.status})`);
  }

  const json = await response.json();
  return schema.parse(json);
};

export const fetchFloraPage = (params?: SearchParams) =>
  clientFetch(FloraPaginatedSchema, '/api/public/flora/', params);

export const fetchFaunaPage = (params?: SearchParams) =>
  clientFetch(FaunaPaginatedSchema, '/api/public/fauna/', params);

export const fetchTamanPage = async (params?: SearchParams) => {
  // Map frontend parameters to backend parameters
  const backendParams: SearchParams = {};
  
  if (params) {
    // Map region to wilayah for backend compatibility
    if (params.region) {
      backendParams.wilayah = params.region;
    }
    
    // Also support wilayah directly (from FacetFilters)
    if (params.wilayah) {
      backendParams.wilayah = params.wilayah;
    }
    
    // Also support provinsi parameter
    if (params.provinsi) {
      backendParams.provinsi = params.provinsi;
    }
    
    // Pass through other parameters
    if (params.search) backendParams.search = params.search;
    if (params.status) backendParams.status = params.status;
    if (params.limit) backendParams.limit = params.limit;
    if (params.offset) backendParams.offset = params.offset;
  }

  const url = `${API_BASE_URL}/api/public/parks${toQuery(backendParams)}`;
  console.log('Fetching taman data from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Gagal memuat data (${response.status})`);
  }

  const data = await response.json();
  
  // The new endpoint returns paginated format directly
  return TamanPaginatedSchema.parse(data);
};

export const fetchArtikelPage = (params?: SearchParams) =>
  clientFetch(ArtikelPaginatedSchema, '/api/public/artikel/', params);


export const fetchTamanDetail = (id: string) =>
  clientFetch(TamanDetailSchema, `/api/public/parks/${id}`);

// Additional public API functions for homepage
export async function getPublicStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/stats/`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return PublicStatsSchema.parse(data);
  } catch (error) {
    console.warn('Failed to fetch public stats, using fallback data:', error);
    // Return fallback data for production when API is not available
    return {
      total_flora: 0,
      total_fauna: 0,
      total_taman: 0,
    };
  }
}

export async function getLatestArticles(limit = 6) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/artikel/?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return z.array(ArtikelPublicSchema).parse(data);
  } catch (error) {
    console.warn('Failed to fetch latest articles, using empty array:', error);
    return [];
  }
}

export async function getGalleryHighlights() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/galeri/?limit=6`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return z.array(GaleriPublicSchema).parse(data);
  } catch (error) {
    console.warn('Failed to fetch gallery highlights, using empty array:', error);
    return [];
  }
}

export async function getTamanList(params?: { search?: string; status?: string; region?: string; limit?: number; offset?: number }) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.status) queryParams.set('status', params.status);
    if (params?.region) queryParams.set('region', params.region);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('skip', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/public/parks?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Wrap the array in paginated format
    return {
      items: data,
      total: data.length,
      limit: params?.limit || 12,
      offset: params?.offset || 0,
    };
  } catch (error) {
    console.warn('Failed to fetch taman list, using empty array:', error);
    return {
      items: [],
      total: 0,
      limit: params?.limit || 12,
      offset: params?.offset || 0,
    };
  }
}

// Gallery functions
export async function fetchGalleryPage(params: SearchParams = {}) {
  try {
    const response = await fetch(`/api/public/galeri/?${new URLSearchParams(params as Record<string, string>).toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Wrap the array in paginated format
    return {
      items: data,
      total: data.length,
      limit: params?.limit || 12,
      offset: params?.offset || 0,
    };
  } catch (error) {
    console.warn('Failed to fetch gallery list, using empty array:', error);
    return {
      items: [],
      total: 0,
      limit: params?.limit || 12,
      offset: params?.offset || 0,
    };
  }
}
