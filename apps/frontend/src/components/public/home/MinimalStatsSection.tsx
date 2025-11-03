"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { motion, useInView } from "framer-motion";
import { Leaf, PawPrint, MapPin } from "lucide-react";

interface MinimalStatsSectionProps {
  initialStats?: {
    total_flora: number;
    total_fauna: number;
    total_taman: number;
  };
}

export const MinimalStatsSection = memo(function MinimalStatsSection({ initialStats }: MinimalStatsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const [counts, setCounts] = useState({
    flora: 0,
    fauna: 0,
    parks: 0,
  });

  // Use initialStats from server if available, otherwise use 0
  const targets = useMemo(() => {
    if (initialStats) {
      return {
        flora: initialStats.total_flora,
        fauna: initialStats.total_fauna,
        parks: initialStats.total_taman,
      };
    }
    // No fallback - show 0 if no data
    return {
      flora: 0,
      fauna: 0,
      parks: 0,
    };
  }, [initialStats]);

  // No loading state if we have initialStats from server
  const loading = false;

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
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 sm:mb-6"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              if (!IconComponent || typeof IconComponent !== 'function') {
                console.warn(`[MinimalStatsSection] Icon component is undefined for stat: ${stat.label}`);
                return null;
              }
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-8 sm:p-10 border border-slate-100 hover:border-slate-200 transition-all duration-300 h-full flex flex-col">
                    {/* Icon - Minimal */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-8 group-hover:scale-105 transition-transform duration-300`}>
                      <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>

                    {/* Value */}
                    <div className="mb-6">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="text-5xl sm:text-6xl md:text-7xl font-light text-slate-900 mb-3 tracking-tight"
                      >
                        {stat.value}
                        <span className={`text-2xl sm:text-3xl font-light ${stat.iconColor} ml-1`}>+</span>
                      </motion.div>
                    </div>

                    {/* Label */}
                    <h3 className={`font-medium text-slate-700 mb-2 ${stat.iconColor} transition-colors`} style={{ fontSize: 'clamp(1.125rem, 1.8vw, 1.5rem)' }}>
                      {stat.label}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
                      {stat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Minimal Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-16 sm:mt-20"
        >
          <div className="h-px bg-slate-100 max-w-2xl mx-auto" />
        </motion.div>
      </div>
    </section>
  );
});
