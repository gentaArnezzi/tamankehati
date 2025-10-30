import type { Metadata } from "next";
import { TamanHero } from "../../../components/public/parks/TamanHero";
import { TamanExplore } from "../../../components/public/parks/TamanExplore";
import { getTamanPage } from "../../../lib/api/public";

export const metadata: Metadata = {
  title: "Taman Kehati",
  description: "Jelajahi taman-taman keanekaragaman hayati Indonesia",
};

export const revalidate = 0; // Disable cache temporarily
export const dynamic = "force-dynamic"; // Force dynamic rendering

type TamanPageProps = {
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

export default async function TamanPage({ searchParams }: TamanPageProps) {
  const resolvedSearchParams = await searchParams;
  const offsetParam = Number(readParam(resolvedSearchParams, "offset") || "0");

  const rawData = await getTamanPage({
    search: readParam(resolvedSearchParams, "search"),
    region: readParam(resolvedSearchParams, "region"),
    status: readParam(resolvedSearchParams, "status"),
    limit: 12,
    offset: Number.isFinite(offsetParam) ? offsetParam : 0,
  });

  const initialData = {
    ...rawData,
    has_next: rawData.offset + rawData.limit < rawData.total,
    has_prev: rawData.offset > 0,
  };

  const initialParams = new URLSearchParams();
  ["search", "region", "status", "offset"].forEach((key) => {
    const value = readParam(resolvedSearchParams, key);
    if (value) {
      initialParams.set(key, value);
    }
  });

  return (
    <main>
      <TamanHero />
      <TamanExplore initialData={initialData} initialParams={initialParams} />
    </main>
  );
}
