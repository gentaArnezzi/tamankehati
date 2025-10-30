import { z } from "zod";
import { PaginatedResponseSchema, TamanPublicSchema } from "./public";

const CoordinateSchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
  })
  .passthrough();

const GeoJsonFeatureSchema = z
  .object({
    type: z.string(),
    geometry: z.object({
      type: z.string(),
      coordinates: z.any(),
    }),
    properties: z.record(z.string(), z.any()).optional(),
  })
  .passthrough();

const GeoJsonSchema = z
  .object({
    type: z.literal("FeatureCollection"),
    features: z.array(GeoJsonFeatureSchema),
  })
  .passthrough();

export const TamanDetailSchema = TamanPublicSchema.extend({
  alamat: z.string().nullish(),
  status_pengelolaan: z.string().nullish(),
  tipe_ekosistem: z.array(z.string()).optional(),
  koordinat: CoordinateSchema.nullish(),
  statistik: z
    .object({
      flora: z.number().default(0),
      fauna: z.number().default(0),
      artikel: z.number().default(0),
      galeri: z.number().default(0),
      luas_inti: z.number().nullish(),
      luas_penunjang: z.number().nullish(),
    })
    .partial()
    .nullish(),
  galeri: z
    .array(
      z.object({
        id: z.string(),
        judul: z.string(),
        url: z.string().url().nullish(),
        thumbnail: z.string().nullish(),
        kredit: z.string().nullish(),
      }),
    )
    .optional(),
  artikel_terkait: z
    .array(
      z.object({
        id: z.string(),
        judul: z.string(),
        slug: z.string(),
        tanggal_publish: z.string().nullish(),
      }),
    )
    .optional(),
  geojson: GeoJsonSchema.nullish(),
}).passthrough();

export const TamanPaginatedSchema = PaginatedResponseSchema(TamanPublicSchema);

export type TamanDetail = z.infer<typeof TamanDetailSchema>;
export type TamanPaginated = z.infer<typeof TamanPaginatedSchema>;
