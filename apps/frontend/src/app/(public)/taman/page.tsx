import type { Metadata } from "next";
import { TamanHero } from "../../../components/public/parks/TamanHero";
import { TamanExplore } from "../../../components/public/parks/TamanExplore";
import { ClimateIndicator } from "../../../components/public/parks/ClimateIndicator";
import { BalaiKliringSection } from "../../../components/public/parks/BalaiKliringSection";
import { JsonLd } from "../../../components/public/seo/JsonLd";
import { getTamanPage, getPublicStats } from "../../../lib/api/public";

export const metadata: Metadata = {
  title: "Taman Kehati - Keanekaragaman Hayati Indonesia",
  description: "Jelajahi Taman Kehati Indonesia - taman keanekaragaman hayati yang tersebar di seluruh Nusantara. Temukan data flora, fauna, dan informasi konservasi keanekaragaman hayati terpadu.",
  keywords: [
    "taman kehati",
    "taman keanekaragaman hayati",
    "konservasi keanekaragaman hayati",
    "taman konservasi indonesia",
    "keanekaragaman hayati indonesia",
    "flora fauna indonesia",
    "konservasi alam indonesia",
  ],
  openGraph: {
    title: "Taman Kehati - Keanekaragaman Hayati Indonesia",
    description: "Jelajahi Taman Kehati Indonesia - taman keanekaragaman hayati yang tersebar di seluruh Nusantara",
    type: "website",
    siteName: "Taman Kehati",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taman Kehati - Keanekaragaman Hayati Indonesia",
    description: "Jelajahi Taman Kehati Indonesia - taman keanekaragaman hayati yang tersebar di seluruh Nusantara",
  },
  alternates: {
    canonical: "/taman",
  },
};

// ISR - Regenerate every 5 minutes for fresher data
export const revalidate = 300;

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

  const [rawData, publicStats] = await Promise.all([
    getTamanPage({
      search: readParam(resolvedSearchParams, "search"),
      region: readParam(resolvedSearchParams, "region"),
      status: readParam(resolvedSearchParams, "status"),
      limit: 12,
      offset: Number.isFinite(offsetParam) ? offsetParam : 0,
    }),
    getPublicStats(),
  ]);

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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "https://tamankehati-8x6q.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Taman Kehati - Keanekaragaman Hayati Indonesia",
    description:
      "Jelajahi Taman Kehati Indonesia - taman keanekaragaman hayati yang tersebar di seluruh Nusantara. Temukan data flora, fauna, dan informasi konservasi keanekaragaman hayati terpadu.",
    url: `${siteUrl}/taman`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: initialData.total,
      itemListElement: initialData.items.slice(0, 10).map((taman, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Place",
          name: taman.name,
          description: taman.description,
          url: `${siteUrl}/taman/${taman.id}`,
        },
      })),
    },
    about: {
      "@type": "Thing",
      name: "Taman Keanekaragaman Hayati",
      description: "Kawasan konservasi keanekaragaman hayati di Indonesia",
    },
    publisher: {
      "@type": "Organization",
      name: "Kementerian Lingkungan Hidup dan Kehutanan",
      url: "https://www.menlhk.go.id",
    },
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <TamanHero
        stats={{
          totalTaman: publicStats.total_taman,
          totalProvinsi: publicStats.total_provinsi,
          totalFlora: publicStats.total_flora,
          totalFauna: publicStats.total_fauna,
        }}
      />
      <ClimateIndicator />
      <TamanExplore initialData={initialData} initialParams={initialParams} />
      <BalaiKliringSection />
    </main>
  );
}
