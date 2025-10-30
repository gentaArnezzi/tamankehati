"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function GalleryHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <Image
          src="/tamankehati_images/task_01k8anse77f03bb23rej2dm5xz_1761295090_img_0.webp"
          alt="Galeri Keanekaragaman Hayati Indonesia"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark black overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Subtle bottom overlay with standard dark brown */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-950/40 px-6 py-3 text-sm font-medium uppercase tracking-widest backdrop-blur mb-8 text-amber-50">
              Galeri Kehati Indonesia
            </div>

            {/* Title */}
            <h1 className="text-5xl font-light leading-tight text-white mb-6 md:text-7xl">
              Galeri Konservasi
            </h1>

            {/* Description */}
            <p className="text-xl leading-relaxed text-amber-50 mb-8 max-w-2xl">
              Jelajahi koleksi foto keanekaragaman hayati Indonesia yang
              menakjubkan. Dari flora endemik hingga fauna langka, saksikan
              keindahan alam yang menjadi kebanggaan Nusantara.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 text-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm font-medium">500+ Foto Terdata</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium">Flora & Fauna</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                <span className="text-sm font-medium">Seluruh Nusantara</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-amber-100">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border border-amber-200/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-amber-200/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
