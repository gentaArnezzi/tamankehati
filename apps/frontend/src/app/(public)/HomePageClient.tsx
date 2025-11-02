"use client";

import { Suspense, lazy, memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MinimalHeroSection } from "../../components/public/home/MinimalHeroSection";
import { AboutSection } from "../../components/public/home/AboutSection";
import { AboutTamanSection } from "../../components/public/home/AboutTamanSection";
import { MinimalStatsSection } from "../../components/public/home/MinimalStatsSection";
import { JsonLd } from "../../components/public/seo/JsonLd";

// Lazy load below-the-fold components for faster initial render
const MinimalFeaturedSection = lazy(() =>
  import("../../components/public/home/MinimalFeaturedSection").then((mod) => {
    if (!mod || !mod.MinimalFeaturedSection) {
      console.error('[HomePageClient] MinimalFeaturedSection not found');
      throw new Error('MinimalFeaturedSection not found');
    }
    return { default: mod.MinimalFeaturedSection };
  }).catch((error) => {
    console.error('[HomePageClient] Error loading MinimalFeaturedSection:', error);
    return { default: () => <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" /> };
  })
);

const MinimalMapSection = lazy(() =>
  import("../../components/public/home/MinimalMapSection").then((mod) => {
    if (!mod || !mod.MinimalMapSection) {
      console.error('[HomePageClient] MinimalMapSection not found');
      throw new Error('MinimalMapSection not found');
    }
    return { default: mod.MinimalMapSection };
  }).catch((error) => {
    console.error('[HomePageClient] Error loading MinimalMapSection:', error);
    return { default: () => <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" /> };
  })
);

const MinimalNewsletterSection = lazy(() =>
  import("../../components/public/home/MinimalNewsletterSection").then((mod) => {
    if (!mod || !mod.MinimalNewsletterSection) {
      console.error('[HomePageClient] MinimalNewsletterSection not found');
      throw new Error('MinimalNewsletterSection not found');
    }
    return { default: mod.MinimalNewsletterSection };
  }).catch((error) => {
    console.error('[HomePageClient] Error loading MinimalNewsletterSection:', error);
    return { default: () => <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" /> };
  })
);

const FAQSection = lazy(() =>
  import("../../components/public/home/FAQSection").then((mod) => {
    if (!mod || !mod.FAQSection) {
      console.error('[HomePageClient] FAQSection not found');
      throw new Error('FAQSection not found');
    }
    return { default: mod.FAQSection };
  }).catch((error) => {
    console.error('[HomePageClient] Error loading FAQSection:', error);
    return { default: () => <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" /> };
  })
);

interface HomePageClientProps {
  initialStats: {
    total_flora: number;
    total_fauna: number;
    total_taman: number;
  };
  initialArticles: Array<{
    id: string;
    judul: string;
    slug: string;
    excerpt: string;
    kategori: string;
    tanggal_publish: string;
    gambar_cover?: string;
  }>;
  initialGallery: Array<{
    id: string;
    judul: string;
    url: string;
    jenis: string;
    wilayah?: string;
  }>;
  initialParks?: Array<{
    id: number;
    name: string;
    latitude?: string;
    longitude?: string;
    provinsi?: string;
  }>;
}

const HomePageClient = memo(function HomePageClient({
  initialStats,
  initialArticles,
  initialGallery,
  initialParks = [],
}: HomePageClientProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";

  return (
    <main className="overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Portal Keanekaragaman Hayati Indonesia",
          url: `${siteUrl}/`,
          description:
            "Taman Kehati menyediakan akses terpadu ke data flora, fauna, dan taman konservasi Indonesia untuk edukasi, riset, dan aksi lapangan.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
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
      <MinimalStatsSection initialStats={initialStats} />

      {/* Featured Species - Lazy loaded */}
      <Suspense fallback={<div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" />}>
        <MinimalFeaturedSection />
      </Suspense>

      {/* Map Section - Lazy loaded */}
      <Suspense fallback={<div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" />}>
        <MinimalMapSection initialParks={initialParks} initialStats={initialStats} />
      </Suspense>

      {/* Newsletter - Lazy loaded */}
      <Suspense fallback={<div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" />}>
        <MinimalNewsletterSection />
      </Suspense>

      {/* FAQ - Lazy loaded */}
      <Suspense fallback={<div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" />}>
        <FAQSection />
      </Suspense>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </main>
  );
});

export default HomePageClient;

const ScrollToTopButton = memo(function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
          className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all"
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
});
