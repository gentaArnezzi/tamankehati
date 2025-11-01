"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fetchStats, StatsData } from "../../../lib/api/stats";

export function MinimalStatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const [counts, setCounts] = useState({
    flora: 0,
    fauna: 0,
    parks: 0,
  });

  const [targets, setTargets] = useState({
    flora: 320,
    fauna: 180,
    parks: 52,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats data on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const statsData = await fetchStats();
        setTargets({
          flora: statsData.total_flora,
          fauna: statsData.total_fauna,
          parks: statsData.total_taman,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
        setError("Gagal memuat data statistik");
        // Keep default targets if API fails
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Animation effect when in view
  useEffect(() => {
    if (isInView && !loading) {
      Object.keys(targets).forEach((key) => {
        const target = targets[key as keyof typeof targets];
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCounts((prev) => ({ ...prev, [key]: Math.floor(current) }));
        }, duration / steps);
      });
    }
  }, [isInView, loading, targets]);

  const stats = [
    {
      value: counts.flora,
      label: "Spesies Flora",
      description: "Terdokumentasi",
    },
    {
      value: counts.fauna,
      label: "Spesies Fauna",
      description: "Teridentifikasi",
    },
    {
      value: counts.parks,
      label: "Taman Konservasi",
      description: "Seluruh Indonesia",
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 sm:mb-6">
            Tentang Kehati
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-emerald-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Transparansi penuh untuk mendukung riset dan konservasi
            berkelanjutan
          </p>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat statistik...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-500 text-sm">Menampilkan data contoh</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mt-6 sm:mt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center px-2"
                  >
                    <div className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-900 mb-1 sm:mb-2">
                      {stat.value}
                      <span className="text-2xl sm:text-3xl text-emerald-600">+</span>
                    </div>
                    <div className="text-sm sm:text-base font-medium text-slate-700 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {stat.description}
                    </div>
                  </motion.div>
                ))}
              </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center px-2"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-900 mb-1 sm:mb-2">
                  {stat.value}
                  <span className="text-2xl sm:text-3xl text-emerald-600">+</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-slate-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-12 sm:mt-16 md:mt-20"
        />
      </div>
    </section>
  );
}
