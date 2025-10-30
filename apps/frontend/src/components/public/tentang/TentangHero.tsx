"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function TentangHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-screen min-h-[800px] overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop"
          alt="Taman Kehati Indonesia"
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
        <div className="container mx-auto max-w-7xl px-12">
          <div className="max-w-6xl">
            {/* Title */}
            <h1 className="text-7xl font-thin leading-none text-white mb-16 md:text-9xl">
              Taman Kehati
            </h1>

            {/* Subtitle */}
            <div className="mb-24">
              <h2 className="text-2xl font-light text-amber-50 mb-8 md:text-3xl">
                Kawasan Konservasi Sumber Daya Alam Hayati
              </h2>
            </div>

            {/* Description */}
            <div className="max-w-5xl mb-20">
              <p className="text-lg leading-relaxed text-amber-50 font-light">
                Kawasan konservasi sumber daya alam hayati lokal di luar kawasan
                hutan yang bertujuan melestarikan spesies tumbuhan dan satwa
                asli, terutama yang terancam punah. Kawasan ini berfungsi
                sebagai pusat konservasi in-situ dan ex-situ serta menjadi
                sarana edukasi dan rekreasi bagi masyarakat.
              </p>
            </div>

            {/* Ministry Info */}
            <div className="text-amber-100 text-sm font-light">
              Dikelola oleh Kementerian Lingkungan Hidup
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Scroll Indicator */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-amber-100">
        <div className="w-6 h-10 border border-amber-200/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-amber-200/60 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
}
