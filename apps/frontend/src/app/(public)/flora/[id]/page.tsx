import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloraDetailView } from "../../../../components/public/flora/FloraDetailView";
import { JsonLd } from "../../../../components/public/seo/JsonLd";
import { getFloraDetail, getFloraList } from "../../../../lib/api/public";
import type { FloraDetail } from "../../../../types/flora";

// ISR - Regenerate every 5 minutes for faster response
export const revalidate = 300;

type FloraDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: FloraDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const flora = await getFloraDetail(id);
    return {
      title: `${flora.nama_ilmiah} | Flora Indonesia`,
      description:
        flora.deskripsi?.slice(0, 150) ??
        "Detail flora dari portal Taman Kehati.",
      openGraph: {
        title: flora.nama_ilmiah,
        description: flora.deskripsi?.slice(0, 150),
        images: flora.gambar_utama ? [{ url: flora.gambar_utama }] : undefined,
      },
    };
  } catch {
    return {
      title: "Flora Taman Kehati",
      description: "Detail flora dari portal Taman Kehati.",
    };
  }
}

export default async function FloraDetailPage({
  params,
}: FloraDetailPageProps) {
  try {
    const { id } = await params;
    
    // Fetch flora detail - this is cached and will be fast
    const flora = await getFloraDetail(id);
    
    // Skip related fetch if konten_terkait already exists - saves one API call
    const related = flora.konten_terkait?.length
      ? null
      : flora.famili
        ? await getFloraList({
            famili: flora.famili,
            limit: 6,
            offset: 0,
          }).catch(() => null)
        : null;

    const enrichedFlora: FloraDetail = {
      ...flora,
      konten_terkait:
        flora.konten_terkait ??
        related?.items
          .filter((item) => item.id !== flora.id)
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            nama_ilmiah: item.nama_ilmiah,
            nama_umum: item.nama_umum,
            gambar_utama: item.gambar_utama ? item.gambar_utama : undefined,
          })) ?? [],
    };

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Taxon",
      name: enrichedFlora.nama_ilmiah,
      description: enrichedFlora.deskripsi,
      taxonRank: "species",
      parentTaxon: enrichedFlora.famili,
      image: enrichedFlora.gambar_utama,
      url: `${siteUrl}/flora/${enrichedFlora.id}`,
      additionalType: "https://www.wikidata.org/entity/Q7275",
    };

    return (
      <div className="pt-16 bg-white min-h-screen overflow-x-hidden">
        <JsonLd data={jsonLd} />
        <FloraDetailView flora={enrichedFlora} />
      </div>
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Flora detail not found", error);
    }
    notFound();
  }
}
