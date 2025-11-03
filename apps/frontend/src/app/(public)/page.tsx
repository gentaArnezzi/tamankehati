import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { getPublicStats, getLatestArticles, getGalleryHighlights, getTamanList } from "../../lib/api/public";

export const metadata: Metadata = {
  title: "Portal Keanekaragaman Hayati Indonesia",
  description:
    "Taman Kehati menyediakan akses terpadu ke data flora, fauna, dan taman konservasi Indonesia untuk edukasi, riset, dan aksi lapangan.",
  openGraph: {
    title: "Portal Keanekaragaman Hayati Indonesia",
    description:
      "Jelajahi data flora, fauna, dan taman konservasi dari seluruh Nusantara melalui Taman Kehati.",
    images: [
      {
        url: "/hero/forest.webp",
        width: 1200,
        height: 630,
        alt: "Hutan hujan Indonesia",
      },
    ],
  },
};

// ISR - Regenerate every 5 minutes for fresher homepage data
// Reduced revalidate to 60 seconds for faster updates during development
export const revalidate = 60;

export default async function HomePage() {
  // Fetch all homepage data in parallel on the server for faster initial load
  const [stats, articles, gallery, parks] = await Promise.allSettled([
    getPublicStats(),
    getLatestArticles(6),
    getGalleryHighlights(6),
    getTamanList({ limit: 100, offset: 0 }).catch(() => ({ items: [], total: 0, limit: 100, offset: 0, has_next: false, has_prev: false })),
  ]);

  // Extract results with fallbacks
  const statsData = stats.status === "fulfilled" ? stats.value : {
    total_flora: 0,
    total_fauna: 0,
    total_taman: 0,
    total_artikel: 0,
  };
  
  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    if (stats.status === "rejected") {
      console.error("[SSR] Failed to fetch public stats:", stats.reason);
    } else {
      console.log("[SSR] Public stats loaded:", statsData);
    }
  }
  
  const articlesData = articles.status === "fulfilled" ? articles.value : [];
  const galleryData = gallery.status === "fulfilled" ? gallery.value : [];
  const parksData = parks.status === "fulfilled" 
    ? (parks.value.items || []).map((park) => ({
        id: park.id,
        name: park.name,
        latitude: park.latitude?.toString(),
        longitude: park.longitude?.toString(),
        provinsi: park.provinsi ?? undefined,
      }))
    : [];

  return (
    <HomePageClient
      initialStats={statsData}
      initialArticles={articlesData}
      initialGallery={galleryData}
      initialParks={parksData}
    />
  );
}
