import { z } from 'zod';
import { GaleriPublicSchema, PaginatedResponseSchema } from './public';

export const GalleryItemSchema = GaleriPublicSchema.extend({
  thumbnail: z.string().nullish(),
  kredit: z.string().nullish(),
  entitas: z.string().nullish(),
  tipe_media: z.enum(['foto', 'video']).or(z.string()).nullish(),
  deskripsi: z.string().nullish(),
}).passthrough();

export const GalleryPaginatedSchema = PaginatedResponseSchema(GalleryItemSchema);
export const GalleryDetailSchema = GalleryItemSchema;

export type GalleryItem = z.infer<typeof GalleryItemSchema>;
export type GalleryPaginated = z.infer<typeof GalleryPaginatedSchema>;
export type GalleryDetail = z.infer<typeof GalleryDetailSchema>;
