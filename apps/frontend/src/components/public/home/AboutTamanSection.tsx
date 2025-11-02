"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AboutTamanSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      quote:
        "Taman Kehati adalah inisiatif konservasi di tingkat daerah yang fokus pada penyelamatan dan pemulihan spesies lokal. Mengoleksi, menumbuhkan, dan merawat tanaman serta satwa yang mewakili identitas ekoregion setempat.",
      name: "Konservasi Keanekaragaman Hayati",
      designation: "Melindungi & Melestarikan Spesies Lokal",
      src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2071&auto=format&fit=crop",
    },
    {
      quote:
        "Mendorong edukasi lingkungan dan riset yang bertanggung jawab. Program pembelajaran yang mengajarkan pentingnya menjaga keseimbangan ekosistem dan keanekaragaman hayati.",
      name: "Edukasi Lingkungan",
      designation: "Pembelajaran & Riset Berkelanjutan",
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop",
    },
    {
      quote:
        "Masyarakat dapat terlibat melalui kegiatan penanaman, pengamatan biodiversitas, hingga program relawan. Wisata alam yang bertanggung jawab untuk meningkatkan kesadaran lingkungan.",
      name: "Partisipasi Masyarakat",
      designation: "Keterlibatan Aktif Komunitas",
      src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop",
    },
  ];

  return (
    <section
      ref={ref}
      className="pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-16 sm:pb-24 md:pb-32 bg-white overflow-hidden relative z-0"
    >
      {/* Title Section - Centered with container */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 sm:mb-6"
          >
            Apa itu Taman Kehati?
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-1 bg-emerald-500 mx-auto rounded-full"
          />
        </div>
      </div>

      {/* Animated Testimonials - Full Width, No Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <AnimatedTestimonials testimonials={features} autoplay={true} />
      </motion.div>

      {/* Bottom Badge - Centered with container */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 sm:mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-emerald-600 font-medium px-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Pelajari lebih lanjut tentang program konservasi kami</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
