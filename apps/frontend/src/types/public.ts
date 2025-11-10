import { z } from "zod";

export const PaginationMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

export const ParkInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  area_ha: z.number().nullable().optional(),
  provinsi: z.string().nullable().optional(),
  kota_kabupaten: z.string().nullable().optional(),
  kecamatan: z.string().nullable().optional(),
  desa_kelurahan: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  pengelola: z.string().nullable().optional(),
  tipe_ekoregion: z.string().nullable().optional(),
});

export const FloraPublicSchema = z.object({
  id: z.string(),
  nama_ilmiah: z.string(),
  nama_umum: z.string(),
  kelas: z.string().nullable().optional(),
  famili: z.string(),
  genus: z.string().nullable().optional(),
  spesies: z.string().nullable().optional(),
  status_iucn: z.string(),
  deskripsi: z.string().nullable().optional(),
  morfologi: z.string().nullable().optional(),
  manfaat: z.string().nullable().optional(),
  kegunaan: z.string().nullable().optional(),
  is_endemic: z.boolean().nullable().optional(),
  habitat: z.string().nullable().optional(),
  wilayah: z.string(),
  gambar_utama: z.string().nullable().optional(),
  gambar_daun: z.string().nullable().optional(),
  gambar_batang: z.string().nullable().optional(),
  gambar_bunga: z.string().nullable().optional(),
  gambar_buah: z.string().nullable().optional(),
  status: z.string(),
  park_info: ParkInfoSchema.nullable().optional(),
  local_id: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const FaunaPublicSchema = z.object({
  id: z.string(),
  nama_ilmiah: z.string(),
  nama_umum: z.string(),
  kelas: z.string().nullable().optional(),
  famili: z.string(),
  genus: z.string().nullable().optional(),
  spesies: z.string().nullable().optional(),
  ordo: z.string().nullable().optional(),
  status_iucn: z.string(),
  deskripsi: z.string().nullable().optional(),
  morfologi: z.string().nullable().optional(),
  diet: z.string().nullable().optional(),
  behavior: z.string().nullable().optional(),
  habitat_sumber_makanan: z.string().nullable().optional(),
  status_hama: z.string().nullable().optional(),
  tingkat_hama: z.string().nullable().optional(),
  is_endemic: z.boolean().nullable().optional(),
  habitat: z.string().nullable().optional(),
  wilayah: z.string(),
  gambar_utama: z.string().nullable().optional(),
  status: z.string(),
  park_info: ParkInfoSchema.nullable().optional(),
  local_id: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const TamanPublicSchema = z.object({
  id: z.union([z.number(), z.string().transform(Number)]),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  region_id: z.number().nullable().optional(),
  region_name: z.string().nullable().optional(),
  area_ha: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  sk_penetapan: z.string().nullable().optional(),
  pengelola: z.string().nullable().optional(),
  tipe_ekoregion: z.string().nullable().optional(),
  kondisi_fisik: z.string().nullable().optional(),
  nilai_penting: z.string().nullable().optional(),
  sejarah: z.string().nullable().optional(),
  visi: z.string().nullable().optional(),
  misi: z.string().nullable().optional(),
  nilai_dasar: z.string().nullable().optional(),
  provinsi: z.string().nullable().optional(),
  kota_kabupaten: z.string().nullable().optional(),
  kecamatan: z.string().nullable().optional(),
  desa_kelurahan: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  gambar_utama: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  statistik: z
    .object({
      flora: z.number().default(0),
      fauna: z.number().default(0),
      artikel: z.number().default(0),
      galeri: z.number().default(0),
    })
    .optional(),
});

// Keep ParkPublicSchema for backward compatibility
export const ParkPublicSchema = TamanPublicSchema;

export const ArtikelPublicSchema = z.object({
  id: z.string(),
  judul: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  kategori: z.string(),
  tanggal_publish: z.string(),
  gambar_cover: z.string().optional(),
});

export const GaleriPublicSchema = z.object({
  id: z.string(),
  judul: z.string(),
  url: z.string(),
  jenis: z.string(),
  wilayah: z.string().optional(),
});

export const PublicStatsSchema = z.object({
  total_flora: z.number().default(0),
  total_fauna: z.number().default(0),
  total_taman: z.number().default(0),
  total_artikel: z.number().default(0),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    items: z.array(itemSchema),
    ...PaginationMetaSchema.shape,
  });

export type FloraPublic = z.infer<typeof FloraPublicSchema>;
export type FaunaPublic = z.infer<typeof FaunaPublicSchema>;
export type TamanPublic = z.infer<typeof TamanPublicSchema>;
export type ParkPublic = z.infer<typeof ParkPublicSchema>;
export type ArtikelPublic = z.infer<typeof ArtikelPublicSchema>;
export type GaleriPublic = z.infer<typeof GaleriPublicSchema>;
export type PublicStats = z.infer<typeof PublicStatsSchema>;
