'use client';

import { useEffect, useState } from 'react';
import { HeroSection } from '../../components/public/home/HeroSection';
import { AboutSection } from '../../components/public/home/AboutSection';
import { AboutTamanSection } from '../../components/public/home/AboutTamanSection';
import { CollectionsSection } from '../../components/public/home/CollectionsSection';
import { StatsSection } from '../../components/public/home/StatsSection';
import { CTASection } from '../../components/public/home/CTASection';
import { LatestArticlesSection } from '../../components/public/home/LatestArticlesSection';
import { GalleryHighlight } from '../../components/public/gallery/GalleryHighlight';
import { getPublicStats, getLatestArticles, getGalleryHighlights, getTamanList } from '../../lib/api/public-client';
import { FAQSection } from '../../components/public/home/FAQSection';
import { JsonLd } from '../../components/public/seo/JsonLd';

export default function HomePageClient() {
  const [data, setData] = useState<{
    stats: { total_flora: number; total_fauna: number; total_taman: number; } | null,
    articles: { id: string; judul: string; slug: string; excerpt: string; kategori: string; tanggal_publish: string; gambar_cover?: string; }[],
    gallery: { id: string; judul: string; url: string; jenis: string; wilayah?: string; }[],
    parks: { id: number; name: string; slug: string; status: string; created_at: string; updated_at: string; area_ha?: number | null; description?: string | null; }[],
  }>({
    stats: null,
    articles: [],
    gallery: [],
    parks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use fallback data immediately to avoid infinite loading
        const fallbackData = {
          stats: { total_flora: 0, total_fauna: 0, total_taman: 0 },
          articles: [],
          gallery: [],
          parks: []
        };
        
        setData(fallbackData);
        setLoading(false);
        
        // Try to fetch real data in background
        try {
          const [stats, articles, gallery, parks] = await Promise.all([
            getPublicStats(),
            getLatestArticles(),
            getGalleryHighlights(),
            getTamanList({ limit: 12 }),
          ]);
          
          setData({ stats, articles, gallery, parks: parks.items });
        } catch (err) {
          console.warn('Background data fetch failed, using fallback:', err);
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamankehati.id';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Portal Keanekaragaman Hayati Indonesia',
          url: `${siteUrl}/`,
          description:
            'Taman Kehati menyediakan akses terpadu ke data flora, fauna, dan taman konservasi Indonesia untuk edukasi, riset, dan aksi lapangan.',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <HeroSection />
      <AboutSection />
      <AboutTamanSection />
      <CollectionsSection />
      <StatsSection />

      <LatestArticlesSection articles={data.articles} />

      <FAQSection />

      <GalleryHighlight items={data.gallery} />
    </main>
  );
}
