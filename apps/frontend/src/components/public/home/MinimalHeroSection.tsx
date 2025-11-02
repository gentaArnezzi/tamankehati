"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

export function MinimalHeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div style={{ scale }} className="absolute inset-0 z-0">
        <Image
          src="/home/hero.jpg"
          alt="Taman Kehati Indonesia"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay untuk readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-white/70" />
      </motion.div>

      <motion.div
        style={{ opacity, y }}
        className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-20 relative z-10 mt-2 sm:mt-4"
      >
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Minimal Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-xs sm:text-sm md:text-base lg:text-lg text-white">
              Database Keanekaragaman Hayati Indonesia
            </span>
          </motion.div>

          {/* Main Heading - Smaller, More Elegant */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white px-2"
          >
            Jelajahi Flora & Fauna
            <span className="block mt-1 sm:mt-2">Nusantara</span>
          </motion.h1>

          {/* Subtitle - Smaller */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Portal terpadu untuk riset biodiversitas, edukasi konservasi, dan
            data ekologi Indonesia.
          </motion.p>

          {/* Minimal Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto px-4"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari spesies, taman, atau artikel..."
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl text-sm sm:text-base md:text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-lg"
              />
            </div>
          </motion.form>

          {/* Minimal CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-3 sm:gap-4 justify-center px-4"
          >
            <Link
              href="/flora"
              className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-900 rounded-lg hover:bg-white/90 transition-all shadow-lg text-sm sm:text-base md:text-lg"
            >
              Jelajahi Flora
              <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/fauna"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg"
            >
              Jelajahi Fauna
            </Link>
            <Link
              href="/taman"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg"
            >
              Peta Taman
            </Link>
          </motion.div>

          {/* Minimal Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto pt-6 sm:pt-8 border-t border-white/20 px-4"
          >
            {[
              { value: "500+", label: "Spesies" },
              { value: "52", label: "Taman" },
              { value: "145", label: "Publikasi" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base md:text-lg text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border border-white/50 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/70 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
