import type { Metadata } from "next";
import { GalleryHero } from "../../../components/public/gallery/GalleryHero";
import { GalleryExplore } from "../../../components/public/gallery/GalleryExplore";
import { getGalleryPage } from "../../../lib/api/public";

export const metadata: Metadata = {
  title: "Galeri Kehati",
  description: "Jelajahi koleksi foto keanekaragaman hayati Indonesia",
};

// ISR - Regenerate every 5 minutes for fresher gallery
export const revalidate = 300;

type GaleriPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const readParam = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) => {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

export default async function GaleriPage({ searchParams }: GaleriPageProps) {
  const resolvedSearchParams = await searchParams;
  const offsetParam = Number(readParam(resolvedSearchParams, "offset") || "0");

  const initialData = await getGalleryPage({
    search: readParam(resolvedSearchParams, "search"),
    jenis: readParam(resolvedSearchParams, "jenis"),
    wilayah: readParam(resolvedSearchParams, "wilayah"),
    limit: 12,
    offset: Number.isFinite(offsetParam) ? offsetParam : 0,
  });

  const initialParams = new URLSearchParams();
  ["search", "jenis", "wilayah", "offset"].forEach((key) => {
    const value = readParam(resolvedSearchParams, key);
    if (value) {
      initialParams.set(key, value);
    }
  });

  return (
    <main>
      <GalleryHero />
      <GalleryExplore initialData={initialData} initialParams={initialParams} />
    </main>
  );
}
