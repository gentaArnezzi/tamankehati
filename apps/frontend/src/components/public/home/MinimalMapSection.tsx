"use client";

import { useState, useRef, memo } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const MapWrapper = dynamic(
  () => import("./MapWrapper").then((mod) => mod.MapWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-slate-500">Memuat peta...</div>
      </div>
    ),
  },
);

interface MinimalMapSectionProps {
  initialParks?: Array<{
    id: number;
    name: string;
    latitude?: string;
    longitude?: string;
    provinsi?: string;
  }>;
  initialStats?: {
    total_flora: number;
    total_fauna: number;
    total_taman: number;
  };
}

export const MinimalMapSection = memo(function MinimalMapSection({ 
  initialParks = [], 
  initialStats 
}: MinimalMapSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [parks, setParks] = useState<any[]>(initialParks);
  const [stats] = useState<{
    total_flora: number;
    total_fauna: number;
    total_taman: number;
  } | null>(initialStats || null);
  const [loading, setLoading] = useState(false);

  // Calculate park counts per region based on parks data
  const getRegionCount = (regionName: string) => {
    return parks.filter((park) => {
      const provinsi = park.provinsi?.toLowerCase() || "";

      // Map provinces to major islands
      if (regionName === "Sumatera") {
        return (
          provinsi.includes("sumatera") ||
          provinsi.includes("aceh") ||
          provinsi.includes("riau") ||
          provinsi.includes("jambi") ||
          provinsi.includes("bengkulu") ||
          provinsi.includes("lampung") ||
          provinsi.includes("bangka")
        );
      }
      if (regionName === "Jawa") {
        return (
          provinsi.includes("jawa") ||
          provinsi.includes("jakarta") ||
          provinsi.includes("banten") ||
          provinsi.includes("yogyakarta")
        );
      }
      if (regionName === "Kalimantan") {
        return provinsi.includes("kalimantan");
      }
      if (regionName === "Sulawesi") {
        return provinsi.includes("sulawesi") || provinsi.includes("gorontalo");
      }
      if (regionName === "Papua") {
        return provinsi.includes("papua") || provinsi.includes("maluku");
      }
      return false;
    }).length;
  };

  const regions = [
    { name: "Sumatera", parks: getRegionCount("Sumatera"), x: "20%", y: "30%" },
    { name: "Jawa", parks: getRegionCount("Jawa"), x: "35%", y: "55%" },
    {
      name: "Kalimantan",
      parks: getRegionCount("Kalimantan"),
      x: "50%",
      y: "40%",
    },
    { name: "Sulawesi", parks: getRegionCount("Sulawesi"), x: "65%", y: "45%" },
    { name: "Papua", parks: getRegionCount("Papua"), x: "80%", y: "50%" },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 sm:mb-6">
              Jelajahi Taman Konservasi
            </h2>
            <div className="w-16 sm:w-24 h-0.5 bg-emerald-500 rounded-full mb-6 sm:mb-8"></div>
            <p className="text-slate-500 mb-8 sm:mb-10" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
              Lebih dari 70 taman konservasi tersebar di seluruh Indonesia,
              masing-masing menjaga kekayaan hayati yang unik.
            </p>

            {/* Regions List - Minimal */}
            <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-10">
              {regions.map((region, index) => (
                <motion.div
                  key={region.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05, ease: "easeOut" }}
                  className="flex items-center justify-between p-3 sm:p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="font-medium text-slate-700" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
                      {region.name}
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
                    {region.parks} Taman
                  </span>
                </motion.div>
              ))}
            </div>

            <Link
              href="/taman"
              prefetch={true}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-medium group transition-colors duration-300"
              style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
            >
              Lihat Peta Lengkap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Right: Minimal Map Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-0"
          >
            {!loading && (
              <>
                {parks.length > 0 && (
                  <div className="h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
                    <MapWrapper
                      center={[-2.5, 118.0]}
                      zoom={5}
                      scrollWheelZoom={true}
                      height="100%"
                      markers={parks
                      .filter((park) => park.latitude && park.longitude)
                      .map((park) => ({
                        position: [
                          parseFloat(park.latitude),
                          parseFloat(park.longitude),
                        ] as [number, number],
                        popup: `<div style="text-align: center;">
                          <h3 style="font-weight: 600; color: #064e3b; margin-bottom: 4px;">${park.name}</h3>
                          <p style="font-size: 0.875rem; color: #475569;">${park.provinsi || ""}</p>
                          <a href="/taman/${park.id}" style="display: inline-block; margin-top: 8px; color: #10b981; font-weight: 600; text-decoration: none;">Lihat Detail →</a>
                        </div>`,
                        key: park.id,
                      }))}
                    />
                  </div>
                )}

                {/* Stats Overlay - Minimal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                  className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 sm:p-5 border border-slate-200 z-20"
                >
                  <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                    <div>
                      <div className="font-light text-slate-900" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                        {stats?.total_taman || parks.length || 0}
                      </div>
                      <div className="text-slate-500 text-xs mt-1" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>Taman</div>
                    </div>
                    <div>
                      <div className="font-light text-slate-900" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                        5
                      </div>
                      <div className="text-slate-500 text-xs mt-1" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>Pulau</div>
                    </div>
                    <div>
                      <div className="font-light text-slate-900" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                        {stats
                          ? `${(stats.total_flora + stats.total_fauna).toLocaleString()}+`
                          : "500+"}
                      </div>
                      <div className="text-slate-500 text-xs mt-1" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>Spesies</div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
});
