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
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 lg:px-6 xl:px-8 py-1.5 sm:py-2 lg:py-4 xl:py-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 2rem)' }}>
              Database Keanekaragaman Hayati Indonesia
            </span>
          </motion.div>

          {/* Main Heading - Smaller, More Elegant */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-bold tracking-tight text-white px-2 leading-tight"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 4rem)' }}
          >
            Jelajahi Flora & Fauna
            <span className="block mt-1 sm:mt-2">Nusantara</span>
          </motion.h1>

          {/* Subtitle - Smaller */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/90 max-w-2xl mx-auto leading-relaxed px-4"
            style={{ fontSize: 'clamp(1rem, 2vw, 2rem)' }}
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
              <Search className="absolute left-4 sm:left-6 lg:left-8 xl:left-10 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-gray-500 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari spesies, taman, atau artikel..."
                className="w-full pl-12 sm:pl-14 lg:pl-20 xl:pl-24 pr-4 py-3 sm:py-4 lg:py-6 xl:py-8 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl text-sm sm:text-base md:text-lg lg:text-3xl xl:text-4xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-lg"
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
              prefetch={true}
              className="group inline-flex items-center gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-white text-gray-900 rounded-lg hover:bg-white/90 transition-all shadow-lg text-sm sm:text-base md:text-lg lg:text-3xl xl:text-4xl"
            >
              Jelajahi Flora
              <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 lg:w-6 lg:h-6 xl:w-8 xl:h-8 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/fauna"
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 lg:py-4 xl:py-5 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg lg:text-3xl xl:text-4xl"
            >
              Jelajahi Fauna
            </Link>
            <Link
              href="/taman"
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 lg:py-4 xl:py-5 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg lg:text-3xl xl:text-4xl"
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
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-6xl xl:text-7xl font-semibold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base md:text-lg lg:text-3xl xl:text-4xl text-white/70">{stat.label}</div>
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
