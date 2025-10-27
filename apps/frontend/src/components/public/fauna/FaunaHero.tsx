'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function FaunaHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          src="/tamankehati_images/task_01k8anqy76ef2rnp472k1c202d_1761294984_img_0.webp"
          alt="Hutan Indonesia dengan keanekaragaman fauna"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-6 py-3 text-sm font-medium uppercase tracking-widest backdrop-blur mb-8 text-black">
              Atlas Fauna Indonesia
            </div>

            {/* Title */}
            <h1 className="text-5xl font-light leading-tight text-white mb-6 md:text-7xl">
              Fauna Kehati
            </h1>

            {/* Description */}
            <p className="text-xl leading-relaxed text-white/90 mb-8 max-w-2xl">
              Temukan keanekaragaman fauna Indonesia yang menakjubkan. Dari burung endemik hingga mamalia langka, 
              jelajahi kekayaan satwa liar yang menjadi kebanggaan Nusantara.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-sm font-medium">300+ Spesies Terdata</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium">50+ Famili Hewan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Seluruh Nusantara</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
