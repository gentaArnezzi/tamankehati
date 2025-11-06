"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function TentangKamiHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden pt-24 md:pt-32">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        <Image
          src="/hero/forest.webp"
          alt="Taman Kehati - Konservasi Keanekaragaman Hayati Indonesia"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-emerald-800/50 to-teal-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 drop-shadow-lg">
              Tentang Kami
            </h1>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed drop-shadow-md">
              Platform nasional untuk menghimpun, mengelola, dan menyajikan data keanekaragaman hayati dari Taman Kehati di seluruh Indonesia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

