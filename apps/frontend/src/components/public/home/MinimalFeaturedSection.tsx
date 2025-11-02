"use client";

import { useState, useEffect, useRef, memo } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { fetchFeaturedItems, FeaturedItem } from "../../../lib/api/featured";

interface MinimalFeaturedSectionProps {
  initialFeatures?: FeaturedItem[];
}

export const MinimalFeaturedSection = memo(function MinimalFeaturedSection({ initialFeatures }: MinimalFeaturedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [features, setFeatures] = useState<FeaturedItem[]>(initialFeatures || []);
  const [loading, setLoading] = useState(!initialFeatures);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have initial features from server, skip client-side fetch
    if (initialFeatures && initialFeatures.length > 0) {
      return;
    }

    // Only fetch if no initial data provided (client-side fallback)
    const loadFeaturedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFeaturedItems();

        // If API returns data, use it
        if (data && data.length > 0) {
          setFeatures(data);
        } else {
          // If no data from API, use fallback
          console.warn("No featured items from API, using fallback data");
          setFeatures([
            {
              id: 1,
              category: "Flora",
              title: "Rafflesia Arnoldii",
              description:
                "Bunga terbesar di dunia, endemik Sumatera dengan diameter hingga 1 meter",
              image:
                "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop",
              link: "/flora",
            },
            {
              id: 2,
              category: "Flora",
              title: "Anggrek Hitam",
              description:
                "Anggrek endemik Kalimantan dengan kelopak berwarna hitam yang langka",
              image:
                "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop",
              link: "/flora",
            },
            {
              id: 3,
              category: "Fauna",
              title: "Orangutan Sumatera",
              description:
                "Primata langka dengan DNA 97% mirip manusia, terancam punah",
              image:
                "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600&h=400&fit=crop",
              link: "/fauna",
            },
          ]);
        }
      } catch (err) {
        console.error("Error loading featured items:", err);
        setError("Gagal memuat data spesies unggulan");
        // Fallback to default data if API fails (only species, no parks)
        setFeatures([
          {
            id: 1,
            category: "Flora",
            title: "Rafflesia Arnoldii",
            description:
              "Bunga terbesar di dunia, endemik Sumatera dengan diameter hingga 1 meter",
            image:
              "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop",
            link: "/flora",
          },
          {
            id: 2,
            category: "Flora",
            title: "Anggrek Hitam",
            description:
              "Anggrek endemik Kalimantan dengan kelopak berwarna hitam yang langka",
            image:
              "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop",
            link: "/flora",
          },
          {
            id: 3,
            category: "Fauna",
            title: "Orangutan Sumatera",
            description:
              "Primata langka dengan DNA 97% mirip manusia, terancam punah",
            image:
              "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600&h=400&fit=crop",
            link: "/fauna",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedItems();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 sm:mb-6"
          >
            Spesies Unggulan
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="h-0.5 bg-emerald-500 mx-auto rounded-full mb-6 sm:mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="text-slate-500 max-w-2xl mx-auto px-4"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}
          >
            Kenali kekayaan hayati Indonesia yang dilindungi dan dilestarikan
          </motion.p>
        </div>

        {/* Features Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Memuat spesies unggulan...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-500 text-sm">Menampilkan data contoh</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.1,
                  ease: "easeOut",
                }}
              >
                <Link 
                  href={feature.link} 
                  className="group block"
                  prefetch={true}
                >
                  <div className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <Image
                        src={feature.image || "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop"}
                        alt={feature.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 flex flex-col flex-1">
                      {/* Category */}
                      <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-3" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
                        {feature.category}
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-medium text-slate-900 mb-3 group-hover:text-slate-700 transition-colors duration-300" style={{ fontSize: 'clamp(1.25rem, 1.8vw, 1.75rem)' }}>
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-500 mb-6 flex-1 text-sm leading-relaxed" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
                        {feature.description}
                      </p>
                      
                      {/* Link */}
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors duration-300" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>
                        <span>Pelajari lebih lanjut</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
