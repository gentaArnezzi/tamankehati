import { z } from 'zod';
import { PaginatedResponseSchema, ParkPublicSchema } from './public';

export const ParkDetailSchema = ParkPublicSchema.extend({
  sk_penetapan: z.string().nullish(),
  pengelola: z.string().nullish(),
  tipe_ekoregion: z.string().nullish(),
  kondisi_fisik: z.string().nullish(),
  nilai_penting: z.string().nullish(),
  sejarah: z.string().nullish(),
  visi: z.string().nullish(),
  misi: z.string().nullish(),
  galeri: z
    .array(
      z.object({
        id: z.string(),
        judul: z.string(),
        url: z.string().url().nullish(),
        thumbnail: z.string().nullish(),
        kredit: z.string().nullish(),
      })
    )
    .optional(),
  statistik: z
    .object({
      flora: z.number().default(0),
      fauna: z.number().default(0),
      artikel: z.number().default(0),
      galeri: z.number().default(0),
    })
    .optional(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const ParkPaginatedSchema = PaginatedResponseSchema(ParkPublicSchema);

export type ParkDetail = z.infer<typeof ParkDetailSchema>;
export type ParkPaginated = z.infer<typeof ParkPaginatedSchema>;
