'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MinimalHeroSection } from '../../components/public/home/MinimalHeroSection';
import { AboutSection } from '../../components/public/home/AboutSection';
import { AboutTamanSection } from '../../components/public/home/AboutTamanSection';
import { MinimalStatsSection } from '../../components/public/home/MinimalStatsSection';
import { MinimalFeaturedSection } from '../../components/public/home/MinimalFeaturedSection';
import { MinimalMapSection } from '../../components/public/home/MinimalMapSection';
import { MinimalTestimonialsSection } from '../../components/public/home/MinimalTestimonialsSection';
import { MinimalNewsletterSection } from '../../components/public/home/MinimalNewsletterSection';
import { FAQSection } from '../../components/public/home/FAQSection';
import { getPublicStats, getLatestArticles, getGalleryHighlights } from '../../lib/api/public-client';
import { JsonLd } from '../../components/public/seo/JsonLd';

export default function HomePageClient() {
  const [data, setData] = useState<{
    stats: { total_flora: number; total_fauna: number; total_taman: number; } | null,
    articles: { id: string; judul: string; slug: string; excerpt: string; kategori: string; tanggal_publish: string; gambar_cover?: string; }[],
    gallery: { id: string; judul: string; url: string; jenis: string; wilayah?: string; }[],
  }>({
    stats: null,
    articles: [],
    gallery: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const fallbackData = {
          stats: { total_flora: 0, total_fauna: 0, total_taman: 0 },
          articles: [],
          gallery: []
        };
        
        setData(fallbackData);
        setLoading(false);
        
        try {
          const [stats, articles, gallery] = await Promise.all([
            getPublicStats(),
            getLatestArticles(),
            getGalleryHighlights(),
          ]);
          
          setData({ stats, articles, gallery });
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4"
          />
          <p className="text-sm text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
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

      {/* Minimal Hero with Search */}
      <MinimalHeroSection />

      {/* About Section with Arc Gallery (Foto Melingkar) */}
      <AboutSection />

      {/* About Taman Kehati Section */}
      <AboutTamanSection />

      {/* Stats Dashboard */}
      <MinimalStatsSection />

      {/* Featured Species */}
      <MinimalFeaturedSection />

      {/* Map Section */}
      <MinimalMapSection />

      {/* Testimonials */}
      <MinimalTestimonialsSection />

      {/* Newsletter */}
      <MinimalNewsletterSection />

      {/* FAQ */}
      <FAQSection />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </main>
  );
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </>
  );
}
