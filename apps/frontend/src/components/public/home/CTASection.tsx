'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('cta-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="cta-section" className="relative py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero/forest.webp"
          alt="Hutan Indonesia"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-blue-900/80" />
      </div>

      <div className="relative container mx-auto max-w-7xl px-6">
        <div className={`text-center text-white transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl font-light mb-6 md:text-5xl">
            Bergabunglah dengan Misi Konservasi
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-white/90 mb-12">
            Jelajahi keanekaragaman hayati Indonesia, pelajari tentang konservasi, 
            dan dukung upaya pelestarian untuk masa depan yang berkelanjutan.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/flora"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 text-lg font-light text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              🌿 Jelajahi Flora
            </Link>
            <Link
              href="/fauna"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-lg font-light text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
            >
              🐾 Lihat Fauna
            </Link>
            <Link
              href="/taman"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-lg font-light text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
            >
              🌳 Peta Taman
            </Link>
          </div>
        </div>

        {/* Floating Cards */}
        <div className={`mt-16 grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-light text-white mb-2">Penelitian</h3>
            <p className="text-white/80 text-sm">
              Dukung penelitian keanekaragaman hayati dan konservasi
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-light text-white mb-2">Edukasi</h3>
            <p className="text-white/80 text-sm">
              Pelajari tentang pentingnya konservasi dan pelestarian
            </p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-light text-white mb-2">Aksi</h3>
            <p className="text-white/80 text-sm">
              Ambil bagian dalam program konservasi dan pelestarian
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
