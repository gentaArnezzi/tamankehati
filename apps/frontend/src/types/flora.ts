import { z } from 'zod';
import { FloraPublicSchema, PaginatedResponseSchema } from './public';

export const FloraDetailSchema = FloraPublicSchema.extend({
  ordo: z.string().optional(),
  famili: z.string(),
  genus: z.string().optional(),
  spesies: z.string().optional(),
  status_iucn: z.string(),
  deskripsi: z.string().optional(),
  habitat: z.string().optional(),
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

export const FloraPaginatedSchema = PaginatedResponseSchema(FloraPublicSchema);

export type FloraPaginated = z.infer<typeof FloraPaginatedSchema>;
export type FloraDetail = z.infer<typeof FloraDetailSchema>;
