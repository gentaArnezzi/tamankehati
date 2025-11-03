"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { motion, useInView } from "framer-motion";
import { Leaf, PawPrint, MapPin, type LucideIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface MinimalStatsSectionProps {
  initialStats?: {
    total_flora: number;
    total_fauna: number;
    total_taman: number;
  };
}

// Define stats configuration outside component to ensure icons are always available
const STATS_CONFIG = [
  {
    label: "Spesies Flora",
    description: "Terdokumentasi",
    icon: Leaf as LucideIcon,
    key: "flora" as const,
    gradient: "from-emerald-500 to-teal-600",
    accentColor: "emerald",
  },
  {
    label: "Spesies Fauna",
    description: "Teridentifikasi",
    icon: PawPrint as LucideIcon,
    key: "fauna" as const,
    gradient: "from-amber-500 to-orange-600",
    accentColor: "amber",
  },
  {
    label: "Taman Konservasi",
    description: "Seluruh Indonesia",
    icon: MapPin as LucideIcon,
    key: "parks" as const,
    gradient: "from-blue-500 to-cyan-600",
    accentColor: "blue",
  },
] as const;

export const MinimalStatsSection = memo(function MinimalStatsSection({ initialStats }: MinimalStatsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

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

  // Smooth counting animation with ease-out cubic easing
  useEffect(() => {
    if (!isInView) return;

    const intervals: NodeJS.Timeout[] = [];

    Object.keys(targets).forEach((key) => {
      const target = targets[key as keyof typeof targets];
      
      if (target === 0) {
        setCounts((prev) => ({ ...prev, [key]: 0 }));
        return;
      }

      const duration = 2500; // 2.5 seconds for smooth animation
      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic for smooth deceleration
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);
        
        const current = Math.floor(startValue + (target - startValue) * easedProgress);
        setCounts((prev) => ({ ...prev, [key]: current }));

        if (progress >= 1) {
          setCounts((prev) => ({ ...prev, [key]: target }));
        }
      };

      const interval = setInterval(animate, 16); // ~60fps
      intervals.push(interval);
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isInView, targets]);

  // Build stats array with current counts
  // Use targets for chart data to keep charts stable during animation
  const stats = useMemo(() => {
    return STATS_CONFIG.map((config) => {
      const currentValue = counts[config.key] || 0;
      const finalValue = targets[config.key] || 0;
      
      // Generate stable mock data for mini chart (simulating growth over time)
      // Use finalValue instead of currentValue to keep chart stable during animation
      // Using deterministic calculation based on index and key
      const seed = config.key.charCodeAt(0) + config.key.length;
      const chartData = Array.from({ length: 12 }, (_, i) => {
        const progress = (i + 1) / 12;
        // Simulate growth with slight variation based on seed
        const variation = Math.sin((seed + i) * 0.5) * 0.1;
        const value = Math.max(0, Math.floor(finalValue * (0.2 + progress * 0.8 + variation)));
        return {
          month: i + 1,
          value: value,
        };
      });
      
      return {
        ...config,
        value: currentValue,
        chartData,
      };
    });
  }, [counts, targets]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-24 md:py-32 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header - Ultra Minimalist */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-slate-900 mb-4"
          >
            Data & Statistik
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-px w-20 bg-slate-300 mx-auto mb-6"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto tracking-wide uppercase"
          >
            Transparansi penuh untuk mendukung riset dan konservasi berkelanjutan
          </motion.p>
        </motion.div>

        {/* Stats Grid - Ultra Minimalist Design - Centered */}
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20 w-full max-w-4xl">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2 + index * 0.15,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="group relative"
              >
                {/* Subtle gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 to-slate-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                
                <div className="relative">
                  {/* Icon - Minimalist with subtle animation */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.4 + index * 0.15,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                    className="mb-8"
                  >
                    <div className="relative inline-block">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity duration-500`} />
                      <div className="relative">
                        <IconComponent className="w-8 h-8 text-slate-600 group-hover:text-slate-900 transition-colors duration-300" strokeWidth={1.5} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Value & Chart Section */}
                  <div className="mb-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                      className="flex items-end justify-between gap-4 mb-3"
                    >
                      <div className="flex-1">
                        <span className="text-5xl sm:text-6xl md:text-7xl font-extralight text-slate-900 tracking-tighter tabular-nums block leading-none">
                          {counts[stat.key].toLocaleString()}
                        </span>
                      </div>
                      {/* Mini Sparkline Chart */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.7 + index * 0.15 }}
                        className="w-20 h-12 sm:w-24 sm:h-14 flex-shrink-0"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stat.chartData}>
                            <defs>
                              <linearGradient id={`gradient-${stat.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={stat.gradient.includes("emerald") ? "#10b981" : stat.gradient.includes("amber") ? "#f59e0b" : "#3b82f6"} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={stat.gradient.includes("emerald") ? "#10b981" : stat.gradient.includes("amber") ? "#f59e0b" : "#3b82f6"} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={stat.gradient.includes("emerald") ? "#10b981" : stat.gradient.includes("amber") ? "#f59e0b" : "#3b82f6"}
                              strokeWidth={2}
                              fill={`url(#gradient-${stat.key})`}
                              dot={false}
                              activeDot={{ r: 3, fill: stat.gradient.includes("emerald") ? "#10b981" : stat.gradient.includes("amber") ? "#f59e0b" : "#3b82f6" }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Progress Bar - Visual Indicator */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 1, delay: 0.8 + index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mb-6"
                  >
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${Math.min(100, (counts[stat.key] / Math.max(...stats.map(s => counts[s.key] || 1))) * 100)}%` } : {}}
                        transition={{ duration: 1.5, delay: 0.9 + index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                        className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                      />
                    </div>
                  </motion.div>

                  {/* Label - Clean typography */}
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
                    className="text-base sm:text-lg font-normal text-slate-700 mb-1 tracking-wide"
                  >
                    {stat.label}
                  </motion.h3>

                  {/* Description - Subtle */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.7 + index * 0.15 }}
                    className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest"
                  >
                    {stat.description}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
});
