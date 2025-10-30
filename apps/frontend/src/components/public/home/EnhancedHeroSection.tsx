"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, MapPin, Leaf, Bird } from "lucide-react";

export function EnhancedHeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "flora" | "fauna" | "taman"
  >("all");
  const { scrollY } = useScroll();

  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const baseUrl = searchType === "all" ? "/search" : `/${searchType}`;
      window.location.href = `${baseUrl}?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative isolate overflow-hidden min-h-screen w-full -mt-20 pt-20">
      {/* Background Image with Parallax */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src="/home/hero.jpg"
          alt="Taman Kehati Indonesia - Keanekaragaman Hayati"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
      </motion.div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative flex min-h-screen w-full items-center"
      >
        <div className="container mx-auto max-w-7xl px-6 py-32 md:py-40">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Badge with animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Portal Database Keanekaragaman Hayati Indonesia
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl"
            >
              Jelajahi
              <span className="block bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
                Kekayaan Hayati
              </span>
              Nusantara
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl leading-relaxed text-white/90 max-w-4xl mx-auto"
            >
              Database terpadu flora, fauna, dan taman konservasi Indonesia.
              Dukung riset, edukasi, dan aksi konservasi melalui data yang
              akurat dan terpercaya.
            </motion.p>

            {/* Advanced Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12"
            >
              <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                <div className="relative group">
                  {/* Search Type Tabs */}
                  <div className="flex gap-2 mb-4 justify-center">
                    {[
                      { value: "all", label: "Semua", icon: Search },
                      { value: "flora", label: "Flora", icon: Leaf },
                      { value: "fauna", label: "Fauna", icon: Bird },
                      { value: "taman", label: "Taman", icon: MapPin },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setSearchType(type.value as any)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          searchType === type.value
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                            : "bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                    <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                      <Search className="absolute left-6 w-6 h-6 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Cari ${searchType === "all" ? "flora, fauna, atau taman" : searchType}... (contoh: Rafflesia, Orangutan, Taman Nasional)`}
                        className="flex-1 px-16 py-5 text-lg bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="submit"
                        className="m-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all hover:scale-105 shadow-lg"
                      >
                        Cari
                      </button>
                    </div>
                  </div>

                  {/* Quick Search Suggestions */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-white/60 text-sm">Popular:</span>
                    {[
                      "Rafflesia",
                      "Orangutan",
                      "Komodo",
                      "Anggrek Hitam",
                      "Jalak Bali",
                    ].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm hover:bg-white/20 transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center justify-center"
            >
              <Link
                href="/flora"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-10 py-5 text-lg font-semibold text-white transition-all hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105"
              >
                <Leaf className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Jelajahi Flora
              </Link>
              <Link
                href="/fauna"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-10 py-5 text-lg font-semibold text-white transition-all hover:shadow-2xl hover:shadow-teal-500/50 hover:scale-105"
              >
                <Bird className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                Jelajahi Fauna
              </Link>
              <Link
                href="/taman"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-10 py-5 text-lg font-semibold text-white transition-all hover:bg-white/20 hover:scale-105"
              >
                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Lihat Peta Taman
              </Link>
            </motion.div>

            {/* Stats Quick View */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto"
            >
              {[
                { number: "500+", label: "Spesies" },
                { number: "50+", label: "Taman Kehati" },
                { number: "100+", label: "Penelitian" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm">Scroll untuk jelajahi</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
    </section>
  );
}
