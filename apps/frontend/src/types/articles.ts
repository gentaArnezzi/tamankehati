import { z } from 'zod';
import { ArtikelPublicSchema, PaginatedResponseSchema } from './public';

export const ArtikelDetailSchema = ArtikelPublicSchema.extend({
  konten_html: z.string().nullish(),
  konten_markdown: z.string().nullish(),
  penulis: z.string().nullish(),
  tag: z.array(z.string()).optional(),
  estimasi_waktu_baca: z.number().nullish(),
}).passthrough();

export const ArtikelPaginatedSchema = PaginatedResponseSchema(ArtikelPublicSchema);

export type ArtikelDetail = z.infer<typeof ArtikelDetailSchema>;
export type ArtikelPaginated = z.infer<typeof ArtikelPaginatedSchema>;
