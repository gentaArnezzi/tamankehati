import type { Metadata } from "next";
import { FloraExplore } from "../../../components/public/flora/FloraExplore";
import { FloraHero } from "../../../components/public/flora/FloraHero";
import { getFloraList } from "../../../lib/api/public";

export const metadata: Metadata = {
  title: "Katalog Flora Indonesia",
  description:
    "Telusuri basis data flora Indonesia dengan filter taksonomi, status IUCN, dan sebaran wilayah untuk mendukung riset dan edukasi.",
};

// ISR - Regenerate every 5 minutes for fresher data
export const revalidate = 300;

type FloraPageProps = {
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

export default async function FloraPage({ searchParams }: FloraPageProps) {
  const resolvedSearchParams = await searchParams;
  const offsetParam = Number(readParam(resolvedSearchParams, "offset") || "0");
  const initialData = await getFloraList({
    search: readParam(resolvedSearchParams, "search"),
    famili: readParam(resolvedSearchParams, "famili"),
    status_iucn: readParam(resolvedSearchParams, "status_iucn"),
    wilayah: readParam(resolvedSearchParams, "wilayah"),
    limit: 12,
    offset: Number.isFinite(offsetParam) ? offsetParam : 0,
  });

  const initialParams = new URLSearchParams();
  ["search", "famili", "status_iucn", "wilayah", "offset"].forEach((key) => {
    const value = readParam(resolvedSearchParams, key);
    if (value) {
      initialParams.set(key, value);
    }
  });

  return (
    <main>
      <FloraHero />
      <FloraExplore initialData={initialData} initialParams={initialParams} />
    </main>
  );
}
