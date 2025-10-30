import type { Metadata } from "next";
import { FaunaExplore } from "../../../components/public/fauna/FaunaExplore";
import { FaunaHero } from "../../../components/public/fauna/FaunaHero";
import { getFaunaList } from "../../../lib/api/public";

export const metadata: Metadata = {
  title: "Atlas Fauna Indonesia",
  description:
    "Temukan satwa liar Indonesia dengan filter status konservasi, klasifikasi taksonomi, dan penyebaran geografis.",
};

export const revalidate = 3600;

type FaunaPageProps = {
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

export default async function FaunaPage({ searchParams }: FaunaPageProps) {
  const resolvedSearchParams = await searchParams;
  const offsetParam = Number(readParam(resolvedSearchParams, "offset") || "0");
  const initialData = await getFaunaList({
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
      <FaunaHero />
      <FaunaExplore initialData={initialData} initialParams={initialParams} />
    </main>
  );
}
