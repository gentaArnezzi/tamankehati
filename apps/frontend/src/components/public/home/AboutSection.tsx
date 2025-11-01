"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArcGalleryHero } from "@/components/ui/arc-gallery-hero-component";

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Array of forest and nature images from Unsplash
  const forestImages = [
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=400&auto=format&fit=crop", // tropical rainforest
    "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?q=80&w=400&auto=format&fit=crop", // colorful parrot
    "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=400&auto=format&fit=crop", // jungle ferns
    "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=400&auto=format&fit=crop", // orchid flower
    "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?q=80&w=400&auto=format&fit=crop", // butterfly macro
    "https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=400&auto=format&fit=crop", // misty jungle
    "https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=400&auto=format&fit=crop", // hummingbird
    "https://images.unsplash.com/photo-1509005084666-3cbc75184cbb?q=80&w=400&auto=format&fit=crop", // waterfall forest
    "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=400&auto=format&fit=crop", // monkey fauna
    "https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=400&auto=format&fit=crop", // palm trees
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop", // tiger wildlife
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop", // forest landscape
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] sm:min-h-[100vh] py-12 sm:py-16 md:py-20 lg:py-24 bg-white overflow-x-hidden z-0"
    >
      {/* Arc Gallery Background */}
      <div className="absolute inset-0 z-0 -top-40 overflow-x-hidden overflow-y-visible">
        <ArcGalleryHero
          images={forestImages}
          startAngle={20}
          endAngle={160}
          radiusLg={550}
          radiusMd={450}
          radiusSm={280}
          cardSizeLg={150}
          cardSizeMd={120}
          cardSizeSm={85}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex min-h-[70vh] sm:min-h-[100vh] items-end justify-center pb-12 sm:pb-16 md:pb-24 lg:pb-32 pointer-events-none">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white/95 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-slate-800 mb-8 sm:mb-12 md:mb-16 shadow-sm backdrop-blur-sm"
            >
              Selamat Datang di Taman Kehati Indonesia
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="max-w-4xl mx-auto px-4"
            >
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-relaxed text-slate-800 font-light tracking-wide">
                Sebuah benteng konservasi yang didedikasikan untuk melindungi
                dan melestarikan kekayaan flora dan fauna asli Nusantara.
                Temukan laboratorium alam kami, tempat spesies langka dirawat
                dan generasi baru terinspirasi untuk menjaga bumi.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
