"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const MapWrapper = dynamic(
  () => import("./MapWrapper").then((mod) => {
    if (!mod || !mod.MapWrapper) {
      console.error('[MinimalMapSection] MapWrapper not found in module');
      throw new Error('MapWrapper component not found');
    }
    return { default: mod.MapWrapper };
  }).catch((error) => {
    console.error('[MinimalMapSection] Error loading MapWrapper:', error);
    // Return a fallback component
    return { 
      default: () => (
        <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-slate-500">Peta tidak dapat dimuat</div>
        </div>
      )
    };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-slate-500">Memuat peta...</div>
      </div>
    ),
  },
);

export function MinimalMapSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [parks, setParks] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    total_flora: number;
    total_fauna: number;
    total_taman: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate park counts per region based on fetched data
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch parks and stats data in parallel
        const [parksResponse, statsResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/public/parks?limit=100`,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}/api/public/stats/`,
          ),
        ]);

        // Process parks data
        if (parksResponse.ok) {
          const parksData = await parksResponse.json();
          const parksArray = Array.isArray(parksData)
            ? parksData
            : parksData.items || [];
          setParks(parksArray);
        }

        // Process stats data
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            <div className="w-16 sm:w-24 h-1 bg-emerald-500 rounded-full mb-4 sm:mb-6"></div>
            <p className="text-gray-600 mb-6 sm:mb-8" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
              Lebih dari 70 taman konservasi tersebar di seluruh Indonesia,
              masing-masing menjaga kekayaan hayati yang unik.
            </p>

            {/* Regions List */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {regions.map((region, index) => (
                <motion.div
                  key={region.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="font-medium text-slate-900" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
                      {region.name}
                    </span>
                  </div>
                  <span className="text-gray-500 group-hover:text-emerald-600" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1.25rem)' }}>
                    {region.parks} Taman
                  </span>
                </motion.div>
              ))}
            </div>

            <Link
              href="/taman"
              className="inline-flex items-center gap-2 text-gray-900 hover:text-emerald-600 font-medium group min-h-[44px]"
              style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}
            >
              Lihat Peta Lengkap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

                {/* Stats Overlay - Always show */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-emerald-100 shadow-lg z-20"
                >
                  <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
                    <div>
                      <div className="font-light text-slate-900" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                        {stats?.total_taman || parks.length || 0}
                      </div>
                      <div className="text-slate-600 mt-1" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1.25rem)' }}>Taman</div>
                    </div>
                    <div>
                      <div className="font-light text-slate-900" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                        5
                      </div>
                      <div className="text-slate-600 mt-1" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1.25rem)' }}>Pulau</div>
                    </div>
                    <div>
                      <div className="font-light text-slate-900" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                        {stats
                          ? `${(stats.total_flora + stats.total_fauna).toLocaleString()}+`
                          : "500+"}
                      </div>
                      <div className="text-slate-600 mt-1" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1.25rem)' }}>Spesies</div>
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
}
