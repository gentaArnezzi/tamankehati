'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Leaf, MapPin, TreePine } from 'lucide-react';

export function FloraHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 w-full h-[120%]"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        <Image
          src="/tamankehati_images/20251024_1533_Rafflesia Arnoldii Bloom_simple_compose_01k8ang6v6etwbmk1h5hx52gdh.png"
          alt="Hutan Indonesia dengan keanekaragaman flora"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Subtle bottom overlay with standard dark brown */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

      {/* Floating elements with brown theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-amber-500 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-float delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-950/40 backdrop-blur-sm border border-amber-800/30 rounded-full text-amber-50 text-sm font-medium">
                <Leaf className="w-4 h-4" />
                Katalog Flora Indonesia
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 leading-tight animate-slide-up">
              <span className="block">Flora</span>
              <span className="block font-normal text-amber-50">Kehati</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-amber-50 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300">
              Jelajahi kekayaan flora Indonesia yang menakjubkan. Dari anggrek langka hingga pohon endemik, 
              temukan keanekaragaman hayati yang menjadi kebanggaan Nusantara.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 animate-fade-in delay-700">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-light text-white mb-2">
                  500+
                </div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Spesies Terdata</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-light text-white mb-2">
                  25+
                </div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Famili Tanaman</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-light text-white mb-2">
                  <MapPin className="w-8 h-8 mx-auto" />
                </div>
                <div className="text-sm text-amber-100 uppercase tracking-wide">Seluruh Nusantara</div>
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