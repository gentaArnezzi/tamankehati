import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParkDetailView } from "../../../../components/public/parks/ParkDetailView";
import { JsonLd } from "../../../../components/public/seo/JsonLd";
import {
  getArtikelPage,
  getTamanDetail,
  getParkStats,
} from "../../../../lib/api/public";
import type { TamanDetail } from "../../../../types/taman";

type TamanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TamanDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const taman = await getTamanDetail(id);
    return {
      title: `${taman.name} | Taman Kehati`,
      description:
        taman.description?.slice(0, 150) ??
        "Profil taman konservasi Indonesia.",
      openGraph: {
        title: taman.name,
        description: taman.description?.slice(0, 150),
      },
    };
  } catch {
    return {
      title: "Taman Kehati",
      description: "Profil taman konservasi Indonesia.",
    };
  }
}

export default async function TamanDetailPage({
  params,
}: TamanDetailPageProps) {
  try {
    const { id } = await params;
    
    // Fetch taman detail first - this is critical
    const taman = await getTamanDetail(id);
    
    // Fetch park stats and related articles in parallel (non-blocking, will use taman.statistik if fails)
    const [parkStats, relatedArticles] = await Promise.allSettled([
      getParkStats(parseInt(id)), // Will return fallback stats if endpoint unavailable
      getArtikelPage({
        search: taman.name,
        limit: 4,
        offset: 0,
      }),
    ]);

    // Extract results from Promise.allSettled
    const parkStatsResult = parkStats.status === "fulfilled" ? parkStats.value : null;
    const relatedArticlesResult = relatedArticles.status === "fulfilled" ? relatedArticles.value : null;
    
    const enrichedTaman = {
      ...taman,
      artikel_terkait: relatedArticlesResult?.items ?? [],
      statistik: {
        flora: parkStatsResult?.total_flora ?? taman.statistik?.flora ?? 0,
        fauna: parkStatsResult?.total_fauna ?? taman.statistik?.fauna ?? 0,
        artikel: relatedArticlesResult?.total ?? 0,
        kegiatan: parkStatsResult?.total_artikel ?? 0, // Using total_artikel field for activities count
        galeri: 0, // Gallery stats not available in current API
      },
    };

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Place",
      name: enrichedTaman.name,
      description: enrichedTaman.description,
      address: "Indonesia", // Region-based addressing removed - using user-based access control
      areaServed: "Indonesia", // Region-based addressing removed - using user-based access control
      geo: {
        "@type": "GeoCoordinates",
        latitude: 0,
        longitude: 0,
      },
      url: `${siteUrl}/taman/${id}`,
    };

    return (
      <>
        <JsonLd data={jsonLd} />
        <ParkDetailView park={enrichedTaman} />
      </>
    );
  } catch (error: any) {
    const { id: errorId } = await params;
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Error loading taman details:", error);
      console.error("   Park ID:", errorId);
      console.error("   Error message:", error?.message || error);
      
      // Log additional context for 500 errors
      if (error?.message?.includes("500") || error?.message?.includes("Backend service error")) {
        console.error(
          "⚠️ Backend returned 500 error - this indicates a server-side issue",
        );
        console.error("   The backend API endpoint exists but is failing internally");
        console.error("   Error detail:", error?.message);
        console.error("   Possible causes:");
        console.error("   1. Database schema mismatch (tuple index out of range)");
        console.error("   2. Missing columns in parks table");
        console.error("   3. Data corruption in park record");
        console.error("   Solution: Check backend logs and verify database schema");
      } else if (error?.message?.includes("404")) {
        console.error("⚠️ Park not found - park ID may not exist or is not approved");
      }
    }
    notFound();
  }
}
