"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, TreePine, Waves, Mountain } from "lucide-react";
import Link from "next/link";

interface Park {
  id: number;
  name: string;
  location: string;
  type: "forest" | "marine" | "mountain";
  species_count: number;
  lat?: number;
  lng?: number;
}

export function InteractiveMapSection() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const element = document.getElementById("map-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Mock data - replace with real data
  const parks: Park[] = [
    {
      id: 1,
      name: "Taman Nasional Gunung Leuser",
      location: "Sumatera",
      type: "forest",
      species_count: 380,
    },
    {
      id: 2,
      name: "Taman Nasional Komodo",
      location: "Nusa Tenggara",
      type: "marine",
      species_count: 254,
    },
    {
      id: 3,
      name: "Taman Nasional Bromo Tengger",
      location: "Jawa",
      type: "mountain",
      species_count: 137,
    },
    {
      id: 4,
      name: "Taman Nasional Bunaken",
      location: "Sulawesi",
      type: "marine",
      species_count: 390,
    },
    {
      id: 5,
      name: "Taman Nasional Lorentz",
      location: "Papua",
      type: "mountain",
      species_count: 630,
    },
    {
      id: 6,
      name: "Taman Nasional Tanjung Puting",
      location: "Kalimantan",
      type: "forest",
      species_count: 230,
    },
  ];

  const regions = [
    { name: "Sumatera", count: 15, color: "emerald" },
    { name: "Jawa", count: 12, color: "green" },
    { name: "Kalimantan", count: 18, color: "teal" },
    { name: "Sulawesi", count: 9, color: "cyan" },
    { name: "Nusa Tenggara", count: 7, color: "lime" },
    { name: "Papua", count: 11, color: "emerald" },
  ];

  const getTypeIcon = (type: Park["type"]) => {
    switch (type) {
      case "forest":
        return TreePine;
      case "marine":
        return Waves;
      case "mountain":
        return Mountain;
    }
  };

  return (
    <section
      id="map-section"
      className="py-32 bg-gradient-to-b from-white via-emerald-50/30 to-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <MapPin className="w-4 h-4" />
            Peta Sebaran Taman Kehati
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Jelajahi Taman dari
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Sabang Sampai Merauke
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lebih dari 70+ taman konservasi tersebar di seluruh Indonesia,
            masing-masing menjaga kekayaan hayati yang unik dan berharga
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Indonesia Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              {/* SVG Map Placeholder - Replace with actual Indonesia SVG map */}
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                  {/* Simplified Indonesia islands */}
                  {regions.map((region, index) => {
                    const positions = [
                      { x: 150, y: 200 }, // Sumatera
                      { x: 280, y: 280 }, // Jawa
                      { x: 380, y: 200 }, // Kalimantan
                      { x: 480, y: 250 }, // Sulawesi
                      { x: 520, y: 350 }, // Nusa Tenggara
                      { x: 650, y: 280 }, // Papua
                    ];
                    return (
                      <motion.g
                        key={region.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onMouseEnter={() => setSelectedRegion(region.name)}
                        onMouseLeave={() => setSelectedRegion(null)}
                        className="cursor-pointer"
                      >
                        <motion.circle
                          cx={positions[index].x}
                          cy={positions[index].y}
                          r={selectedRegion === region.name ? 50 : 40}
                          className={`fill-${region.color}-500 opacity-70 hover:opacity-100 transition-all`}
                          fill={`rgb(${region.color === "emerald" ? "16, 185, 129" : region.color === "green" ? "34, 197, 94" : region.color === "teal" ? "20, 184, 166" : region.color === "cyan" ? "6, 182, 212" : "132, 204, 22"})`}
                          whileHover={{ scale: 1.2 }}
                        />
                        <text
                          x={positions[index].x}
                          y={positions[index].y + 5}
                          textAnchor="middle"
                          className="text-xs font-semibold fill-white"
                        >
                          {region.count}
                        </text>
                      </motion.g>
                    );
                  })}
                </svg>

                {/* Animated Markers */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
                      style={{
                        left: `${20 + i * 12}%`,
                        top: `${30 + (i % 3) * 20}%`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Region Legend */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {regions.map((region, index) => (
                  <motion.button
                    key={region.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onMouseEnter={() => setSelectedRegion(region.name)}
                    onMouseLeave={() => setSelectedRegion(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedRegion === region.name
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-bold">{region.count}</div>
                    <div className="text-xs opacity-80">{region.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Floating Info Card */}
            {selectedRegion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-emerald-200 max-w-xs"
              >
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {selectedRegion}
                </h4>
                <p className="text-sm text-gray-600">
                  {regions.find((r) => r.name === selectedRegion)?.count} Taman
                  Konservasi
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Featured Parks List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Taman Unggulan
            </h3>

            {parks.map((park, index) => {
              const Icon = getTypeIcon(park.type);
              return (
                <motion.div
                  key={park.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 cursor-pointer"
                >
                  <Link
                    href={`/taman/${park.id}`}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/50">
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {park.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {park.location}
                        </span>
                        <span>•</span>
                        <span>{park.species_count} Spesies</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 1.2 }}
              className="pt-4"
            >
              <Link
                href="/taman"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105"
              >
                Lihat Semua Taman
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
