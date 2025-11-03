import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaunaDetailView } from "@/components/public/fauna/FaunaDetailView";
import { JsonLd } from "@/components/public/seo/JsonLd";
import { getFaunaDetail, getFaunaList } from "@/lib/api/public";
import type { FaunaDetail } from "@/types/fauna";

// ISR - Regenerate every 5 minutes for faster response
export const revalidate = 300;

type FaunaDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: FaunaDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const fauna = await getFaunaDetail(id);
    return {
      title: `${fauna.nama_ilmiah} | Fauna Indonesia`,
      description:
        fauna.deskripsi?.slice(0, 150) ??
        "Detail fauna dari portal Taman Kehati.",
      openGraph: {
        title: fauna.nama_ilmiah,
        description: fauna.deskripsi?.slice(0, 150),
        images: fauna.gambar_utama ? [{ url: fauna.gambar_utama }] : undefined,
      },
    };
  } catch {
    return {
      title: "Fauna Taman Kehati",
      description: "Detail fauna dari portal Taman Kehati.",
    };
  }
}

export default async function FaunaDetailPage({
  params,
}: FaunaDetailPageProps) {
  try {
    const { id } = await params;
    
    // Fetch fauna detail - this is cached and will be fast
    const fauna = await getFaunaDetail(id);
    
    // Skip related fetch if konten_terkait already exists - saves one API call
    const related = fauna.konten_terkait?.length
      ? null
      : fauna.famili
        ? await getFaunaList({
            famili: fauna.famili,
            limit: 6,
            offset: 0,
          }).catch(() => null)
        : null;

    const enrichedFauna: FaunaDetail = {
      ...fauna,
      konten_terkait:
        fauna.konten_terkait ??
        related?.items
          .filter((item) => item.id !== fauna.id)
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            nama_ilmiah: item.nama_ilmiah,
            nama_umum: item.nama_umum,
            gambar_utama: item.gambar_utama ?? undefined,
          })),
    };

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Taxon",
      name: enrichedFauna.nama_ilmiah,
      description: enrichedFauna.deskripsi,
      taxonRank: "species",
      parentTaxon: enrichedFauna.famili,
      image: enrichedFauna.gambar_utama,
      url: `${siteUrl}/fauna/${enrichedFauna.id}`,
      additionalType: "https://www.wikidata.org/entity/Q16521",
    };

    return (
      <div className="pt-16 px-6 md:px-8 lg:px-12 bg-white min-h-screen">
        <JsonLd data={jsonLd} />
        <FaunaDetailView fauna={enrichedFauna} />
      </div>
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Fauna detail not found", error);
    }
    notFound();
  }
}
