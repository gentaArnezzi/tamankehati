"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Species {
  id: number;
  name: string;
  scientificName: string;
  type: "flora" | "fauna";
  image: string;
  status: "Kritis" | "Terancam" | "Rentan" | "Aman";
  region: string;
  description: string;
  facts: string[];
}

export function FeaturedSpeciesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const element = document.getElementById("featured-species-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const featuredSpecies: Species[] = [
    {
      id: 1,
      name: "Rafflesia Arnoldii",
      scientificName: "Rafflesia arnoldii",
      type: "flora",
      image:
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop",
      status: "Kritis",
      region: "Sumatera",
      description:
        'Bunga terbesar di dunia dengan diameter mencapai 1 meter. Dikenal sebagai "bunga bangkai" karena aromanya yang menyengat.',
      facts: [
        "Diameter bunga mencapai 100 cm dengan berat hingga 10 kg",
        "Tidak memiliki akar, batang, atau daun",
        "Hanya mekar 5-7 hari dalam setahun",
        "Parasit pada tumbuhan Tetrastigma",
      ],
    },
    {
      id: 2,
      name: "Orangutan Sumatera",
      scientificName: "Pongo abelii",
      type: "fauna",
      image:
        "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=800&h=600&fit=crop",
      status: "Kritis",
      region: "Sumatera Utara",
      description:
        "Primata besar yang hanya ditemukan di hutan Sumatera. Mereka adalah hewan paling cerdas di dunia setelah manusia.",
      facts: [
        "DNA 97% sama dengan manusia",
        "Dapat menggunakan alat untuk mencari makanan",
        "Hidup hingga 50-60 tahun di alam liar",
        "Populasi tersisa < 14,000 individu",
      ],
    },
    {
      id: 3,
      name: "Komodo",
      scientificName: "Varanus komodoensis",
      type: "fauna",
      image:
        "https://images.unsplash.com/photo-1534188753412-5de315c1f1c0?w=800&h=600&fit=crop",
      status: "Rentan",
      region: "Nusa Tenggara Timur",
      description:
        "Kadal terbesar di dunia yang hanya ditemukan di Indonesia, dapat tumbuh hingga 3 meter dan memiliki gigitan beracun.",
      facts: [
        "Panjang tubuh mencapai 3 meter",
        "Berat dapat mencapai 70 kg",
        "Dapat berlari hingga 20 km/jam",
        "Air liur mengandung 50 jenis bakteri berbahaya",
      ],
    },
    {
      id: 4,
      name: "Anggrek Hitam",
      scientificName: "Coelogyne pandurata",
      type: "flora",
      image:
        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop",
      status: "Terancam",
      region: "Kalimantan",
      description:
        "Anggrek endemik Kalimantan dengan bunga berwarna hitam yang sangat langka dan eksotis.",
      facts: [
        "Bunga berbentuk seperti biola",
        "Warna hitam sebenarnya hijau tua gelap",
        "Tumbuh di ketinggian 0-300 mdpl",
        "Mekar di musim semi",
      ],
    },
  ];

  const currentSpecies = featuredSpecies[currentIndex];

  const getStatusColor = (status: Species["status"]) => {
    switch (status) {
      case "Kritis":
        return "red";
      case "Terancam":
        return "orange";
      case "Rentan":
        return "yellow";
      case "Aman":
        return "green";
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredSpecies.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + featuredSpecies.length) % featuredSpecies.length,
    );
  };

  // Auto slide
  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section
      id="featured-species-section"
      className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4" />
            Spesies Unggulan Bulan Ini
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Kenali Spesies
            <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Prioritas Konservasi
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Setiap bulan kami menampilkan spesies unik Indonesia yang
            membutuhkan perhatian khusus untuk konservasi
          </p>
        </motion.div>

        {/* Main Slider */}
        <div className="relative max-w-6xl mx-auto">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-96 lg:h-auto">
                  <img
                    src={currentSpecies.image}
                    alt={currentSpecies.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Type Badge */}
                  <div className="absolute top-6 left-6">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border border-white/30 ${
                        currentSpecies.type === "flora"
                          ? "bg-emerald-500/90 text-white"
                          : "bg-teal-500/90 text-white"
                      }`}
                    >
                      {currentSpecies.type === "flora"
                        ? "🌿 Flora"
                        : "🦎 Fauna"}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border border-white/30 bg-${getStatusColor(currentSpecies.status)}-500/90 text-white flex items-center gap-2`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {currentSpecies.status}
                    </span>
                  </div>

                  {/* Region Info */}
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {currentSpecies.region}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-12">
                  <div className="mb-6">
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">
                      {currentSpecies.name}
                    </h3>
                    <p className="text-xl italic text-gray-500">
                      {currentSpecies.scientificName}
                    </p>
                  </div>

                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {currentSpecies.description}
                  </p>

                  {/* Facts */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-gray-900">
                        Fakta Menarik
                      </h4>
                    </div>
                    <ul className="space-y-3">
                      {currentSpecies.facts.map((fact, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {i + 1}
                          </span>
                          <span className="text-gray-600">{fact}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/${currentSpecies.type}/${currentSpecies.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-105"
                  >
                    Pelajari Lebih Lanjut
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {featuredSpecies.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`transition-all ${
                  index === currentIndex
                    ? "w-12 h-3 bg-emerald-600"
                    : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                } rounded-full`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
