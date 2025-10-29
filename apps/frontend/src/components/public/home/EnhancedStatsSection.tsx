'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Users, BookOpen, Award, Leaf, Bird, MapPin, FileText } from 'lucide-react';

export function EnhancedStatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
  const [counts, setCounts] = useState({
    flora: 0,
    fauna: 0,
    parks: 0,
    research: 0,
    users: 0,
    articles: 0,
    education: 0,
    conservation: 0
  });

  const targets = {
    flora: 320,
    fauna: 180,
    parks: 52,
    research: 50,
    users: 1200,
    articles: 145,
    education: 25,
    conservation: 95
  };

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
      
      // Animate counters
      Object.keys(targets).forEach((key) => {
        const target = targets[key as keyof typeof targets];
        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCounts(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, stepDuration);
      });
    }
  }, [isInView]);

  const mainStats = [
    {
      icon: Leaf,
      label: 'Spesies Flora',
      value: counts.flora,
      suffix: '+',
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      description: 'Terdokumentasi dalam database',
      chartData: [65, 45, 80, 70, 90, 85, 95]
    },
    {
      icon: Bird,
      label: 'Spesies Fauna',
      value: counts.fauna,
      suffix: '+',
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-600',
      description: 'Dari seluruh Indonesia',
      chartData: [45, 65, 55, 75, 85, 80, 90]
    },
    {
      icon: MapPin,
      label: 'Taman Kehati',
      value: counts.parks,
      suffix: '+',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      description: 'Tersebar di Nusantara',
      chartData: [55, 60, 70, 65, 80, 75, 85]
    },
    {
      icon: FileText,
      label: 'Publikasi Ilmiah',
      value: counts.research,
      suffix: '+',
      color: 'lime',
      gradient: 'from-lime-500 to-green-600',
      description: 'Penelitian konservasi',
      chartData: [50, 55, 65, 70, 75, 80, 88]
    }
  ];

  const secondaryStats = [
    {
      icon: Users,
      label: 'Pengguna Aktif',
      value: counts.users,
      suffix: '+',
      trend: '+24%',
      color: 'emerald'
    },
    {
      icon: BookOpen,
      label: 'Artikel Edukasi',
      value: counts.articles,
      suffix: '+',
      trend: '+18%',
      color: 'green'
    },
    {
      icon: Award,
      label: 'Program Edukasi',
      value: counts.education,
      suffix: '+',
      trend: '+31%',
      color: 'teal'
    },
    {
      icon: TrendingUp,
      label: 'Tingkat Keberhasilan',
      value: counts.conservation,
      suffix: '%',
      trend: '+12%',
      color: 'lime'
    }
  ];

  return (
    <section ref={sectionRef} className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
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
            <TrendingUp className="w-4 h-4" />
            Data Real-Time
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Dampak Nyata
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Konservasi Indonesia
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparansi data untuk mendukung riset, edukasi, dan aksi konservasi yang berdampak
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {mainStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg shadow-${stat.color}-500/50 mb-6`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>

                {/* Value */}
                <div className="mb-4">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stat.value.toLocaleString()}
                    <span className="text-3xl">{stat.suffix}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.description}
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="flex items-end gap-1 h-16 mt-4">
                  {stat.chartData.map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={isVisible ? { height: `${height}%` } : {}}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                      className={`flex-1 bg-gradient-to-t ${stat.gradient} rounded-sm opacity-70`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {secondaryStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Impact Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-6">
                Komitmen Konservasi Berkelanjutan
              </h3>
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                Setiap hari, kami bekerja bersama komunitas peneliti, akademisi, dan pelestari 
                untuk melindungi kekayaan hayati Indonesia bagi generasi mendatang.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-white/80">Monitoring Aktif</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-white/80">Data Terbuka</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                  <div className="text-2xl font-bold">ISO</div>
                  <div className="text-sm text-white/80">Standar Kualitas</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Peneliti Terdaftar', value: '450+' },
                { label: 'Institusi Partner', value: '28' },
                { label: 'Proyek Aktif', value: '67' },
                { label: 'Data Points', value: '50K+' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.4 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all"
                >
                  <div className="text-3xl font-bold mb-2">{item.value}</div>
                  <div className="text-sm text-white/80">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

