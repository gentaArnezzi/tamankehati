'use client';

import { HttpClient, PaginatedResponse } from './http-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const client = new HttpClient(API_BASE_URL);

type FloraPublicResponse = {
  id: string;
  nama_ilmiah: string;
  nama_umum: string;
  famili: string;
  status_iucn: string;
  deskripsi: string;
  habitat: string;
  wilayah: string;
  gambar_utama: string;
  status: string;
};

type FaunaPublicResponse = {
  id: string;
  nama_ilmiah: string;
  nama_umum: string;
  famili: string;
  status_iucn: string;
  deskripsi: string;
  habitat: string;
  wilayah: string;
  gambar_utama: string;
  status: string;
};

type TamanPublicResponse = {
  id: string;
  nama: string;
  wilayah: string;
  luas_ha: number;
  deskripsi: string;
};

type ArtikelPublicResponse = {
  id: string;
  judul: string;
  slug: string;
  excerpt: string;
  kategori: string;
  tanggal_publish: string;
  gambar_cover: string;
};

type GaleriPublicResponse = {
  id: string;
  judul: string;
  url: string;
  jenis: string;
  wilayah: string;
};

type PublicListResult<T> = PaginatedResponse<T> & {
  total: number;
};

const withPaginationMeta = <T,>(
  response: PaginatedResponse<T>,
) => ({
  items: response.items,
  total: response.total,
  limit: response.limit,
  offset: response.offset,
  hasNext: response.has_next,
  hasPrev: response.has_prev,
});

const mapFlora = (item: FloraPublicResponse) => ({
  id: item.id,
  nama_spesies: item.nama_ilmiah,
  nama_ilmiah: item.nama_ilmiah,
  nama_umum: item.nama_umum,
  status_konservasi: item.status_iucn,
  habitat: item.habitat,
  deskripsi: item.deskripsi,
  gambar_utama: item.gambar_utama,
  kategori: item.status,
  lokasi: item.wilayah,
});

const mapFauna = (item: FaunaPublicResponse) => ({
  id: item.id,
  nama_spesies: item.nama_ilmiah,
  nama_ilmiah: item.nama_ilmiah,
  nama_umum: item.nama_umum,
  status_konservasi: item.status_iucn,
  habitat: item.habitat,
  deskripsi: item.deskripsi,
  gambar_utama: item.gambar_utama,
  kategori: item.status,
  lokasi: item.wilayah,
});

const mapTaman = (item: TamanPublicResponse) => ({
  id: item.id,
  nama_taman: item.nama,
  nama_daerah: item.wilayah,
  luas: item.luas_ha ? String(item.luas_ha) : undefined,
  luas_ha: item.luas_ha,
  deskripsi: item.deskripsi,
  lokasi: item.wilayah,
  gambar: undefined as string | undefined,
});

const mapArtikel = (item: ArtikelPublicResponse) => ({
  id: item.id,
  judul: item.judul,
  slug: item.slug,
  excerpt: item.excerpt,
  kategori: item.kategori,
  tanggal_publish: item.tanggal_publish,
  gambar_cover: item.gambar_cover,
});

const mapGaleri = (item: GaleriPublicResponse) => ({
  id: item.id,
  judul: item.judul,
  url: item.url,
  jenis: item.jenis,
  wilayah: item.wilayah,
});

export const publicApi = {
  getFlora: async (params?: {
    search?: string;
    wilayah?: string;
    status_iucn?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await client.get<PublicListResult<FloraPublicResponse>>(
      '/api/public/flora/',
      params,
    );
    return {
      ...withPaginationMeta(response),
      items: response.items.map(mapFlora),
    };
  },

  getFloraById: async (id: string) => {
    const response = await client.get<FloraPublicResponse>(`/api/public/flora/${id}`);
    return mapFlora(response);
  },

  getFauna: async (params?: {
    search?: string;
    wilayah?: string;
    status_iucn?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await client.get<PublicListResult<FaunaPublicResponse>>(
      '/api/public/fauna/',
      params,
    );
    return {
      ...withPaginationMeta(response),
      items: response.items.map(mapFauna),
    };
  },

  getFaunaById: async (id: string) => {
    const response = await client.get<FaunaPublicResponse>(`/api/public/fauna/${id}`);
    return mapFauna(response);
  },

  getTaman: async (params?: { search?: string; wilayah?: string; limit?: number; offset?: number }) => {
    const response = await client.get<PublicListResult<TamanPublicResponse>>(
      '/api/public/parks/',
      params,
    );
    return {
      ...withPaginationMeta(response),
      items: response.items.map(mapTaman),
    };
  },

  getTamanById: async (id: string) => {
    const response = await client.get<TamanPublicResponse>(`/api/public/parks/${id}`);
    return mapTaman(response);
  },

  getArticles: async (params?: { category?: string; limit?: number; offset?: number }) => {
    const response = await client.get<PublicListResult<ArtikelPublicResponse>>(
      '/api/public/artikel/',
      params,
    );
    return {
      ...withPaginationMeta(response),
      items: response.items.map(mapArtikel),
    };
  },

  getArticleBySlug: async (slug: string) => {
    const response = await client.get<ArtikelPublicResponse>(`/api/public/artikel/${slug}`);
    return mapArtikel(response);
  },

  getGallery: async (params?: { jenis?: string; wilayah?: string; limit?: number; offset?: number }) => {
    const response = await client.get<PublicListResult<GaleriPublicResponse>>(
      '/api/public/galeri/',
      params,
    );
    return {
      ...withPaginationMeta(response),
      items: response.items.map(mapGaleri),
    };
  },

  getStats: () => client.get<Record<string, unknown>>('/api/public/stats/'),

  sendChat: (payload: { message: string; session_id?: string }) =>
    client.post<{ session_id: string; response: string }>('/api/public/chat/', payload),
};
