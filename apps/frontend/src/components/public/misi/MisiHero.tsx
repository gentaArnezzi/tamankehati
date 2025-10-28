'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowDown, TreePine, Leaf, PawPrint } from 'lucide-react';

export function MisiHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen min-h-[800px] overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-16 h-16 bg-green-500/20 rounded-full blur-sm"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute top-40 right-20 w-12 h-12 bg-blue-500/20 rounded-full blur-sm"
          style={{
            transform: `translateY(${scrollY * 0.15}px)`,
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute bottom-40 left-1/4 w-8 h-8 bg-emerald-500/20 rounded-full blur-sm"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            animation: 'float 10s ease-in-out infinite'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="max-w-6xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
              <TreePine className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Misi Konservasi</span>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-light leading-none text-white mb-8">
              Misi Kami
            </h1>

            {/* Subtitle */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-6">
                Melestarikan Keanekaragaman Hayati Indonesia
              </h2>
              <p className="text-lg text-white/80 max-w-4xl leading-relaxed">
                Kami berkomitmen untuk melindungi dan melestarikan keanekaragaman hayati Indonesia 
                melalui teknologi, kolaborasi, dan aksi nyata yang berkelanjutan.
              </p>
            </div>

            {/* Mission Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Konservasi Flora</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <PawPrint className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Konservasi Fauna</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <TreePine className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Ekosistem Berkelanjutan</span>
              </div>
            </div>

            {/* Ministry Info */}
            <div className="text-white/60 text-sm font-light">
              Dikelola oleh Kementerian Lingkungan Hidup dan Kehutanan
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-light">Scroll untuk eksplorasi</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}
