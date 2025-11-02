"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fetchStats, StatsData } from "../../../lib/api/stats";
import { Leaf, PawPrint, MapPin } from "lucide-react";

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
      icon: Leaf,
      color: "emerald",
      gradient: "from-emerald-50 to-green-50",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      value: counts.fauna,
      label: "Spesies Fauna",
      description: "Teridentifikasi",
      icon: PawPrint,
      color: "amber",
      gradient: "from-amber-50 to-orange-50",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      value: counts.parks,
      label: "Taman Konservasi",
      description: "Seluruh Indonesia",
      icon: MapPin,
      color: "blue",
      gradient: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6"
          >
            Data & Statistik
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto rounded-full mb-6 sm:mb-8"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-slate-600 max-w-2xl mx-auto px-4 leading-relaxed" 
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}
          >
            Transparansi penuh untuk mendukung riset dan konservasi
            berkelanjutan
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat statistik...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.15,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative"
                >
                  <div className={`bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 ${stat.bgColor}/30 h-full`}>
                    {/* Icon with gradient background */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${stat.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconColor}`} />
                    </div>

                    {/* Value */}
                    <div className="mb-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-2"
                      >
                        {stat.value}
                        <span className={`text-2xl sm:text-3xl ${stat.iconColor} ml-1`}>+</span>
                      </motion.div>
                    </div>

                    {/* Label */}
                    <h3 className={`font-semibold text-slate-800 mb-2 ${stat.iconColor} group-hover:${stat.iconColor} transition-colors`} style={{ fontSize: 'clamp(1.125rem, 1.8vw, 1.75rem)' }}>
                      {stat.label}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-sm sm:text-base" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1.125rem)' }}>
                      {stat.description}
                    </p>

                    {/* Decorative gradient line */}
                    {stat.color === "emerald" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl sm:rounded-b-3xl" />
                    )}
                    {stat.color === "amber" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl sm:rounded-b-3xl" />
                    )}
                    {stat.color === "blue" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl sm:rounded-b-3xl" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Decorative Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
          className="relative mt-12 sm:mt-16 md:mt-20"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 via-emerald-200 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white px-4">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
