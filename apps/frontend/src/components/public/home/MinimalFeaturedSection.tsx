"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchFeaturedItems, FeaturedItem } from "../../../lib/api/featured";

export function MinimalFeaturedSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [features, setFeatures] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
            initial={{ width: 0, opacity: 0 }}
            animate={isInView ? { width: "6rem", opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="h-1 bg-emerald-500 mx-auto rounded-full mb-4 sm:mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl lg:text-3xl xl:text-4xl text-gray-600 max-w-2xl mx-auto px-4"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.4 + index * 0.15,
                  ease: "easeOut",
                }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Link href={feature.link} className="group block">
                  <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-2xl transition-shadow duration-500">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          // Fallback to default image if the API image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Category badge on hover */}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        {feature.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <div className="text-sm sm:text-base md:text-lg lg:text-lg font-medium text-emerald-600 mb-2 uppercase tracking-wide opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        {feature.category}
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-medium text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-medium text-gray-900 group-hover:text-emerald-600 transition-all duration-300 min-h-[44px]">
                        <span className="group-hover:font-semibold transition-all">
                          Pelajari
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
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
}
