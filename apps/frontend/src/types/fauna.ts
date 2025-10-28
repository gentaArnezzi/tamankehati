import { z } from 'zod';
import { FaunaPublicSchema, PaginatedResponseSchema } from './public';

export const FaunaDetailSchema = FaunaPublicSchema.extend({
  ordo: z.string().optional(),
  famili: z.string(),
  genus: z.string().optional(),
  spesies: z.string().optional(),
  status_iucn: z.string(),
  deskripsi: z.string().optional(),
  morfologi: z.string().optional(),
  habitat: z.string().optional(),
  diet: z.string().optional(),
  behavior: z.string().optional(),
  habitat_sumber_makanan: z.string().optional(),
  status_hama: z.string().optional(),
  tingkat_hama: z.string().optional(),
  is_endemic: z.boolean().optional(),
  sebaran: z.array(z.string()).optional(),
  koordinat: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  konten_terkait: z
    .array(
      z.object({
        id: z.string(),
        nama_ilmiah: z.string(),
        nama_umum: z.string().optional(),
        gambar_utama: z.string().optional(),
      })
    )
    .optional(),
});

export const FaunaPaginatedSchema = PaginatedResponseSchema(FaunaPublicSchema);

export type FaunaPaginated = z.infer<typeof FaunaPaginatedSchema>;
export type FaunaDetail = z.infer<typeof FaunaDetailSchema>;
