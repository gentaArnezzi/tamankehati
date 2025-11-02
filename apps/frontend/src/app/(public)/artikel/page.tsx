import type { Metadata } from "next";
import { ArtikelExplore } from "@/components/public/artikel/ArtikelExplore";
import { ArtikelHero } from "@/components/public/artikel/ArtikelHero";
import { getArtikelPage } from "@/lib/api/public";
import type { ArtikelPaginated } from "@/types/articles";

export const metadata: Metadata = {
  title: "Artikel Keanekaragaman Hayati",
  description:
    "Baca artikel edukasi, berita konservasi, dan riset terbaru seputar keanekaragaman hayati Indonesia.",
};

// ISR - Regenerate every 5 minutes for fresher articles
export const revalidate = 300;

type ArtikelPageProps = {
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

export default async function ArtikelPage({ searchParams }: ArtikelPageProps) {
  const resolvedSearchParams = await searchParams;
  const offsetParam = Number(readParam(resolvedSearchParams, "offset") || "0");

  let initialData: ArtikelPaginated;

  try {
    initialData = await getArtikelPage({
      search: readParam(resolvedSearchParams, "search"),
      kategori: readParam(resolvedSearchParams, "kategori"),
      limit: 12,
      offset: Number.isFinite(offsetParam) ? offsetParam : 0,
    });
  } catch (error) {
    console.error("Error fetching artikel:", error);
    // Fallback to empty data if fetch fails
    initialData = {
      items: [],
      total: 0,
      limit: 12,
      offset: 0,
      has_next: false,
      has_prev: false,
    };
  }

  const initialParams = new URLSearchParams();
  ["search", "kategori", "offset"].forEach((key) => {
    const value = readParam(resolvedSearchParams, key);
    if (value) {
      initialParams.set(key, value);
    }
  });

  return (
    <main>
      <ArtikelHero />
      <ArtikelExplore initialData={initialData} initialParams={initialParams} />
    </main>
  );
}
